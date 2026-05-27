import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { SiweMessage } from 'siwe';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { NonceStore } from './siwe/nonce.store';
import { ExtensionPairCodeStore } from './extension-pair-code.store';
import { ExtensionTokenService } from './extension-token.service';
import { AuthUser, AuthTokens, TokenPayload } from '@crypto-tracker/shared';
import { PortfolioService } from '../portfolio/portfolio.service';

export type SiweVerifyResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly nonceStore: NonceStore,
    private readonly extensionPairCodeStore: ExtensionPairCodeStore,
    private readonly extensionTokenService: ExtensionTokenService,
    private readonly portfolioService: PortfolioService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    return { id: user.id, email: user.email };
  }

  async register(dto: RegisterDto): Promise<AuthTokens & { user: AuthUser }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ email: dto.email, passwordHash });
    const tokens = await this.generateTokens({ sub: user.id, email: user.email });
    await this.createSession(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  async login(user: AuthUser): Promise<AuthTokens & { user: AuthUser }> {
    const tokens = await this.generateTokens({ sub: user.id, email: user.email });
    await this.createSession(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.generateTokens({ sub: session.user.id, email: session.user.email });
    await this.createSession(session.user.id, tokens.refreshToken);
    return tokens;
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return { id: user.id, email: user.email };
  }

  createExtensionPairCode(userId: string): { code: string; expiresAt: string } {
    const { code, expiresAt } = this.extensionPairCodeStore.allocate(userId);
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  async getExtensionStatus(userId: string) {
    const now = new Date();
    const rows = await this.extensionTokenService.listForUser(userId);
    const active = rows.filter((row) => !row.expiresAt || row.expiresAt >= now);
    return {
      connected: active.length > 0,
      connections: active.map((row) => ({
        id: row.id,
        label: row.label,
        lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async disconnectExtension(userId: string): Promise<{ revoked: number }> {
    const revoked = await this.extensionTokenService.revokeAllForUser(userId);
    return { revoked };
  }

  async disconnectCurrentExtension(rawToken: string): Promise<{ revoked: number }> {
    const revoked = await this.extensionTokenService.revokeByRawToken(rawToken);
    return { revoked: revoked ? 1 : 0 };
  }

  async pairExtension(code: string): Promise<{ token: string }> {
    const normalized = code.trim();
    if (!/^\d{6}$/.test(normalized)) {
      throw new BadRequestException('Invalid pair code format');
    }
    const consumed = this.extensionPairCodeStore.consume(normalized);
    if (!consumed) {
      throw new UnauthorizedException('Invalid or expired pair code');
    }
    const user = await this.usersService.findById(consumed.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const token = await this.extensionTokenService.issueToken(user.id);
    return { token };
  }

  generateNonce(): string {
    return this.nonceStore.generate();
  }

  async verifySiwe(message: string, signature: string): Promise<SiweVerifyResult> {
    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
    } catch (err) {
      throw new BadRequestException(
        `Malformed SIWE message: ${err instanceof Error ? err.message : 'parse error'}`,
      );
    }

    if (!this.nonceStore.consume(siweMessage.nonce)) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    const result = await siweMessage.verify({ signature });
    if (!result.success) {
      throw new UnauthorizedException('Invalid SIWE signature');
    }

    const address = siweMessage.address.toLowerCase();
    const siweEmail = `${address}@wallet.metaspend.app`;

    // Maintain backward-compatible synthetic email so existing users keep their data.
    const legacyEmail = `${address}@wallet.siwe`;
    let user =
      (await this.usersService.findByEmail(siweEmail)) ??
      (await this.usersService.findByEmail(legacyEmail));

    if (!user) {
      user = await this.usersService.create({ email: legacyEmail });
    }

    await this.portfolioService.setPrimaryAddress(user.id, address);

    const tokens = await this.generateTokens({ sub: user.id, email: user.email });
    await this.createSession(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>('jwt.secret')!;
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    const accessExpiry = this.configService.get<string>('jwt.accessExpiresIn') ?? '15m';
    const refreshExpiry = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiry as `${number}${'s' | 'm' | 'h' | 'd'}` }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiry as `${number}${'s' | 'm' | 'h' | 'd'}` }),
    ]);
    return { accessToken, refreshToken };
  }

  private async createSession(userId: string, rawRefreshToken: string) {
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const days = parseInt(refreshExpiresIn.replace('d', ''), 10);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: { userId, refreshTokenHash: this.hashToken(rawRefreshToken), expiresAt },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

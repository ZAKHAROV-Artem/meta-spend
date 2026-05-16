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
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { NonceStore } from './siwe/nonce.store';
import { ExtensionPairCodeStore } from './extension-pair-code.store';
import { ExtensionTokenService } from './extension-token.service';
import { AuthUser, AuthTokens, TokenPayload } from '@crypto-tracker/shared';
import { PortfolioService } from '../portfolio/portfolio.service';

export type SiweVerifyResult = {
  /** Supabase session access token (returned when SUPABASE_* env vars are set). */
  supabaseAccessToken?: string;
  /** Supabase session refresh token (returned when SUPABASE_* env vars are set). */
  supabaseRefreshToken?: string;
  /** Legacy access token (fallback when Supabase is not configured). */
  accessToken?: string;
  /** Legacy refresh token (fallback when Supabase is not configured). */
  refreshToken?: string;
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
    const siweMessage = new SiweMessage(message);

    if (!this.nonceStore.consume(siweMessage.nonce)) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    const result = await siweMessage.verify({ signature });
    if (!result.success) {
      throw new UnauthorizedException('Invalid SIWE signature');
    }

    const address = siweMessage.address.toLowerCase();
    const siweEmail = `${address}@wallet.metaspend.app`;

    // Try Supabase integration first
    const supabaseSession = await this.tryMintSupabaseSessionForSiwe({ address, siweEmail });

    if (supabaseSession) {
      // Provision/link local user using the Supabase ID
      const user = await this.usersService.provisionFromSupabase({
        supabaseId: supabaseSession.supabaseUserId,
        email: siweEmail,
      });
      await this.portfolioService.setPrimaryAddress(user.id, address);
      return {
        supabaseAccessToken: supabaseSession.accessToken,
        supabaseRefreshToken: supabaseSession.refreshToken,
        user: { id: user.id, email: user.email },
      };
    }

    // Fallback: legacy JWT path (Supabase not configured)
    // Maintain backward-compatible synthetic email so existing users keep their data.
    const legacyEmail = `${address}@wallet.siwe`;
    let user =
      (await this.usersService.findByEmail(legacyEmail)) ??
      (await this.usersService.findByEmail(siweEmail));
    if (!user) {
      user = await this.usersService.create({ email: legacyEmail });
    }

    await this.portfolioService.setPrimaryAddress(user.id, address);

    const tokens = await this.generateTokens({ sub: user.id, email: user.email });
    await this.createSession(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  private async tryMintSupabaseSessionForSiwe(params: {
    address: string;
    siweEmail: string;
  }): Promise<{ accessToken: string; refreshToken: string; supabaseUserId: string } | null> {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');
    if (!supabaseUrl || !serviceRoleKey) return null;

    let admin: SupabaseClient;
    try {
      admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } catch (err) {
      this.logger.warn(`Failed to construct Supabase admin client: ${(err as Error).message}`);
      return null;
    }

    try {
      // Find existing Supabase user with this synthetic email.
      // listUsers is paginated; we search across pages until we either find it or exhaust.
      const supabaseUser = await this.findSupabaseUserByEmail(admin, params.siweEmail);
      let supabaseUserId: string | undefined = supabaseUser?.id;

      if (!supabaseUserId) {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: params.siweEmail,
          email_confirm: true,
          user_metadata: { wallet_address: params.address },
        });
        if (createErr || !created?.user) {
          this.logger.warn(`Supabase admin.createUser failed: ${createErr?.message ?? 'unknown'}`);
          return null;
        }
        supabaseUserId = created.user.id;
      }

      // Generate a magic link, then exchange its hashed token for a session.
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: params.siweEmail,
      });
      if (linkErr || !linkData?.properties?.hashed_token) {
        this.logger.warn(
          `Supabase admin.generateLink failed: ${linkErr?.message ?? 'no hashed_token'}`,
        );
        return null;
      }

      const { data: sessionData, error: verifyErr } = await admin.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: 'magiclink',
      });
      if (verifyErr || !sessionData?.session) {
        this.logger.warn(`Supabase verifyOtp failed: ${verifyErr?.message ?? 'no session'}`);
        return null;
      }

      return {
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        supabaseUserId,
      };
    } catch (err) {
      this.logger.error(`Supabase SIWE provisioning failed: ${(err as Error).message}`);
      return null;
    }
  }

  private async findSupabaseUserByEmail(
    admin: SupabaseClient,
    email: string,
  ): Promise<{ id: string } | null> {
    // listUsers paginates; cap at a few pages to bound work.
    const PAGE_SIZE = 100;
    const MAX_PAGES = 50;
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
      if (error) {
        this.logger.warn(`Supabase admin.listUsers failed: ${error.message}`);
        return null;
      }
      const match = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (match) return { id: match.id };
      if (!data?.users || data.users.length < PAGE_SIZE) return null;
    }
    return null;
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

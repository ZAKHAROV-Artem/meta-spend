import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUser, TokenPayload } from '@metaspend/shared';
import { ExtensionTokenService } from '../../auth/extension-token.service';
import { UsersService } from '../../users/users.service';

type RequestWithUser = {
  headers: { authorization?: string };
  user?: AuthUser;
};

@Injectable()
export class JwtOrExtensionAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly extensionTokenService: ExtensionTokenService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice(7).trim();
    const jwtSecret = this.configService.get<string>('jwt.secret') ?? '';

    // Path 1: standard JWT (signed with jwt.secret)
    if (jwtSecret) {
      try {
        const payload = this.jwtService.verify<TokenPayload>(token, { secret: jwtSecret });
        const user = await this.usersService.findById(payload.sub);
        if (user) {
          request.user = { id: user.id, email: user.email, defaultCurrency: user.defaultCurrency ?? null };
          return true;
        }
      } catch {
        // fall through to extension token path
      }
    }

    // Path 2: extension token (hashed bearer token in ExtensionToken table)
    const extensionUser = await this.extensionTokenService.validateAndTouch(token);
    if (!extensionUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request.user = extensionUser;
    return true;
  }
}

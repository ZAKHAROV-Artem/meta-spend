import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUser, TokenPayload } from '@crypto-tracker/shared';
import { ExtensionTokenService } from '../../auth/extension-token.service';

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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice(7).trim();
    const secret = this.configService.get<string>('jwt.secret') ?? '';

    try {
      const payload = this.jwtService.verify<TokenPayload>(token, { secret });
      request.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      const user = await this.extensionTokenService.validateAndTouch(token);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      request.user = user;
      return true;
    }
  }
}

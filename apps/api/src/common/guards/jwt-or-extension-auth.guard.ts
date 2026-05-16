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
import { UsersService } from '../../users/users.service';

type RequestWithUser = {
  headers: { authorization?: string };
  user?: AuthUser;
};

/**
 * Supabase-issued JWT payload (HS256 signed with SUPABASE_JWT_SECRET).
 * `sub` is the Supabase auth user UUID.
 */
interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  user_metadata?: { email?: string };
  app_metadata?: Record<string, unknown>;
}

type AnyJwtPayload = TokenPayload | SupabaseJwtPayload;

function looksLikeSupabasePayload(payload: AnyJwtPayload): payload is SupabaseJwtPayload {
  return (
    typeof (payload as SupabaseJwtPayload).aud === 'string' &&
    (payload as SupabaseJwtPayload).aud === 'authenticated'
  );
}

function decodeUnverified(token: string): AnyJwtPayload | null {
  try {
    const segments = token.split('.');
    if (segments.length < 2 || !segments[1]) return null;
    const json = Buffer.from(segments[1], 'base64url').toString('utf8');
    return JSON.parse(json) as AnyJwtPayload;
  } catch {
    return null;
  }
}

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
    const legacySecret = this.configService.get<string>('jwt.secret') ?? '';
    const supabaseSecret = this.configService.get<string>('supabase.jwtSecret') ?? '';

    // Peek at the unverified payload to decide which secret to try first.
    const unverified = decodeUnverified(token);

    if (unverified && looksLikeSupabasePayload(unverified) && supabaseSecret) {
      try {
        const payload = this.jwtService.verify<SupabaseJwtPayload>(token, {
          secret: supabaseSecret,
        });
        const email = payload.email ?? payload.user_metadata?.email;
        if (!email) {
          throw new UnauthorizedException('Supabase token is missing an email claim');
        }
        const user = await this.usersService.provisionFromSupabase({
          supabaseId: payload.sub,
          email,
        });
        request.user = { id: user.id, email: user.email };
        return true;
      } catch {
        // fall through to legacy / extension paths
      }
    }

    if (legacySecret) {
      try {
        const payload = this.jwtService.verify<TokenPayload>(token, { secret: legacySecret });
        request.user = { id: payload.sub, email: payload.email };
        return true;
      } catch {
        // fall through to extension token path
      }
    }

    const extensionUser = await this.extensionTokenService.validateAndTouch(token);
    if (!extensionUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request.user = extensionUser;
    return true;
  }
}

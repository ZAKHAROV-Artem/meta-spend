import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '@crypto-tracker/shared';
import { UsersService } from '../../users/users.service';

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

/**
 * Legacy backend-issued JWT payload (HS256 signed with JWT_SECRET).
 * `sub` is the local User.id (cuid).
 */
interface LegacyJwtPayload {
  sub: string;
  email: string;
  exp?: number;
  iat?: number;
}

type AnyJwtPayload = SupabaseJwtPayload | LegacyJwtPayload;

function looksLikeSupabasePayload(payload: AnyJwtPayload): payload is SupabaseJwtPayload {
  // Supabase tokens carry `aud: 'authenticated'` (or similar) — legacy ones don't.
  return typeof (payload as SupabaseJwtPayload).aud === 'string';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const supabaseJwtSecret = configService.get<string>('supabase.jwtSecret') ?? '';
    const legacyJwtSecret = configService.get<string>('jwt.secret') ?? 'fallback-secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // We provide both secrets via secretOrKeyProvider so a single strategy can
      // verify Supabase and legacy tokens during migration.
      secretOrKeyProvider: (
        _req: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string) => void,
      ) => {
        try {
          const segments = rawJwtToken.split('.');
          if (segments.length < 2 || !segments[1]) {
            return done(new Error('Malformed JWT'));
          }
          const payloadJson = Buffer.from(segments[1], 'base64url').toString('utf8');
          const parsed = JSON.parse(payloadJson) as AnyJwtPayload;
          if (looksLikeSupabasePayload(parsed) && supabaseJwtSecret) {
            return done(null, supabaseJwtSecret);
          }
          return done(null, legacyJwtSecret);
        } catch (err) {
          return done(err instanceof Error ? err : new Error('Token decode failed'));
        }
      },
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  async validate(payload: AnyJwtPayload): Promise<AuthUser> {
    if (looksLikeSupabasePayload(payload)) {
      const email = payload.email ?? payload.user_metadata?.email;
      if (!email) {
        throw new UnauthorizedException('Supabase token is missing an email claim');
      }
      const user = await this.usersService.provisionFromSupabase({
        supabaseId: payload.sub,
        email,
      });
      return { id: user.id, email: user.email };
    }

    const legacy = payload as LegacyJwtPayload;
    return { id: legacy.sub, email: legacy.email };
  }
}

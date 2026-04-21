import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload, AuthUser } from '@crypto-tracker/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret') ?? 'fallback-secret',
      ignoreExpiration: false,
    });
  }

  validate(payload: TokenPayload): AuthUser {
    return { id: payload.sub, email: payload.email };
  }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NonceStore } from './siwe/nonce.store';
import { ExtensionPairCodeStore } from './extension-pair-code.store';
import { ExtensionTokenService } from './extension-token.service';
import { UsersModule } from '../users/users.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), PortfolioModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    NonceStore,
    ExtensionPairCodeStore,
    ExtensionTokenService,
  ],
  exports: [JwtModule, AuthService, ExtensionPairCodeStore, ExtensionTokenService],
})
export class AuthModule {}

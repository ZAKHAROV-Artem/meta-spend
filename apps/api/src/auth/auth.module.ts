import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NonceStore } from './siwe/nonce.store';
import { ExtensionPairCodeStore } from './extension-pair-code.store';
import { ExtensionTokenService } from './extension-token.service';
import { ExtensionStatusEvents } from './extension-status-events';
import { UsersModule } from '../users/users.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { JwtOrExtensionAuthGuard } from '../common/guards/jwt-or-extension-auth.guard';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), forwardRef(() => PortfolioModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    NonceStore,
    ExtensionPairCodeStore,
    ExtensionTokenService,
    ExtensionStatusEvents,
    JwtOrExtensionAuthGuard,
  ],
  exports: [JwtModule, AuthService, ExtensionPairCodeStore, ExtensionTokenService],
})
export class AuthModule {}

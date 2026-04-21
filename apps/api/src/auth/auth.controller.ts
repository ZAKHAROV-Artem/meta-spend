import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SiweVerifyDto } from './dto/siwe-verify.dto';
import { ExtensionPairDto } from './dto/extension-pair.dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '@crypto-tracker/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@CurrentUser() user: AuthUser) {
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }

  @Get('siwe/nonce')
  getSiweNonce() {
    return { nonce: this.authService.generateNonce() };
  }

  @Post('siwe/verify')
  @HttpCode(HttpStatus.OK)
  verifySiwe(@Body() dto: SiweVerifyDto) {
    return this.authService.verifySiwe(dto.message, dto.signature);
  }

  @UseGuards(JwtAuthGuard)
  @Post('extension/pair-code')
  @HttpCode(HttpStatus.OK)
  createExtensionPairCode(@CurrentUser() user: AuthUser) {
    return this.authService.createExtensionPairCode(user.id);
  }

  @Post('extension/pair')
  @HttpCode(HttpStatus.OK)
  pairExtension(@Body() dto: ExtensionPairDto) {
    return this.authService.pairExtension(dto.code);
  }
}

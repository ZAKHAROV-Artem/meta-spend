import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '@crypto-tracker/shared';
import { SyncService } from '../transactions/sync/sync.service';

@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly syncService: SyncService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.walletsService.findByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(user.id, dto);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  sync(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.syncService.syncWallet(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.walletsService.remove(user.id, id);
  }
}

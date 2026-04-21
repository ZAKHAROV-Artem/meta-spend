import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthUser } from '@crypto-tracker/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ConnectPortfolioDto } from './dto/connect-portfolio.dto';
import { PortfolioService } from './portfolio.service';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser) {
    return this.portfolioService.getOverview(user.id);
  }

  @Get('sync-status')
  syncStatus(@CurrentUser() user: AuthUser) {
    return this.portfolioService.getSyncStatus(user.id);
  }

  @Post('refresh')
  refresh(@CurrentUser() user: AuthUser) {
    return this.portfolioService.refresh(user.id);
  }

  @Post('connect')
  connect(@CurrentUser() user: AuthUser, @Body() dto: ConnectPortfolioDto) {
    return this.portfolioService.connect(user.id, dto.address);
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthUser } from '@crypto-tracker/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser) {
    return this.portfolioService.getOverview(user.id);
  }
}

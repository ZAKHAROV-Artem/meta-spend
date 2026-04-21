import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from '@crypto-tracker/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() dto: ListTransactionsDto) {
    return this.transactionsService.list(user.id, dto);
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser, @Query() dto: StatsQueryDto) {
    return this.transactionsService.stats(user.id, dto);
  }

  @Patch(':id')
  updateOne(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.updateOne(user.id, id, dto);
  }
}

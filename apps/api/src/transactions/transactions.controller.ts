import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { CardCategorizationRunDto } from '@crypto-tracker/shared';
import { AuthUser } from '@crypto-tracker/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CardCategorizationRunService } from '../card-transactions/card-categorization-run.service';
import { BulkCategorizeDto } from './dto/bulk-categorize.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { UpdateCardMerchantCategoryDto } from './dto/update-card-merchant-category.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UniqueMerchantsQueryDto } from './dto/unique-merchants-query.dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly cardCategorizationRunService: CardCategorizationRunService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() dto: ListTransactionsDto) {
    return this.transactionsService.list(user.id, dto);
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser, @Query() dto: StatsQueryDto) {
    return this.transactionsService.stats(user.id, dto);
  }

  @Get('card-merchants')
  cardMerchants(@CurrentUser() user: AuthUser) {
    return this.transactionsService.cardMerchants(user.id);
  }

  @Get('unique-merchants')
  uniqueMerchants(@CurrentUser() user: AuthUser, @Query() dto: UniqueMerchantsQueryDto) {
    return this.transactionsService.uniqueMerchants(user.id, dto);
  }

  @Post('bulk-categorize')
  bulkCategorize(@CurrentUser() user: AuthUser, @Body() dto: BulkCategorizeDto) {
    return this.transactionsService.bulkCategorize(user.id, dto);
  }

  @Get('categorization-runs')
  listCategorizationRuns(@CurrentUser() user: AuthUser): Promise<CardCategorizationRunDto[]> {
    return this.cardCategorizationRunService.listRuns(user.id);
  }

  @Patch('card-merchants/:key/category')
  updateCardMerchantCategory(
    @CurrentUser() user: AuthUser,
    @Param('key') key: string,
    @Body() dto: UpdateCardMerchantCategoryDto,
  ) {
    return this.transactionsService.updateCardMerchantCategory(user.id, key, dto);
  }

  @Patch(':id')
  updateOne(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.updateOne(user.id, id, dto);
  }
}

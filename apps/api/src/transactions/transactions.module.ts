import { Module, forwardRef } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CardTransactionsModule } from '../card-transactions/card-transactions.module';
import { ExchangeRateService } from '../common/exchange-rate/exchange-rate.service';

@Module({
  imports: [forwardRef(() => CardTransactionsModule)],
  controllers: [TransactionsController],
  providers: [TransactionsService, ExchangeRateService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

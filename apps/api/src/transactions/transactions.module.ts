import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { EtherscanService } from './sync/etherscan.service';
import { NormalizerService } from './sync/normalizer.service';
import { PriceService } from './sync/price.service';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    EtherscanService,
    NormalizerService,
    PriceService,
    SyncService,
    TransactionsService,
  ],
  exports: [SyncService, TransactionsService, PriceService],
})
export class TransactionsModule {}

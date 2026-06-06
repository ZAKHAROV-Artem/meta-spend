import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { ExchangeRateService } from '../common/exchange-rate/exchange-rate.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService, ExchangeRateService],
})
export class TripsModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtOrExtensionAuthGuard } from '../common/guards/jwt-or-extension-auth.guard';
import { CardTransactionsController } from './card-transactions.controller';
import { CardTransactionsService } from './card-transactions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CardTransactionsController],
  providers: [CardTransactionsService, JwtOrExtensionAuthGuard],
})
export class CardTransactionsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtOrExtensionAuthGuard } from '../common/guards/jwt-or-extension-auth.guard';
import { CardTransactionsController } from './card-transactions.controller';
import { CardTransactionsService } from './card-transactions.service';
import { CardCategorizationRunService } from './card-categorization-run.service';
import { CardMerchantOpenAiService } from '../transactions/card-merchant-openai.service';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [CardTransactionsController],
  providers: [
    CardTransactionsService,
    CardCategorizationRunService,
    CardMerchantOpenAiService,
    JwtOrExtensionAuthGuard,
  ],
  exports: [CardTransactionsService, CardCategorizationRunService],
})
export class CardTransactionsModule {}

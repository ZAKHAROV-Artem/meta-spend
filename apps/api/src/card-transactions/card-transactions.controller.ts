import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '@crypto-tracker/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtOrExtensionAuthGuard } from '../common/guards/jwt-or-extension-auth.guard';
import { ListCardTransactionsDto } from './dto/list-card-transactions.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardTransactionsService } from './card-transactions.service';

@UseGuards(JwtOrExtensionAuthGuard)
@Controller('card-transactions')
export class CardTransactionsController {
  constructor(private readonly cardTransactionsService: CardTransactionsService) {}

  @Post('sync')
  sync(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.cardTransactionsService.sync(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() dto: ListCardTransactionsDto) {
    return this.cardTransactionsService.list(user.id, dto);
  }

  @Patch(':id')
  updateOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCardTransactionDto,
  ) {
    return this.cardTransactionsService.updateOne(user.id, id, dto);
  }
}

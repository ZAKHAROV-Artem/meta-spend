import { Type } from 'class-transformer';
import { CardTxStatus, TxType } from '@crypto-tracker/db';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListTransactionsDto {
  @IsOptional()
  @IsIn(['HOLDINGS', 'CARD'])
  source?: 'HOLDINGS' | 'CARD';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chainId?: number;

  @IsOptional()
  @IsEnum(TxType)
  txType?: TxType;

  @IsOptional()
  @IsEnum(CardTxStatus)
  status?: CardTxStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}

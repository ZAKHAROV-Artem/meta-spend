import { ArrayUnique, IsArray, IsOptional, IsString } from 'class-validator';

export class TripSelectionDto {
  @IsOptional()
  @IsString()
  startTransactionId?: string;

  @IsOptional()
  @IsString()
  endTransactionId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  includeTransactionIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  excludeTransactionIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  transactionIds?: string[];
}

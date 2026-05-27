import { IsOptional, IsString } from 'class-validator';

export class UpdateCardTransactionDto {
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  subcategoryId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

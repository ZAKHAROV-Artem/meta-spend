import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}

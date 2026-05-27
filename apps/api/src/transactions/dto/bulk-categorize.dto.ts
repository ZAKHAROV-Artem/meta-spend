import { IsIn, IsOptional, IsString } from 'class-validator';

export class BulkCategorizeDto {
  @IsString()
  key!: string;

  @IsIn(['CARD'])
  source!: 'CARD';

  @IsOptional()
  @IsString()
  categoryId!: string | null;
}

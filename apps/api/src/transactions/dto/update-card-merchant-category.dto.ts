import { IsOptional, IsString } from 'class-validator';

export class UpdateCardMerchantCategoryDto {
  @IsOptional()
  @IsString()
  categoryId?: string | null;
}

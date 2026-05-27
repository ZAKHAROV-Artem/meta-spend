import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name!: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a valid hex color' })
  color!: string;

  @IsString()
  @MinLength(1)
  icon!: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

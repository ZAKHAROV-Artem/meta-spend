import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsString()
  @Length(3, 3)
  defaultCurrency?: string | null;
}

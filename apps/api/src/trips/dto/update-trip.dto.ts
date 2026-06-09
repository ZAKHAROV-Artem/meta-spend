import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2,8}$/)
  currency?: string;
}

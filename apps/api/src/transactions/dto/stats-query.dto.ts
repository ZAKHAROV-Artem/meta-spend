import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class StatsQueryDto {
  @IsOptional()
  @IsIn(['HOLDINGS', 'CARD', 'ALL'])
  source?: 'HOLDINGS' | 'CARD' | 'ALL';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chainId?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

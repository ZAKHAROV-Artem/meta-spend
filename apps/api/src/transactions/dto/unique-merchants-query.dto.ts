import { IsIn, IsOptional } from 'class-validator';

export class UniqueMerchantsQueryDto {
  @IsOptional()
  @IsIn(['CARD', 'ALL'])
  source?: 'CARD' | 'ALL';
}

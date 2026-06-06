import { IsString, MinLength, MaxLength, IsArray, ArrayMinSize } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  transactionIds!: string[];
}

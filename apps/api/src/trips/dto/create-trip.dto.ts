import { MaxLength, MinLength, IsString } from 'class-validator';
import { TripSelectionDto } from './trip-selection.dto';

export class CreateTripDto extends TripSelectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}

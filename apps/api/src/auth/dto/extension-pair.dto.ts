import { IsString, Matches } from 'class-validator';

export class ExtensionPairDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

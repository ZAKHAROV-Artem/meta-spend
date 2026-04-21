import { IsString, MinLength } from 'class-validator';

export class SiweVerifyDto {
  @IsString()
  @MinLength(1)
  message!: string;

  @IsString()
  @MinLength(1)
  signature!: string;
}

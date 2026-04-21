import { IsString, IsInt, IsPositive, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid EVM address' })
  address!: string;

  @IsInt()
  @IsPositive()
  chainId!: number;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  label?: string;
}

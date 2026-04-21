import { Matches } from 'class-validator';

export class ConnectPortfolioDto {
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid EVM address' })
  address!: string;
}

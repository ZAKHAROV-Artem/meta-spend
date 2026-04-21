import type { CardTxStatus } from './card-transaction';

export type TxType =
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'TRANSFER_SELF'
  | 'SWAP'
  | 'BRIDGE'
  | 'CONTRACT_INTERACTION'
  | 'GAS_ONLY'
  | 'UNKNOWN';

export type TransactionSource = 'HOLDINGS' | 'CARD';
export type TransactionDirection = 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';
export type TransactionStatsSource = TransactionSource | 'ALL';

export interface Transaction {
  id: string;
  source: TransactionSource;
  occurredAt: string;
  title: string;
  subtitle: string | null;
  amountUsd: string | null;
  direction: TransactionDirection;
  categoryId: string | null;
  notes: string | null;
  chainId: number | null;
  hash: string | null;
  txType: TxType | null;
  assetSymbol: string | null;
  counterpartyLabel: string | null;
  merchantName: string | null;
  status: CardTxStatus | null;
  fiatAmount: string | null;
  fiatCurrency: string | null;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  spent: number;
  received: number;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  total: number;
  count: number;
}

export interface TransactionStats {
  totalSpent: number;
  totalReceived: number;
  totalGasFees: number;
  txCount: number;
  monthly: MonthlyStats[];
  categoryBreakdown: CategoryBreakdown[];
}

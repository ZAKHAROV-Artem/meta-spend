import type { CategoryBreakdown, MonthlyStats } from './transaction';

export type CardTxStatus = 'PENDING' | 'SETTLED' | 'DECLINED' | 'REFUNDED';

/** Wire shape from browser extension → API sync endpoint */
export interface ParsedCardTx {
  externalId: string;
  occurredAt: string;
  merchantName: string;
  merchantRaw?: string | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
  status: CardTxStatus;
  parserVersion: number;
  rawHtml?: string | null;
}

export interface CardTransaction {
  id: string;
  userId: string;
  externalId: string;
  occurredAt: string;
  merchantName: string;
  merchantRaw: string | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
  status: CardTxStatus;
  categoryId: string | null;
  notes: string | null;
  parserVersion: number;
  rawHtml: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCardTransactions {
  items: CardTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

/** Same shape as TransactionStats for dashboard reuse */
export interface CardTransactionStats {
  totalSpent: number;
  totalReceived: number;
  totalGasFees: number;
  txCount: number;
  monthly: MonthlyStats[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CardSyncResult {
  inserted: number;
  updated: number;
  skipped: number;
}

export interface ExtensionPairCodeResponse {
  code: string;
  expiresAt: string;
}

export interface ExtensionPairResponse {
  token: string;
}

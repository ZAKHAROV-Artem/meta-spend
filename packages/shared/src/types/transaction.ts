import type { CardTxStatus } from './card-transaction';

export type TransactionSource = 'CARD';
export type TransactionSourceFilter = TransactionSource | 'ALL';
export type TransactionDirection = 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';

export interface Transaction {
  id: string;
  source: TransactionSource;
  occurredAt: string;
  title: string;
  subtitle: string | null;
  /** Signed amount in native fiat decimal string when available */
  amountPrimary: string | null;
  /** ISO fiat code (PLN, USD, …) — card native currency */
  currency: string | null;
  direction: TransactionDirection;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  subcategoryColor: string | null;
  notes: string | null;
  externalId: string | null;
  merchantName: string | null;
  merchantRaw: string | null;
  status: CardTxStatus | null;
  fiatAmount: string | null;
  fiatCurrency: string | null;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
  gasFeeAmount: string | null;
  gasFeeSymbol: string | null;
  /** Fiat currency per one crypto unit, computed from abs(fiatAmount) / abs(cryptoAmount). */
  exchangeRate: string | null;
  parserVersion: number | null;
  rawHtml: string | null;
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

/** Base stats (backward compatible naming) — amounts are for primary/display currency subset when noted by API */
export interface TransactionStats {
  totalSpent: number;
  totalReceived: number;
  totalGasFees: number;
  txCount: number;
  monthly: MonthlyStats[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategorySpendShare extends CategoryBreakdown {
  sharePercent: number;
}

export interface CurrencySliceStats {
  currency: string;
  totalSpent: number;
  totalReceived: number;
  netSpend: number;
  txCount: number;
  monthly: MonthlyStats[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CryptoSpendSummary {
  symbol: string;
  totalSpent: number;
  totalGasFee: number;
  averageFiatPerCryptoRate: number | null;
  txCount: number;
}

export interface ExchangeRateTrendPoint {
  date: string;
  fiatCurrency: string;
  cryptoSymbol: string;
  rate: number;
  fiatTotal: number;
  cryptoTotal: number;
  txCount: number;
}

export interface AvgTransactionAmountTrendPoint {
  date: string;
  currency: string;
  avgAmount: number;
  fiatTotal: number;
  txCount: number;
}

export interface CardTransactionAnalytics extends TransactionStats {
  /** When all spending txs share one fiat code; KPIs reflect that currency only */
  displayCurrency: string | null;
  mixedCurrencyNotice: boolean;
  netSpendPrimary: number;
  declinedCount: number;
  refundCount: number;
  categoryShares: CategorySpendShare[];
  byCurrency: CurrencySliceStats[];
  cryptoSpendSummaries: CryptoSpendSummary[];
  exchangeRateTrend: ExchangeRateTrendPoint[];
  avgTransactionAmountTrend: AvgTransactionAmountTrendPoint[];
  topMerchants: Array<{
    key: string;
    displayName: string;
    total: number;
    count: number;
    currency: string | null;
  }>;
}

export interface UniqueMerchant {
  key: string;
  displayName: string;
  source: TransactionSource;
  count: number;
  totalFiatSpend: number;
  currency: string | null;
  lastSeenAt: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

export interface BulkCategorizeBody {
  key: string;
  source: TransactionSource;
  categoryId: string | null;
}

export interface BulkCategorizeResult {
  key: string;
  categoryId: string | null;
  updatedCount: number;
}

/** Background auto-categorization result (logged; not exposed as user-triggered control) */
export interface AutoCategorizeCardMerchantsResult {
  processedMerchants: number;
  assignedMerchantCount: number;
  skippedMerchantCount: number;
  updatedTransactionCount: number;
  errors: string[];
}

export interface CardCategorizationRunChunkLogEntry {
  index: number;
  merchantCount: number;
  assignedCount: number;
  skippedCount: number;
  error: string | null;
}

export interface CardCategorizationRunMeta {
  chunksCompleted?: number;
  chunksTotal?: number;
  aiAssignedMerchants?: number;
  aiSkippedMerchants?: number;
  chunks?: CardCategorizationRunChunkLogEntry[];
}

export interface CardCategorizationRunDto {
  id: string;
  status: string;
  trigger: string;
  startedAt: string | null;
  finishedAt: string | null;
  scannedTxCount: number;
  scannedMerchantCount: number;
  memoryMatchedCount: number;
  aiUpdatedCount: number;
  skippedCount: number;
  errorMessage: string | null;
  meta: CardCategorizationRunMeta | null;
}

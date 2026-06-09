import type { Transaction } from './transaction';
import type { CategoryBreakdown } from './transaction';

export interface TripSummary {
  id: string;
  name: string;
  currency: string;
  startAt: string;
  endAt: string;
  transactionCount: number;
  createdAt: string;
  totalsByCurrency: Array<{
    currency: string;
    totalSpent: number;
    totalReceived: number;
  }>;
}

export interface TripDetail extends TripSummary {
  transactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
  convertedTotal: { currency: string; totalSpent: number; totalReceived: number } | null;
}

export interface TripSelectionDto {
  startTransactionId?: string;
  endTransactionId?: string;
  includeTransactionIds?: string[];
  excludeTransactionIds?: string[];
  transactionIds?: string[];
}

export interface TripPreview {
  startAt: string;
  endAt: string;
  currency: string;
  transactionCount: number;
  totalsByCurrency: TripSummary['totalsByCurrency'];
  transactions: Transaction[];
  startTransaction: Transaction;
  endTransaction: Transaction;
  automaticTransactionIds: string[];
  extraTransactionIds: string[];
  excludedTransactionIds: string[];
}

export interface CreateTripDto extends TripSelectionDto {
  name: string;
}

export interface UpdateTripDto {
  name?: string;
  currency?: string;
}

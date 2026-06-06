import type { Transaction } from './transaction';
import type { CategoryBreakdown } from './transaction';

export interface TripSummary {
  id: string;
  name: string;
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

export interface CreateTripDto {
  name: string;
  transactionIds: string[];
}

export interface UpdateTripDto {
  name: string;
}

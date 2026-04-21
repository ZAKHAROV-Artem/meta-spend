import type { TransactionStats, TransactionStatsSource } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function useTransactionStats(filters?: { source?: TransactionStatsSource; chainId?: number }) {
  const params = new URLSearchParams();
  if (filters?.source) params.set('source', filters.source);
  if (filters?.chainId) params.set('chainId', String(filters.chainId));
  const query = params.toString();
  return useApiQuery<TransactionStats>(`/transactions/stats${query ? `?${query}` : ''}`);
}

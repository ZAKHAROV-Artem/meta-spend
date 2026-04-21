import type { CardTransactionStats } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function useCardStats(filters?: { from?: string; to?: string; year?: number }) {
  const params = new URLSearchParams();
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.year != null) params.set('year', String(filters.year));
  const query = params.toString();
  return useApiQuery<CardTransactionStats>(`/card-transactions/stats${query ? `?${query}` : ''}`);
}

import { useApiQuery } from './useApi';
import { keepPreviousData } from '@tanstack/react-query';
import type { CardTransactionAnalytics } from '@metaspend/shared';

export function useTransactionStats(filters?: { from?: string; to?: string; year?: number; defaultCurrency?: string }) {
  const params = new URLSearchParams();
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.year) params.set('year', String(filters.year));
  if (filters?.defaultCurrency) params.set('defaultCurrency', filters.defaultCurrency);
  const query = params.toString();
  return useApiQuery<CardTransactionAnalytics>(`/transactions/stats${query ? `?${query}` : ''}`, {
    placeholderData: keepPreviousData,
  });
}

import { keepPreviousData } from '@tanstack/react-query';
import { useApiQuery } from './useApi';
import type { CardTransactionAnalytics, CardTxStatus, PaginatedTransactions } from '@crypto-tracker/shared';

export interface TransactionFilters {
  categoryId?: string[];
  status?: CardTxStatus;
  from?: string;
  to?: string;
  search?: string;
}

export function useTransactions(filters?: TransactionFilters, page = 1, limit = 50) {
  const params = new URLSearchParams();

  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId?.length) params.set('categoryId', filters.categoryId.join(','));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.search) params.set('search', filters.search);
  params.set('page', String(page));
  params.set('limit', String(limit));

  return useApiQuery<PaginatedTransactions>(`/transactions?${params.toString()}`, {
    placeholderData: keepPreviousData,
  });
}

export function useTransactionStats(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId?.length) params.set('categoryId', filters.categoryId.join(','));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.search?.trim()) params.set('search', filters.search.trim());

  const qs = params.toString();

  return useApiQuery<CardTransactionAnalytics>(`/transactions/stats${qs ? `?${qs}` : ''}`, {
    placeholderData: keepPreviousData,
  });
}

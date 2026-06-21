import { keepPreviousData } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from './useApi';
import type {
  BulkCategorizeBody,
  CardTransactionAnalytics,
  CardTxStatus,
  PaginatedTransactions,
  TransactionSourceFilter,
  UniqueMerchant,
} from '@metaspend/shared';

export interface TransactionFilters {
  categoryId?: string[];
  subcategoryId?: string[];
  status?: CardTxStatus;
  from?: string;
  to?: string;
  search?: string;
  defaultCurrency?: string;
}

export function useTransactions(filters?: TransactionFilters, page = 1, limit = 50) {
  const params = new URLSearchParams();

  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId?.length) params.set('categoryId', filters.categoryId.join(','));
  if (filters?.subcategoryId?.length) params.set('subcategoryId', filters.subcategoryId.join(','));
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
  if (filters?.subcategoryId?.length) params.set('subcategoryId', filters.subcategoryId.join(','));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.search?.trim()) params.set('search', filters.search.trim());
  if (filters?.defaultCurrency) params.set('defaultCurrency', filters.defaultCurrency);

  const qs = params.toString();

  return useApiQuery<CardTransactionAnalytics>(`/transactions/stats${qs ? `?${qs}` : ''}`, {
    placeholderData: keepPreviousData,
  });
}

export function useUniqueMerchants(source: TransactionSourceFilter = 'ALL') {
  const params = new URLSearchParams();
  if (source) params.set('source', source);

  return useApiQuery<UniqueMerchant[]>(`/transactions/unique-merchants?${params.toString()}`, {
    placeholderData: keepPreviousData,
  });
}

export function useBulkCategorize() {
  return useApiMutation<{ updated: number }, BulkCategorizeBody>(
    'POST',
    '/transactions/bulk-categorize',
    [
      '/transactions/unique-merchants',
      '/transactions/card-merchants',
      '/transactions',
      '/transactions/stats',
      '/transactions/categorization-runs',
    ],
  );
}

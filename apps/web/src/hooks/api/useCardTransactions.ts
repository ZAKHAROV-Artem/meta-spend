import { useApiQuery } from './useApi';
import type { CardTxStatus, PaginatedTransactions } from '@crypto-tracker/shared';

export interface CardTransactionFilters {
  categoryId?: string;
  subcategoryId?: string;
  status?: CardTxStatus;
  merchant?: string;
  from?: string;
  to?: string;
  search?: string;
}

export function useCardTransactions(filters?: CardTransactionFilters, page = 1, limit = 50) {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.subcategoryId) params.set('subcategoryId', filters.subcategoryId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.merchant) params.set('merchant', filters.merchant);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.search) params.set('search', filters.search);
  params.set('source', 'CARD');
  params.set('page', String(page));
  params.set('limit', String(limit));
  return useApiQuery<PaginatedTransactions>(`/transactions?${params.toString()}`);
}

import { useApiQuery } from './useApi';
import type { PaginatedTransactions, TransactionSource, TxType } from '@crypto-tracker/shared';
import type { CardTxStatus } from '@crypto-tracker/shared';

export interface TransactionFilters {
  categoryId?: string;
  txType?: TxType;
  status?: CardTxStatus;
  from?: string;
  to?: string;
  chainId?: number;
  search?: string;
  source?: TransactionSource;
}

export function useTransactions(filters?: TransactionFilters, page = 1, limit = 50) {
  const params = new URLSearchParams();

  if (filters?.source) params.set('source', filters.source);
  if (filters?.chainId) params.set('chainId', String(filters.chainId));
  if (filters?.txType) params.set('txType', filters.txType);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.search) params.set('search', filters.search);
  params.set('page', String(page));
  params.set('limit', String(limit));

  return useApiQuery<PaginatedTransactions>(`/transactions?${params.toString()}`);
}

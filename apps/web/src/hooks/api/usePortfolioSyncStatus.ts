import type { PortfolioSyncStatus } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function usePortfolioSyncStatus() {
  return useApiQuery<PortfolioSyncStatus>('/portfolio/sync-status');
}

import { toast } from 'sonner';
import type { PortfolioSyncStatus } from '@crypto-tracker/shared';
import { useApiMutation } from './useApi';

export function usePortfolioRefresh() {
  return useApiMutation<PortfolioSyncStatus, Record<string, never>>(
    'POST',
    '/portfolio/refresh',
    ['/portfolio/overview', '/portfolio/sync-status', '/transactions', '/transactions/stats'],
    {
      onSuccess: (data) => {
        if (data.state === 'SYNCING') {
          toast.info('Portfolio sync is already running');
          return;
        }
        toast.success('Portfolio refreshed');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Portfolio refresh failed');
      },
    },
  );
}

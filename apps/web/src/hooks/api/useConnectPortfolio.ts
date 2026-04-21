import { toast } from 'sonner';
import type { ConnectPortfolioDto, PortfolioOverview } from '@crypto-tracker/shared';
import { useApiMutation } from './useApi';

export function useConnectPortfolio() {
  return useApiMutation<PortfolioOverview, ConnectPortfolioDto>(
    'POST',
    '/portfolio/connect',
    ['/portfolio/overview', '/portfolio/sync-status', '/transactions', '/transactions/stats'],
    {
      onSuccess: () => {
        toast.success('MetaMask account connected');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Could not connect MetaMask');
      },
    },
  );
}

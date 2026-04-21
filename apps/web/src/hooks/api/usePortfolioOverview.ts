import type { PortfolioOverview } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function usePortfolioOverview() {
  return useApiQuery<PortfolioOverview>('/portfolio/overview');
}

import type { UseQueryOptions } from '@tanstack/react-query';
import type { PortfolioOverview } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function usePortfolioOverview(
  options?: Omit<UseQueryOptions<PortfolioOverview>, 'queryKey' | 'queryFn'>,
) {
  return useApiQuery<PortfolioOverview>('/portfolio/overview', options);
}

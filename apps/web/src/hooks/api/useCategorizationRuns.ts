import type { CardCategorizationRunDto } from '@metaspend/shared';
import { useApiQuery } from './useApi';

const ACTIVE_STATUSES = new Set(['RUNNING', 'QUEUED']);

export function useCategorizationRuns() {
  return useApiQuery<CardCategorizationRunDto[]>('/transactions/categorization-runs', {
    refetchInterval: (query) => {
      const runs = query.state.data;
      return runs?.some((r) => ACTIVE_STATUSES.has(r.status)) ? 2000 : false;
    },
  });
}

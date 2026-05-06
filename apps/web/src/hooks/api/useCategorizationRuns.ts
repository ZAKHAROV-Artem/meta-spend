import type { CardCategorizationRunDto } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function useCategorizationRuns() {
  return useApiQuery<CardCategorizationRunDto[]>('/transactions/categorization-runs');
}

import type { CardCategorizationRunDto } from '@metaspend/shared';
import { useApiQuery } from './useApi';

export function useCategorizationRuns() {
  return useApiQuery<CardCategorizationRunDto[]>('/transactions/categorization-runs');
}

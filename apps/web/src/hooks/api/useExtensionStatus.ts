import type { ExtensionStatusResponse } from '@metaspend/shared';
import { useApiQuery } from './useApi';

export function useExtensionStatus() {
  return useApiQuery<ExtensionStatusResponse>('/auth/extension/status', {
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

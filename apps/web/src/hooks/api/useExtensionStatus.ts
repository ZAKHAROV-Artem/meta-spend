import type { ExtensionStatusResponse } from '@crypto-tracker/shared';
import { useApiQuery } from './useApi';

export function useExtensionStatus() {
  return useApiQuery<ExtensionStatusResponse>('/auth/extension/status', {
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

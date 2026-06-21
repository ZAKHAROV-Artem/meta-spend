import { useApiMutation } from './useApi';
import type { ExtensionPairCodeResponse } from '@metaspend/shared';

export function useExtensionPairCode() {
  return useApiMutation<ExtensionPairCodeResponse, Record<string, unknown>>(
    'POST',
    '/auth/extension/pair-code',
    [],
  );
}

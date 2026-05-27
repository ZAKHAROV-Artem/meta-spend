import { useApiMutation } from './useApi';

export function useExtensionDisconnect() {
  return useApiMutation<{ revoked: number }, void>('DELETE', '/auth/extension/disconnect', [
    '/auth/extension/status',
  ]);
}

import { toast } from 'sonner';
import { useApiMutation } from './useApi';

export function useSyncWallet() {
  return useApiMutation<{ synced: number }, { walletId: string }>(
    'POST',
    (vars) => `/wallets/${vars.walletId}/sync`,
    ['/wallets', '/transactions', '/transactions/stats'],
    {
      onSuccess: (data) => {
        toast.success(`Sync complete — ${data.synced} transaction${data.synced === 1 ? '' : 's'} imported`);
      },
      onError: (error) => {
        toast.error(error.message ?? 'Sync failed');
      },
    },
  );
}

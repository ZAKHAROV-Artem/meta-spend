import { toast } from 'sonner';
import { useApiQuery, useApiMutation } from './useApi';
import type { Wallet, CreateWalletDto } from '@crypto-tracker/shared';

export function useWallets() {
  return useApiQuery<Wallet[]>('/wallets');
}

export function useAddWallet() {
  return useApiMutation<Wallet, CreateWalletDto>('POST', '/wallets', ['/wallets'], {
    onSuccess: () => toast.success('Wallet added'),
    onError: (e) => toast.error(e.message),
  });
}

export function useRemoveWallet() {
  return useApiMutation<void, string>('DELETE', (id) => `/wallets/${id}`, ['/wallets'], {
    onSuccess: () => toast.success('Wallet removed'),
    onError: (e) => toast.error(e.message),
  });
}

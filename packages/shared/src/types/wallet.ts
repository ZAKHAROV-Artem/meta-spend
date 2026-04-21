export interface Wallet {
  id: string;
  userId: string;
  address: string;
  chainId: number;
  label: string | null;
  isVerified: boolean;
  createdAt: string;
  lastSyncedAt: string | null;
  syncStatus: 'IDLE' | 'SYNCING' | 'FAILED';
}

export interface CreateWalletDto {
  address: string;
  chainId: number;
  label?: string;
}

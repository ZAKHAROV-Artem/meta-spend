export type PortfolioSyncState = 'UNCONFIGURED' | 'IDLE' | 'SYNCING' | 'PARTIAL' | 'ERROR';

export interface PortfolioHolding {
  chainId: number;
  assetAddress: string | null;
  symbol: string;
  name: string;
  balance: string;
  balanceUsd: string | null;
  priceUsd: string | null;
  isNative: boolean;
}

export interface PortfolioSyncStatus {
  address: string | null;
  state: PortfolioSyncState;
  isStale: boolean;
  lastSyncedAt: string | null;
  lastRefreshRequestedAt: string | null;
  failedChains: number[];
  message: string | null;
}

export interface PortfolioOverview {
  address: string | null;
  totalBalanceUsd: string;
  totalTransactions: number;
  totalInflowsUsd: string;
  totalOutflowsUsd: string;
  holdings: PortfolioHolding[];
  syncStatus: PortfolioSyncStatus;
}

export interface ConnectPortfolioDto {
  address: string;
}

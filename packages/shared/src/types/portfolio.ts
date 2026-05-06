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

/** Card-only product: holdings sync removed; SIWE/account may still store a primary address */
export interface PortfolioOverview {
  address: string | null;
  /** Always empty — on-chain holdings are not tracked */
  holdings: PortfolioHolding[];
  totalBalanceUsd: string;
  totalTransactions: number;
  totalInflowsUsd: string;
  totalOutflowsUsd: string;
  syncStatus: PortfolioSyncStatus;
}

export interface ConnectPortfolioDto {
  address: string;
}

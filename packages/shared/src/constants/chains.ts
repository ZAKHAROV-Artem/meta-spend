export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', symbol: 'POL', explorer: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum One', symbol: 'ETH', explorer: 'https://arbiscan.io' },
  8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
  10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
  59144: { name: 'Linea', symbol: 'ETH', explorer: 'https://lineascan.build' },
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

export const DEFAULT_CHAIN_ID: SupportedChainId = 1;

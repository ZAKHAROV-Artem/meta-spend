'use client';

import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, base, optimism, linea } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism, linea],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [linea.id]: http(),
  },
  ssr: true,
});

'use client';

import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi-config';

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderBase config={wagmiConfig}>{children}</WagmiProviderBase>;
}

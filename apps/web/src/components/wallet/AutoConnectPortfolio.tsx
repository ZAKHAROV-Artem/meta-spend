'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useConnectPortfolio } from '@/hooks/api/useConnectPortfolio';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';

export function AutoConnectPortfolio() {
  const { address, isConnected } = useAccount();
  const { data: overview } = usePortfolioOverview();
  const connectPortfolio = useConnectPortfolio();
  const attemptedAddress = useRef<string | null>(null);

  useEffect(() => {
    const normalized = address?.toLowerCase();
    const current = overview?.address?.toLowerCase() ?? null;

    if (!isConnected || !normalized) {
      attemptedAddress.current = null;
      return;
    }

    if (normalized === current) {
      attemptedAddress.current = null;
      return;
    }

    if (attemptedAddress.current === normalized || connectPortfolio.isPending) {
      return;
    }

    attemptedAddress.current = normalized;
    connectPortfolio.mutate({ address: normalized });
  }, [address, connectPortfolio, isConnected, overview?.address]);

  return null;
}

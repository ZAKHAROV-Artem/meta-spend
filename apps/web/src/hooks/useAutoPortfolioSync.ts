'use client';

import { useEffect, useRef } from 'react';
import { usePortfolioRefresh } from './api/usePortfolioRefresh';
import { usePortfolioSyncStatus } from './api/usePortfolioSyncStatus';

export function useAutoPortfolioSync(enabled = true) {
  const requestedFor = useRef<string | null>(null);
  const syncStatus = usePortfolioSyncStatus();
  const refresh = usePortfolioRefresh();
  const address = syncStatus.data?.address ?? null;

  useEffect(() => {
    if (!enabled || !address || !syncStatus.data) {
      requestedFor.current = null;
      return;
    }

    if (syncStatus.data.state === 'SYNCING') {
      return;
    }

    if (!syncStatus.data.isStale) {
      requestedFor.current = null;
      return;
    }

    if (requestedFor.current === address || refresh.isPending) {
      return;
    }

    requestedFor.current = address;
    refresh.mutate({});
  }, [address, enabled, refresh, syncStatus.data]);

  return {
    syncStatus: syncStatus.data,
    isLoading: syncStatus.isLoading,
    isRefreshing: refresh.isPending,
  };
}

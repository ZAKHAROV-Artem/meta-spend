'use client';

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, RefreshCw, Sparkles, Wallet } from 'lucide-react';
import { ExtensionConnectCard } from '@/components/settings/ExtensionConnectCard';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';
import { useCategorizationRuns } from '@/hooks/api/useCategorizationRuns';

function shortAddress(value: string | null | undefined) {
  return value ? `${value.slice(0, 10)}...${value.slice(-6)}` : 'Not connected';
}


function AutoCategorizationLog() {
  const { data: runs = [], isLoading } = useCategorizationRuns();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Auto categorization
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          After each browser extension sync we match learned merchants then call AI once for unfamiliar titles. Runs in
          the background — nothing to configure here.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
        ) : runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No runs yet — sync transactions from the extension to trigger categorization.
          </p>
        ) : (
          <div className="max-h-[360px] space-y-2 overflow-auto rounded-lg border border-border/70 bg-muted/28 p-2">
            {runs.map((r) => (
              <div key={r.id} className="rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{r.trigger}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  Started {r.startedAt ? new Date(r.startedAt).toLocaleString() : 'queued'} · finished{' '}
                  {r.finishedAt ? new Date(r.finishedAt).toLocaleString() : '—'}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  scanned {r.scannedTxCount} txs · merchants {r.scannedMerchantCount} · memory {r.memoryMatchedCount} · AI
                  assigns {r.aiUpdatedCount} · skipped {r.skippedCount}
                </p>
                {r.errorMessage ? <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{r.errorMessage}</p> : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsPanel({ email }: { email: string }) {
  const { data: overview, isLoading } = usePortfolioOverview();
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const isSiweUser = email.endsWith('@wallet.siwe');
  const primaryAddress = overview?.address?.toLowerCase() ?? null;
  const connectedAddress = address?.toLowerCase() ?? null;
  const walletMatchesPortfolio = !!connectedAddress && connectedAddress === primaryAddress;

  const portfolioStatus = useMemo(() => {
    if (isLoading) return 'Checking...';
    if (!primaryAddress) return 'No primary signing address linked';
    if (walletMatchesPortfolio) return 'Connected';
    return 'Linked';
  }, [isLoading, primaryAddress, walletMatchesPortfolio]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="truncate text-sm font-medium">{isSiweUser ? 'Wallet account' : email}</p>
            </div>
            {isSiweUser ? <Badge variant="secondary">SIWE</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground">Primary address (SIWE)</p>
              <p className="mt-1 font-mono text-sm font-medium">{shortAddress(primaryAddress)}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground">Browser wallet</p>
              <p className="mt-1 font-mono text-sm font-medium">{shortAddress(connectedAddress)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">{portfolioStatus}</p>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <RefreshCw className="h-3 w-3" />
              IDLE
            </Badge>
          </div>

          {isConnected ? (
            <Button type="button" variant="outline" onClick={() => disconnect()}>
              Disconnect MetaMask
            </Button>
          ) : (
            <Button type="button" className="gap-2" disabled={isConnecting} onClick={() => connect({ connector: injected() })}>
              <Link2 className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          )}
        </CardContent>
      </Card>

      <AutoCategorizationLog />

      <ExtensionConnectCard />
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Link2, Puzzle, RefreshCw, ShieldAlert, User, Wallet } from 'lucide-react';
import { ExtensionConnectCard } from '@/components/settings/ExtensionConnectCard';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';

function formatRelativeTime(value: string | null) {
  if (!value) return 'Not synced yet';

  const date = new Date(value);
  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(deltaMs / 60_000));

  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.round(hours / 24)}d ago`;
}

function syncTone(state: string): 'secondary' | 'destructive' {
  if (state === 'PARTIAL' || state === 'ERROR') return 'destructive';
  return 'secondary';
}

export function SettingsPanel({ email }: { email: string }) {
  const { data: overview, isLoading } = usePortfolioOverview();
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const isSiweUser = email.endsWith('@wallet.siwe');
  const displayEmail = isSiweUser ? 'Wallet-only account' : email;
  const connectedAddress = address?.toLowerCase() ?? null;
  const primaryAddress = overview?.address?.toLowerCase() ?? null;

  const metaMaskState = useMemo(() => {
    if (isLoading) return 'Loading portfolio state...';
    if (!primaryAddress) return 'No MetaMask account linked yet.';
    if (connectedAddress && connectedAddress === primaryAddress) {
      return 'Connected wallet matches the active portfolio.';
    }
    if (connectedAddress && connectedAddress !== primaryAddress) {
      return 'The connected wallet will become the active portfolio automatically.';
    }
    return 'Reconnect MetaMask to switch or refresh the active portfolio.';
  }, [connectedAddress, isLoading, primaryAddress]);

  return (
    <div className="space-y-5">
      <Card className="bg-card/72">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{displayEmail}</p>
            </div>
            {isSiweUser && <Badge variant="secondary">MetaMask account</Badge>}
          </div>
          <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Authentication</p>
              <p className="mt-1 text-sm font-medium">
                {isSiweUser ? 'Sign-In with Ethereum (SIWE)' : 'Email & password'}
              </p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/72">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-primary" />
            MetaMask portfolio
          </CardTitle>
          <CardDescription className="text-xs">
            One connected MetaMask account powers your full portfolio view across supported chains.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active portfolio</p>
            <p className="mt-2 font-mono text-sm font-semibold text-foreground">
              {primaryAddress ? `${primaryAddress.slice(0, 10)}…${primaryAddress.slice(-6)}` : 'Not linked yet'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{metaMaskState}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Connected wallet</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">
                {isConnected && address ? `${address.slice(0, 10)}…${address.slice(-6)}` : 'No wallet connected'}
              </p>
            </div>
            {isConnected ? (
              <Button type="button" variant="outline" onClick={() => disconnect()}>
                Disconnect
              </Button>
            ) : (
              <Button
                type="button"
                className="gap-2"
                disabled={isConnecting}
                onClick={() => connect({ connector: injected() })}
              >
                <Link2 className="h-4 w-4" />
                {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Auto-sync</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {overview ? formatRelativeTime(overview.syncStatus.lastSyncedAt) : 'Checking sync state...'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {overview?.syncStatus.message ?? 'Portfolio sync runs automatically when pages need fresh data.'}
              </p>
            </div>
            <Badge variant={syncTone(overview?.syncStatus.state ?? 'IDLE')} className="gap-1.5">
              <RefreshCw className={`h-3 w-3 ${overview?.syncStatus.state === 'SYNCING' ? 'animate-spin' : ''}`} />
              {overview?.syncStatus.state ?? 'IDLE'}
            </Badge>
          </div>

          {overview?.syncStatus.failedChains?.length ? (
            <div className="flex items-start gap-3 rounded-[1.5rem] border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-destructive">
                Some chains failed during the last sync. The app is still showing the most recent successful data.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ExtensionConnectCard />

      <Card className="bg-card/72">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Puzzle className="h-4 w-4 text-primary" />
            How sync works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Holdings sync automatically from the active MetaMask account across supported chains. There is no manual
            chain selection or per-wallet sync flow anymore.
          </p>
          <p>
            Card activity remains separate in the UI, but it belongs to the same portfolio and uses the same account
            context once the browser extension is paired.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

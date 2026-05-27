'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Puzzle, Unplug } from 'lucide-react';

import { useExtensionDisconnect } from '@/hooks/api/useExtensionDisconnect';
import { useExtensionPairCode } from '@/hooks/api/useExtensionPairCode';
import { useExtensionStatus } from '@/hooks/api/useExtensionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ExtensionConnectCard() {
  const { data: status, isLoading } = useExtensionStatus();
  const disconnect = useExtensionDisconnect();
  const { mutateAsync: createPairCode, isPending: isCreatingPairCode, error: pairCodeError } =
    useExtensionPairCode();
  const [pendingCode, setPendingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const connected = status?.connected ?? false;
  const latestConnection = status?.connections[0] ?? null;

  useEffect(() => {
    if (isLoading || connected || pendingCode || isCreatingPairCode) return;
    void createPairCode({}).then((res) => {
      setPendingCode({ code: res.code, expiresAt: res.expiresAt });
    });
  }, [connected, createPairCode, isCreatingPairCode, isLoading, pendingCode]);

  const handleCopy = async () => {
    if (!pendingCode) return;
    await navigator.clipboard.writeText(pendingCode.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleDisconnect = () => {
    void disconnect.mutateAsync(undefined, {
      onSuccess: () => setPendingCode(null),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Puzzle className="h-4 w-4 text-primary" />
          Browser extension
        </CardTitle>
        <CardDescription>
          Sync MetaMask Card activity from the MetaSpend browser extension.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : connected ? (
          <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Extension connected</p>
                  <p className="text-xs text-muted-foreground">
                    {latestConnection?.lastUsedAt
                      ? `Last sync ${new Date(latestConnection.lastUsedAt).toLocaleString()}`
                      : 'Ready to sync card activity'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Connected
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={disconnect.isPending}
              onClick={handleDisconnect}
            >
              <Unplug className="h-4 w-4" />
              {disconnect.isPending ? 'Disconnecting…' : 'Disconnect extension'}
            </Button>
            {disconnect.error ? (
              <p className="text-xs text-destructive">{disconnect.error.message}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-border/70 bg-muted/20 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Install the MetaSpend extension, open its popup, and enter the pairing code below to
              connect.
            </p>
            {pendingCode ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pairing code
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-2xl font-semibold tracking-[0.18em]">
                    {pendingCode.code}
                  </span>
                  <Button type="button" variant="outline" size="icon-sm" onClick={() => void handleCopy()}>
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Badge variant="secondary">
                    Expires {new Date(pendingCode.expiresAt).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            ) : isCreatingPairCode ? (
              <Skeleton className="h-12 rounded-lg" />
            ) : pairCodeError ? (
              <p className="text-xs text-destructive">{pairCodeError.message}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

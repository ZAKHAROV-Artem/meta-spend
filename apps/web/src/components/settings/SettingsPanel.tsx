'use client';

import { Sparkles } from 'lucide-react';

import { ExtensionConnectCard } from '@/components/settings/ExtensionConnectCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategorizationRuns } from '@/hooks/api/useCategorizationRuns';

function AutoCategorizationLog() {
  const { data: runs = [], isLoading } = useCategorizationRuns();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Auto categorization
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          After each browser extension sync we match learned merchants then call AI once for
          unfamiliar titles. Runs in the background — nothing to configure here.
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
                <p className="mt-2 text-xs text-muted-foreground">
                  scanned {r.scannedTxCount} txs · merchants {r.scannedMerchantCount} · memory{' '}
                  {r.memoryMatchedCount} · AI assigns {r.aiUpdatedCount} · skipped {r.skippedCount}
                </p>
                {r.errorMessage ? (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{r.errorMessage}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect the browser extension and review automatic categorization.
        </p>
      </header>

      <ExtensionConnectCard />
      <AutoCategorizationLog />
    </div>
  );
}

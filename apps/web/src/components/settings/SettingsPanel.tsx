'use client';

import { Globe, Sparkles } from 'lucide-react';

import { ExtensionConnectCard } from '@/components/settings/ExtensionConnectCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategorizationRuns } from '@/hooks/api/useCategorizationRuns';
import { useCurrentUser, useUpdateUserPreferences } from '@/hooks/api/useUserPreferences';

const NONE_VALUE = '__none__';

const CURRENCY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: NONE_VALUE, label: 'None — show native' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'PLN', label: 'PLN — Polish Złoty' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'CZK', label: 'CZK — Czech Koruna' },
];

function CurrencyPreferenceCard() {
  const { data: currentUser } = useCurrentUser();
  const { mutate, isPending } = useUpdateUserPreferences();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-primary" />
          Default currency
        </CardTitle>
        <CardDescription>
          All analytics and totals will be converted to this currency using live exchange rates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={currentUser?.defaultCurrency ?? NONE_VALUE}
          onValueChange={(value) => mutate({ defaultCurrency: value === NONE_VALUE ? null : value })}
          disabled={isPending}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
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
      <CurrencyPreferenceCard />
      <AutoCategorizationLog />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Landmark, RefreshCw, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useAutoPortfolioSync } from '@/hooks/useAutoPortfolioSync';

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numeric);
}

function formatTime(value: string | null) {
  if (!value) return 'Not synced yet';
  return new Date(value).toLocaleString();
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-[2rem] border bg-muted/35" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[1.7rem] border bg-muted/35" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-[1.8rem] border bg-muted/35" />
        ))}
      </div>
    </div>
  );
}

function PreviewList({
  title,
  href,
  emptyLabel,
  items,
}: {
  title: string;
  href: string;
  emptyLabel: string;
  items: Array<{ id: string; title: string; subtitle: string | null; amountUsd: string | null }>;
}) {
  return (
    <Card className="bg-card/74">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Recent activity in this lane of your portfolio.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={href}>Open</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-border/70 bg-background/55 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.subtitle ?? 'No extra details'}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-foreground">
                {item.amountUsd ? formatCurrency(item.amountUsd) : '—'}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { syncStatus } = useAutoPortfolioSync(true);
  const { data: overview, isLoading } = usePortfolioOverview();
  const { data: holdingsPreview } = useTransactions({ source: 'HOLDINGS' }, 1, 4);
  const { data: cardPreview } = useTransactions({ source: 'CARD' }, 1, 4);

  if (isLoading || !overview) {
    return <OverviewSkeleton />;
  }

  if (!overview.address) {
    return (
      <Card className="border-dashed bg-card/70">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-primary/12 ring-1 ring-primary/15">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Connect MetaMask to start</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            CryptoTrack now follows one primary MetaMask portfolio across supported chains and card activity.
          </p>
          <Button asChild className="mt-6" size="sm">
            <Link href="/settings">Open settings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(overview.totalBalanceUsd),
      description: 'Current priced holdings across supported chains.',
      icon: Landmark,
    },
    {
      label: 'Inflows',
      value: formatCurrency(overview.totalInflowsUsd),
      description: 'All received value across holdings and card refunds.',
      icon: ArrowDownLeft,
    },
    {
      label: 'Outflows',
      value: formatCurrency(overview.totalOutflowsUsd),
      description: 'All spending across holdings and card activity.',
      icon: ArrowUpRight,
    },
    {
      label: 'Transactions',
      value: overview.totalTransactions.toLocaleString(),
      description: 'Unified count across holdings and card views.',
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80 bg-[linear-gradient(135deg,rgba(18,28,47,0.95),rgba(14,116,144,0.78))] text-white shadow-[0_30px_90px_-45px_rgba(2,132,199,0.75)]">
        <CardContent className="grid gap-8 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/70">Primary balance</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {formatCurrency(overview.totalBalanceUsd)}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              One MetaMask account, one portfolio view. Holdings sync automatically, and card activity stays separate
              without breaking the overall picture.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white/85">Auto-sync status</p>
              <Badge
                variant={
                  syncStatus?.state === 'ERROR'
                    ? 'destructive'
                    : syncStatus?.state === 'PARTIAL'
                      ? 'warning'
                      : syncStatus?.state === 'SYNCING'
                        ? 'info'
                        : 'secondary'
                }
                className="gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${syncStatus?.state === 'SYNCING' ? 'animate-spin' : ''}`} />
                {syncStatus?.state ?? 'IDLE'}
              </Badge>
            </div>
            <p className="mt-4 text-sm text-white/75">{syncStatus?.message ?? 'Portfolio ready.'}</p>
            <div className="mt-6 space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between gap-3">
                <span>Primary account</span>
                <span className="font-mono text-xs">
                  {overview.address.slice(0, 10)}…{overview.address.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Last sync</span>
                <span>{formatTime(syncStatus?.lastSyncedAt ?? null)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Tracked assets</span>
                <span>{overview.holdings.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="bg-card/75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-primary/12 ring-1 ring-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 rounded-full" />
                ) : (
                  <div className="text-3xl font-semibold tracking-tight text-foreground">{card.value}</div>
                )}
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PreviewList
          title="Holdings preview"
          href="/holdings"
          emptyLabel="No holdings activity yet."
          items={(holdingsPreview?.items ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            amountUsd: item.amountUsd,
          }))}
        />
        <PreviewList
          title="Card preview"
          href="/card"
          emptyLabel="No card activity yet."
          items={(cardPreview?.items ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            amountUsd: item.amountUsd,
          }))}
        />
      </div>
    </div>
  );
}

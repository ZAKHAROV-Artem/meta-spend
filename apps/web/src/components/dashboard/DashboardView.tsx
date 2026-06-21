'use client';

import { format } from 'date-fns';
import Link from 'next/link';

import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { MetaMaskCardWidget } from '@/components/dashboard/MetaMaskCardWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { useExtensionStatus } from '@/hooks/api/useExtensionStatus';
import { useExtensionStatusStream } from '@/hooks/api/useExtensionStatusStream';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

function monthLabel(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yyyy');
}

function StatTile({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-card/80 px-4 py-3 backdrop-blur-sm',
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight sm:text-2xl">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function DashboardView() {
  // Drive the connect banner off live extension connection status, the same way the
  // Settings page does: SSE invalidates the status query the instant the extension
  // connects/disconnects, so the banner appears/disappears immediately.
  const { data: extensionStatus } = useExtensionStatus();
  useExtensionStatusStream();

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioOverview({
    refetchInterval: 45_000,
  });
  const { data: stats, isLoading: statsLoading } = useTransactionStats({});

  const ccy = stats?.displayCurrency ?? null;
  const now = new Date();
  const currentMonth = stats?.monthly.find(
    (m) => m.year === now.getUTCFullYear() && m.month === now.getUTCMonth() + 1,
  );

  const avgPerTx = stats && stats.txCount > 0 ? stats.totalSpent / stats.txCount : 0;

  const loading = (portfolioLoading && !portfolio) || (statsLoading && !stats);
  const hasNoTransactions = !loading && (stats?.txCount ?? 0) === 0;
  // Banner is purely about whether the extension is connected — independent of whether
  // any transactions have synced yet. Wait for the first status response to avoid a flash.
  const showConnectBanner = extensionStatus != null && !extensionStatus.connected;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Card balance, recent activity, and spending trends from your synced MetaMask Card
          transactions.
        </p>
      </header>

      {showConnectBanner ? (
        <div className="rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 via-card to-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-lg font-semibold text-foreground">Connect the MetaSpend extension</p>
              <p className="max-w-xl text-sm text-muted-foreground">
                Install the Chrome extension and open MetaMask Portfolio to sync your first
                transactions. Analytics and category breakdowns appear here once data is in.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Install extension
              </a>
              <Link
                href="/settings"
                className="inline-flex items-center rounded-lg border border-border bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <div className="flex min-h-80 items-center justify-center rounded-3xl border border-border/70 bg-card/50 p-4 backdrop-blur-sm sm:p-6 xl:col-span-5 xl:h-full">
          {loading ? (
            <Skeleton className="aspect-343/215 w-full max-w-120 rounded-2xl" />
          ) : (
            <MetaMaskCardWidget
              balanceAmount={portfolio?.cardBalance?.amount ?? null}
              balanceCurrency={portfolio?.cardBalance?.currency ?? null}
              address={portfolio?.address ?? null}
            />
          )}
        </div>

        <div className="space-y-5 xl:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-22 rounded-xl" />
                ))}
              </>
            ) : (
              <>
                <StatTile label="Total spend" value={formatMoney(stats?.totalSpent ?? 0, ccy)} />
                <StatTile
                  label="This month"
                  value={formatMoney(currentMonth?.spent ?? 0, ccy)}
                  sub={
                    currentMonth
                      ? monthLabel(currentMonth.year, currentMonth.month)
                      : 'No data this month'
                  }
                />
                <StatTile
                  label="Avg / transaction"
                  value={formatMoney(avgPerTx, ccy)}
                  sub={`${stats?.txCount ?? 0} transactions`}
                />
                <StatTile label="All time tx" value={String(stats?.txCount ?? 0)} />
              </>
            )}
          </div>

          <RecentTransactions />
        </div>
      </section>

      {!hasNoTransactions ? (
        <section aria-label="Spend analytics" className="space-y-5">
          <AnalyticsOverview embedded />
        </section>
      ) : null}
    </div>
  );
}

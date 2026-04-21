'use client';

import { BarChart2, Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';
import { useAutoPortfolioSync } from '@/hooks/useAutoPortfolioSync';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[1.7rem] border bg-muted/35" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[1.9rem] border bg-muted/35" />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-72 animate-pulse rounded-[1.9rem] border bg-muted/35" />
        <div className="h-72 animate-pulse rounded-[1.9rem] border bg-muted/35" />
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  useAutoPortfolioSync(true);

  const { data: overview, isLoading: overviewLoading } = usePortfolioOverview();
  const { data: stats, isLoading: statsLoading, isFetching } = useTransactionStats({ source: 'ALL' });

  if (overviewLoading || statsLoading || !stats) {
    return <AnalyticsSkeleton />;
  }

  if (!overview?.address) {
    return (
      <Card className="border-dashed bg-card/70">
        <CardContent className="py-16 text-center">
          <BarChart2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No portfolio data yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Connect MetaMask in Settings and analytics will fill in as your holdings and card activity sync.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = stats.totalSpent ?? 0;
  const totalReceived = stats.totalReceived ?? 0;
  const totalGasFees = stats.totalGasFees ?? 0;
  const netFlow = totalReceived - totalSpent;
  const chartMax =
    Math.max(
      ...(stats.monthly.map((month) => Math.max(month.spent, month.received)) ?? [0]),
      1,
    ) || 1;
  const categoryTotal = stats.categoryBreakdown.reduce((sum, item) => sum + item.total, 0);

  const statCards = [
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: TrendingDown, tone: 'text-destructive bg-destructive/10' },
    { label: 'Total Received', value: formatCurrency(totalReceived), icon: TrendingUp, tone: 'text-success bg-success-soft' },
    { label: 'Gas Fees', value: formatCurrency(totalGasFees), icon: Flame, tone: 'text-warning bg-warning-soft' },
    { label: 'Net Flow', value: formatCurrency(netFlow), icon: BarChart2, tone: netFlow >= 0 ? 'text-info bg-info-soft' : 'text-destructive bg-destructive/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-[2rem] border border-border/70 bg-card/72 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.36)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Portfolio analytics</p>
          <p className="text-xs text-muted-foreground">
            {isFetching ? 'Refreshing analytics...' : 'Unified view of holdings and card flows.'}
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {overview.address.slice(0, 10)}…{overview.address.slice(-6)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card/75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`flex h-11 w-11 items-center justify-center rounded-[1.2rem] ${stat.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card/74">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Monthly activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/75" />
              Spent
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success/75" />
              Received
            </span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            {stats.monthly.map((item, index) => (
              <div key={`${item.year}-${item.month}`} className="flex flex-col items-center gap-2">
                <div className="flex h-52 w-full items-end justify-center gap-1 rounded-[1.2rem] bg-muted/35 px-1.5 pb-2">
                  <div
                    className="w-3 rounded-t-full bg-destructive/75"
                    style={{ height: `${(item.spent / chartMax) * 100}%`, minHeight: item.spent > 0 ? 6 : 0 }}
                    title={`Spent ${formatCurrency(item.spent)}`}
                  />
                  <div
                    className="w-3 rounded-t-full bg-success/75"
                    style={{ height: `${(item.received / chartMax) * 100}%`, minHeight: item.received > 0 ? 6 : 0 }}
                    title={`Received ${formatCurrency(item.received)}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{MONTHS[index]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="bg-card/74">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Category breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.categoryBreakdown.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No categorized transactions yet.</p>
            ) : (
              stats.categoryBreakdown.map((item) => {
                const percentage = categoryTotal > 0 ? (item.total / categoryTotal) * 100 : 0;
                return (
                  <div key={item.categoryId ?? 'uncategorized'} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.categoryColor ?? '#94a3b8' }}
                        />
                        <span>{item.categoryName ?? 'Uncategorized'}</span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-foreground">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/45">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%`,
                          backgroundColor: item.categoryColor ?? '#94a3b8',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/74">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Portfolio snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-[1.4rem] border border-border/70 bg-background/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current balance</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(overview.totalBalanceUsd)}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tracked assets</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{overview.holdings.length}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Transactions</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{overview.totalTransactions}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

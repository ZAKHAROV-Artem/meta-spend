'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';

import { MetaMaskCardWidget } from '@/components/dashboard/MetaMaskCardWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { usePortfolioOverview } from '@/hooks/api/usePortfolioOverview';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { formatMoney } from '@/lib/format';

const DONUT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

function monthLabel(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yyyy');
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="px-4 py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-bold tabular-nums tracking-tight sm:text-xl">{value}</p>
        {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioOverview({
    refetchInterval: 45_000,
  });
  const { data: stats, isLoading: statsLoading } = useTransactionStats({});

  const ccy = stats?.displayCurrency ?? null;
  const now = new Date();
  const currentMonth = stats?.monthly.find(
    (m) => m.year === now.getUTCFullYear() && m.month === now.getUTCMonth() + 1,
  );

  const avgPerTx =
    stats && stats.txCount > 0 ? stats.totalSpent / stats.txCount : 0;

  const donutData = useMemo(() => {
    return (stats?.categoryShares ?? []).slice(0, 5).map((item, i) => ({
      name: item.categoryName ?? 'Uncategorized',
      value: item.total,
      fill: item.categoryColor ?? DONUT_COLORS[i % DONUT_COLORS.length],
      categoryId: item.categoryId,
    }));
  }, [stats?.categoryShares]);

  const donutConfig: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        donutData.map((item, i) => [
          item.name,
          { label: item.name, color: item.fill ?? DONUT_COLORS[i % DONUT_COLORS.length] },
        ]),
      ),
    [donutData],
  );

  const loading = (portfolioLoading && !portfolio) || (statsLoading && !stats);
  const hasNoTransactions = !loading && (stats?.txCount ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Card balance matches MetaMask Portfolio after each extension sync.
        </p>
      </div>

      {hasNoTransactions && (
        <div className="rounded-xl border-l-4 border-primary bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">
                🦊 Connect the MetaSpend extension
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Install the Chrome extension and open MetaMask Portfolio to sync your first transactions.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Install extension →
              </a>
              <Link
                href="/settings"
                className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          {loading ? (
            <Skeleton className="aspect-[343/215] w-full max-w-[22rem] rounded-2xl" />
          ) : (
            <MetaMaskCardWidget
              balanceAmount={portfolio?.cardBalance?.amount ?? null}
              balanceCurrency={portfolio?.cardBalance?.currency ?? null}
              address={portfolio?.address ?? null}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
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
                  sub={`${stats?.txCount ?? 0} tx`}
                />
                <StatTile label="Transactions" value={String(stats?.txCount ?? 0)} />
              </>
            )}
          </div>

          <RecentTransactions />

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <div>
                <CardTitle className="text-base font-semibold">Top categories</CardTitle>
                <p className="text-xs text-muted-foreground">Share of spend · tap chart for analytics</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/analytics">Open analytics</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 px-5 pb-6 sm:flex-row sm:items-start">
              {loading ? (
                <Skeleton className="h-[160px] w-[160px] rounded-full" />
              ) : donutData.length === 0 ? (
                <p className="py-8 text-sm text-muted-foreground">No categorized spend yet.</p>
              ) : (
                <>
                  <Link href="/analytics" className="block shrink-0 transition-opacity hover:opacity-90">
                    <ChartContainer config={donutConfig} className="mx-auto h-[160px] w-[160px]">
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              nameKey="name"
                              formatter={(value) => (
                                <span className="font-mono font-medium">
                                  {formatMoney(Number(value), ccy)}
                                </span>
                              )}
                            />
                          }
                        />
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="58%"
                          outerRadius="88%"
                          paddingAngle={2}
                        >
                          {donutData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </Link>
                  <ul className="w-full flex-1 space-y-1.5 text-sm">
                    {donutData.map((row, i) => (
                      <li key={row.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: row.fill ?? DONUT_COLORS[i % DONUT_COLORS.length],
                          }}
                        />
                        <span className="min-w-0 flex-1 truncate">{row.name}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatMoney(row.value, ccy)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

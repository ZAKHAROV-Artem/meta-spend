'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, BarChart2, Calendar, TrendingDown, X } from 'lucide-react';

import {
  AvgTransactionAmountChart,
  CategoriesChart,
  CumulativeSpendChart,
  ExchangeRateTrendChart,
  MonthlySpendChart,
  TopMerchantsChart,
} from '@/components/analytics/analytics-charts';
import {
  AnalyticsDateRangeProvider,
  GlobalRangePicker,
  useGlobalTransactionStats,
} from '@/components/analytics/analytics-date-range';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/format';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

function monthLabel(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yy');
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-start justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          {Icon ? <Icon className="text-muted-foreground h-4 w-4 shrink-0" /> : null}
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums leading-tight tracking-tight sm:text-3xl">
          {value}
        </p>
        {sub ? <p className="text-muted-foreground mt-1.5 text-xs">{sub}</p> : null}
        {children}
      </CardContent>
    </Card>
  );
}

function AnalyticsOverviewContent({ embedded = false }: { embedded?: boolean }) {
  const [currencyDismissed, setCurrencyDismissed] = useState(false);
  const { data, isLoading, isFetching } = useGlobalTransactionStats();

  useEffect(() => {
    if (data?.mixedCurrencyNotice) setCurrencyDismissed(false);
  }, [data?.mixedCurrencyNotice]);

  const ccy = data?.displayCurrency ?? null;
  const now = new Date();
  const currentMonth = data?.monthly.find(
    (m) => m.year === now.getUTCFullYear() && m.month === now.getUTCMonth() + 1,
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        {!embedded ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : null}
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!embedded && !isLoading && data && data.txCount === 0) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Card Spend Analytics</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Based on synced MetaMask Card transactions
            </p>
          </div>
          <GlobalRangePicker />
        </div>
        <Card>
          <CardContent className="px-4 py-0">
            <EmptyState
              icon="📊"
              title="No analytics data yet"
              description="Sync your first MetaMask Card transactions and your spend analytics will appear here."
              action={{ label: 'Go to Transactions', href: '/transactions' }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (embedded && !isLoading && data && data.txCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'space-y-5 transition-opacity duration-200',
        isFetching ? 'opacity-80' : 'opacity-100',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {!embedded ? (
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Card Spend Analytics</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Based on synced MetaMask Card transactions
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Spending breakdown</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Global range syncs all charts · each chart can use its own range
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="border-border/70 bg-muted/30 flex items-center gap-2 rounded-full border px-1 py-1">
            <span className="text-muted-foreground pl-2 text-[11px] font-medium uppercase tracking-wide">
              All charts
            </span>
            <GlobalRangePicker />
          </div>
        </div>
      </div>

      {!embedded ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total spend"
            icon={TrendingDown}
            value={formatMoney(data?.totalSpent ?? 0, ccy)}
            sub={`Net ${formatMoney(data?.netSpendPrimary ?? 0, ccy)} after refunds`}
          >
            {typeof data?.declinedCount === 'number' && data.declinedCount > 0 ? (
              <div className="mt-2.5">
                <Badge variant="secondary">{data.declinedCount} declined</Badge>
              </div>
            ) : null}
          </StatCard>

          <StatCard
            label="This month"
            icon={Calendar}
            value={formatMoney(currentMonth?.spent ?? 0, ccy)}
            sub={currentMonth ? monthLabel(currentMonth.year, currentMonth.month) : 'No data yet'}
          />

          <StatCard
            label="Refunds received"
            icon={ArrowDownCircle}
            value={formatMoney(data?.totalReceived ?? 0, ccy)}
            sub={`${data?.refundCount ?? 0} refund transactions`}
          />

          <StatCard
            label="Avg monthly"
            icon={BarChart2}
            value={formatMoney(
              (data?.monthly ?? []).length
                ? (data?.monthly ?? []).reduce((s, m) => s + m.spent, 0) /
                    (data?.monthly ?? []).length
                : 0,
              ccy,
            )}
            sub="Mean across global range"
          />
        </div>
      ) : null}

      <ExchangeRateTrendChart />
      <AvgTransactionAmountChart />

      {data?.mixedCurrencyNotice && !currencyDismissed ? (
        <div className="border-border bg-muted/50 flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            Multiple currencies detected. Amounts shown in primary currency where possible.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrencyDismissed(true)}
            className="text-muted-foreground hover:text-foreground shrink-0 rounded-full"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-5">
        <MonthlySpendChart />
        <CategoriesChart />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <CumulativeSpendChart />
        <TopMerchantsChart />
      </div>
    </div>
  );
}

export function AnalyticsOverview({ embedded = false }: { embedded?: boolean }) {
  return (
    <AnalyticsDateRangeProvider>
      <AnalyticsOverviewContent embedded={embedded} />
    </AnalyticsDateRangeProvider>
  );
}

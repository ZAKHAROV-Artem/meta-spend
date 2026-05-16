'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { PeriodComparison } from '@/components/analytics/PeriodComparison';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { DateRangePicker, type AnalyticsRange } from '@/components/filters/DateRangePicker';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

function monthLabel(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yy');
}

function monthLabelShort(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM');
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

function StatCard({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight tabular-nums leading-tight sm:text-3xl">
          {value}
        </p>
        {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
        {children}
      </CardContent>
    </Card>
  );
}

function toIsoDate(d?: Date): string | undefined {
  return d ? format(d, 'yyyy-MM-dd') : undefined;
}

export function AnalyticsOverview() {
  const router = useRouter();
  const [range, setRange] = useState<AnalyticsRange>({});
  const filters = useMemo(
    () => ({ from: toIsoDate(range.from), to: toIsoDate(range.to) }),
    [range.from, range.to],
  );
  const { data, isLoading, isFetching } = useTransactionStats(filters);

  const ccy = data?.displayCurrency ?? null;

  const monthlyChartData = useMemo(() => {
    const rows = (data?.monthly ?? []).map((item) => ({
      month: monthLabelShort(item.year, item.month),
      monthFull: monthLabel(item.year, item.month),
      year: item.year,
      monthNumber: item.month,
      spent: item.spent,
      refunds: item.received,
    }));
    // Linear regression (least squares) so the overlay line is one straight line.
    const n = rows.length;
    if (n < 2) return rows.map((row) => ({ ...row, trend: row.spent }));
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (let i = 0; i < n; i++) {
      const y = rows[i]!.spent;
      sumX += i;
      sumY += y;
      sumXY += i * y;
      sumXX += i * i;
    }
    const denom = n * sumXX - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return rows.map((row, i) => ({ ...row, trend: intercept + slope * i }));
  }, [data?.monthly]);

  const monthlyChartConfig: ChartConfig = {
    spent: { label: 'Spent', color: 'var(--chart-1)' },
    refunds: { label: 'Refunds', color: 'var(--chart-3)' },
  };

  const cumulativeChartData = useMemo(() => {
    let run = 0;
    return (data?.monthly ?? []).map((item) => {
      run += item.spent;
      return {
        month: monthLabelShort(item.year, item.month),
        monthFull: monthLabel(item.year, item.month),
        cumulative: run,
        delta: item.spent,
      };
    });
  }, [data?.monthly]);

  const cumulativeChartConfig: ChartConfig = {
    cumulative: { label: 'Cumulative', color: 'var(--chart-2)' },
    delta: { label: 'This month', color: 'var(--chart-1)' },
  };

  const velocity = useMemo(() => {
    const rows = data?.monthly ?? [];
    if (!rows.length) return null;
    const spends = rows.map((m) => m.spent);
    const sum = spends.reduce((a, b) => a + b, 0);
    const avg = sum / spends.length;
    const max = Math.max(...spends);
    const pos = spends.filter((s) => s > 0);
    const min = pos.length ? Math.min(...pos) : 0;
    const maxMonth = rows.find((m) => m.spent === max);
    const minMonth = min > 0 ? rows.find((m) => m.spent === min) : undefined;
    return { avg, max, min, maxMonth, minMonth };
  }, [data?.monthly]);

  const merchantChartData = useMemo(
    () =>
      (data?.topMerchants ?? []).slice(0, 8).map((m) => ({
        key: m.key,
        shortName:
          m.displayName.length > 26 ? `${m.displayName.slice(0, 24)}…` : m.displayName,
        displayName: m.displayName,
        total: m.total,
        count: m.count,
        currency: m.currency ?? ccy,
      })),
    [data?.topMerchants, ccy],
  );

  const merchantChartConfig: ChartConfig = {
    total: { label: 'Spend', color: 'var(--chart-1)' },
  };

  const categoryChartData = useMemo(
    () =>
      (data?.categoryShares ?? []).slice(0, 8).map((item, i) => ({
        categoryId: item.categoryId,
        name: item.categoryName ?? 'Uncategorized',
        value: item.total,
        percent: item.sharePercent,
        count: item.count,
        fill: item.categoryColor ?? CHART_COLORS[i % CHART_COLORS.length],
      })),
    [data?.categoryShares],
  );

  const categoryChartConfig: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        categoryChartData.map((item, i) => [
          item.name,
          { label: item.name, color: item.fill ?? CHART_COLORS[i % CHART_COLORS.length] },
        ]),
      ),
    [categoryChartData],
  );

  const now = new Date();
  const currentMonth = data?.monthly.find(
    (m) => m.year === now.getUTCFullYear() && m.month === now.getUTCMonth() + 1,
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!isLoading && data && data.txCount === 0) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Card Spend Analytics</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Based on synced MetaMask Card transactions
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} align="end" />
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

  const goToTransactions = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    if (filters.from) query.set('from', filters.from);
    if (filters.to) query.set('to', filters.to);
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    router.push(`/transactions${query.toString() ? `?${query.toString()}` : ''}`);
  };

  return (
    <div
      className={cn(
        'space-y-5 transition-opacity duration-200',
        isFetching ? 'opacity-85' : 'opacity-100',
      )}
    >
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Card Spend Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Based on synced MetaMask Card transactions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} align="end" />
          {isFetching ? <Badge variant="outline">Updating…</Badge> : null}
          {data?.mixedCurrencyNotice ? (
            <Badge variant="secondary">Mixed currencies</Badge>
          ) : ccy ? (
            <Badge variant="secondary">{ccy}</Badge>
          ) : (
            <Badge variant="outline">Awaiting data</Badge>
          )}
          <Badge variant="outline">{data?.txCount ?? 0} transactions</Badge>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total spend"
          value={formatMoney(data?.totalSpent ?? 0, ccy)}
          sub={`Net ${formatMoney(data?.netSpendPrimary ?? 0, ccy)} after refunds`}
        >
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {typeof data?.declinedCount === 'number' && data.declinedCount > 0 && (
              <Badge variant="secondary">{data.declinedCount} declined</Badge>
            )}
            {typeof data?.refundCount === 'number' && data.refundCount > 0 && (
              <Badge variant="outline" className="border-success/40 text-success">
                {data.refundCount} refunds
              </Badge>
            )}
          </div>
        </StatCard>

        <StatCard
          label="This month"
          value={formatMoney(currentMonth?.spent ?? 0, ccy)}
          sub={currentMonth ? monthLabel(currentMonth.year, currentMonth.month) : 'No data yet'}
        />

        <StatCard
          label="Refunds received"
          value={formatMoney(data?.totalReceived ?? 0, ccy)}
          sub={`${data?.refundCount ?? 0} refund transactions`}
        />
      </div>

      {/* Spend velocity (same date filter as above) */}
      {velocity && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Avg monthly spend"
            value={formatMoney(velocity.avg, ccy)}
            sub="Mean across months in range"
          />
          <StatCard
            label="Peak month"
            value={formatMoney(velocity.max, ccy)}
            sub={
              velocity.maxMonth
                ? monthLabel(velocity.maxMonth.year, velocity.maxMonth.month)
                : '—'
            }
          />
          <StatCard
            label="Quietest month"
            value={velocity.min > 0 ? formatMoney(velocity.min, ccy) : '—'}
            sub={
              velocity.minMonth && velocity.min > 0
                ? monthLabel(velocity.minMonth.year, velocity.minMonth.month)
                : 'No spend months'
            }
          />
        </div>
      )}

      {/* Mixed currency breakdown */}
      {data?.mixedCurrencyNotice && data.byCurrency.length > 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.byCurrency.map((slice) => (
            <Card key={slice.currency}>
              <CardContent className="px-5 py-4">
                <p className="text-sm text-muted-foreground">{slice.currency}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatMoney(slice.netSpend, slice.currency)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoney(slice.totalSpent, slice.currency)} spent ·{' '}
                  {formatMoney(slice.totalReceived, slice.currency)} back · {slice.txCount} tx
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts row: monthly + category side-by-side on lg screens */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Monthly bar chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Monthly spend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            {monthlyChartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No monthly data yet.</p>
            ) : (
              <ChartContainer
                config={monthlyChartConfig}
                className="h-[200px] w-full sm:h-[220px]"
              >
                <BarChart
                  accessibilityLayer
                  data={monthlyChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={52}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => formatMoneyCompact(v as number, ccy)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <span className="font-mono font-medium">
                            {formatMoney(Number(value), ccy)}
                            <span className="ml-1 text-muted-foreground font-normal">
                              {name === 'spent' ? 'spent' : 'refunds'}
                            </span>
                          </span>
                        )}
                      />
                    }
                  />
                  {(data?.totalReceived ?? 0) > 0 && (
                    <ChartLegend
                      content={(props) => (
                        <ChartLegendContent
                          payload={props.payload ?? []}
                          verticalAlign={props.verticalAlign ?? 'bottom'}
                        />
                      )}
                    />
                  )}
                  <Bar
                    dataKey="spent"
                    fill="var(--color-spent)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                    className="cursor-pointer"
                    onClick={(payload) => {
                      const point = payload?.payload as
                        | { year?: number; monthNumber?: number }
                        | undefined;
                      if (!point?.year || !point?.monthNumber) return;
                      const from = format(
                        new Date(Date.UTC(point.year, point.monthNumber - 1, 1)),
                        'yyyy-MM-dd',
                      );
                      const to = format(
                        new Date(Date.UTC(point.year, point.monthNumber, 0)),
                        'yyyy-MM-dd',
                      );
                      goToTransactions({ from, to });
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="trend"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    tooltipType="none"
                    isAnimationActive={false}
                  />
                  {(data?.totalReceived ?? 0) > 0 && (
                    <Bar
                      dataKey="refunds"
                      fill="var(--color-refunds)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  )}
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Category donut chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1 pt-4 px-5">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold">By category</CardTitle>
              <span className="text-xs text-muted-foreground">
                {categoryChartData.length} buckets
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {categoryChartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No categorized spend yet.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
                <ChartContainer
                  config={categoryChartConfig}
                  className="h-[180px] w-[180px] shrink-0 sm:h-[200px] sm:w-[200px] lg:mx-auto xl:mx-0"
                >
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
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="82%"
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(slice) => {
                        const categoryId = (slice as { categoryId?: string | null })?.categoryId;
                        if (!categoryId) return;
                        goToTransactions({ categoryId });
                      }}
                      className="cursor-pointer"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.fill ?? CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="w-full flex-1 space-y-2 min-w-0">
                  {categoryChartData.map((item, i) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        if (!item.categoryId) return;
                        goToTransactions({ categoryId: item.categoryId });
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 text-sm hover:bg-muted/50"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: item.fill ?? CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatMoney(item.value, ccy)}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums w-12 text-right">
                        {item.percent}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cumulative spend */}
      <Card>
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-base font-semibold">Cumulative spend</CardTitle>
          <p className="text-xs text-muted-foreground">Running total over months in this range</p>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          {cumulativeChartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No monthly data yet.</p>
          ) : (
            <ChartContainer config={cumulativeChartConfig} className="h-[200px] w-full sm:h-[220px]">
              <ComposedChart data={cumulativeChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={52}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => formatMoneyCompact(v as number, ccy)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span className="font-mono font-medium">
                          {formatMoney(Number(value), ccy)}
                          <span className="ml-1 text-muted-foreground font-normal">
                            {name === 'cumulative' ? ' cumulative' : ' this month'}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--color-cumulative)"
                  fill="var(--color-cumulative)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Line
                  type="linear"
                  dataKey="delta"
                  stroke="var(--color-delta)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  legendType="none"
                  tooltipType="none"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <PeriodComparison />

      {/* Top merchants */}
      <Card>
        <CardHeader className="pb-1 pt-4 px-5">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">Top merchants</CardTitle>
            <span className="text-xs text-muted-foreground">By total spend</span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {(data?.topMerchants ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No merchant data yet.
            </p>
          ) : merchantChartData.length >= 3 ? (
            <ChartContainer
              config={merchantChartConfig}
              className="aspect-auto w-full min-h-[180px]"
              style={{
                height: Math.min(merchantChartData.length * 44 + 56, 380),
              }}
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={merchantChartData}
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatMoneyCompact(v as number, ccy)}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={112}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono font-medium">
                          {formatMoney(Number(value), ccy)}
                        </span>
                      )}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as { displayName?: string })?.displayName ?? ''
                      }
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={22}
                  className="cursor-pointer"
                  onClick={(payload) => {
                    const row = payload?.payload as { displayName?: string } | undefined;
                    if (!row?.displayName) return;
                    goToTransactions({ search: row.displayName });
                  }}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {data!.topMerchants.slice(0, 8).map((m, i) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => goToTransactions({ search: m.displayName })}
                  className="flex items-center gap-3 rounded-md px-1 py-0.5 text-left hover:bg-muted/50"
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.displayName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.count} tx</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatMoneyCompact(m.total, (m.currency ?? ccy) as string | null)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

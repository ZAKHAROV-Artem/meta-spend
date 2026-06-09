'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { AnalyticsChartHeader } from '@/components/analytics/AnalyticsChartHeader';
import { Button } from '@/components/ui/button';
import {
  useChartGoToTransactions,
  useChartTransactionStats,
} from '@/components/analytics/analytics-date-range';
import {
  avgTransactionChartConfig,
  buildAvgTransactionSeries,
  buildCategoryChartConfig,
  buildCategoryChartData,
  buildCumulativeChartData,
  buildExchangeRateSeries,
  buildMerchantChartData,
  buildMonthlyChartData,
  cumulativeChartConfig,
  exchangeRateChartConfig,
  merchantChartConfig,
  monthlyChartConfig,
} from '@/components/analytics/analytics-chart-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatMoney, formatMoneyCompact } from '@/lib/format';

function formatRate(
  value: number | null | undefined,
  fiatCurrency?: string | null,
  cryptoSymbol?: string | null,
) {
  if (value == null || !Number.isFinite(value)) return '—';
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
  return fiatCurrency && cryptoSymbol ? `${formatted} ${fiatCurrency}/${cryptoSymbol}` : formatted;
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function MonthlySpendChart() {
  const { data } = useChartTransactionStats('monthly');
  const goToTransactions = useChartGoToTransactions('monthly');

  const ccy = data?.displayCurrency ?? null;
  const monthlyChartData = useMemo(() => buildMonthlyChartData(data), [data]);

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="px-5 pb-1 pt-4">
        <AnalyticsChartHeader chartId="monthly" title="Monthly spend" />
      </CardHeader>
      <CardContent className="px-3 pb-4">
        {monthlyChartData.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">No monthly data yet.</p>
        ) : (
          <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
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
                        <span className="text-muted-foreground ml-1 font-normal">
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
                  const point = payload?.payload as { year?: number; monthNumber?: number } | undefined;
                  if (!point?.year || !point?.monthNumber) return;
                  const from = format(
                    new Date(Date.UTC(point.year, point.monthNumber - 1, 1)),
                    'yyyy-MM-dd',
                  );
                  const to = format(new Date(Date.UTC(point.year, point.monthNumber, 0)), 'yyyy-MM-dd');
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
  );
}

export function CategoriesChart() {
  const { data } = useChartTransactionStats('categories');
  const goToTransactions = useChartGoToTransactions('categories');

  const ccy = data?.displayCurrency ?? null;
  const categoryChartData = useMemo(() => buildCategoryChartData(data), [data]);
  const categoryChartConfig = useMemo(
    () => buildCategoryChartConfig(categoryChartData),
    [categoryChartData],
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="px-5 pb-1 pt-4">
        <AnalyticsChartHeader
          chartId="categories"
          title="Categories"
          trailing={
            <span className="text-muted-foreground text-xs">{categoryChartData.length} buckets</span>
          }
        />
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {categoryChartData.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">No categorized spend yet.</p>
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
                        <span className="font-mono font-medium">{formatMoney(Number(value), ccy)}</span>
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
                  <Label
                    content={({ viewBox }) => {
                      const vb = viewBox as { cx?: number; cy?: number };
                      if (vb?.cx == null || vb?.cy == null) return null;
                      const total = formatMoneyCompact(data?.totalSpent ?? 0, ccy);
                      return (
                        <text x={vb.cx} y={vb.cy} textAnchor="middle" dominantBaseline="central">
                          <tspan
                            x={vb.cx}
                            dy="-0.3em"
                            className="fill-foreground"
                            style={{ fontSize: '13px', fontWeight: 700 }}
                          >
                            {total}
                          </tspan>
                          <tspan x={vb.cx} dy="1.2em" className="fill-muted-foreground" style={{ fontSize: '10px' }}>
                            total
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="w-full min-w-0 flex-1 space-y-2">
              {categoryChartData.map((item, i) => (
                <Button
                  key={item.name}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (!item.categoryId) return;
                    goToTransactions({ categoryId: item.categoryId });
                  }}
                  className="h-auto w-full justify-start gap-2.5 rounded-md px-1 py-0.5 text-sm font-normal"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{
                      backgroundColor: item.fill ?? CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {formatMoney(item.value, ccy)}
                  </span>
                  <span className="w-12 shrink-0 text-right font-medium tabular-nums">{item.percent}%</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CumulativeSpendChart() {
  const { data } = useChartTransactionStats('cumulative');
  const ccy = data?.displayCurrency ?? null;
  const cumulativeChartData = useMemo(() => buildCumulativeChartData(data), [data]);

  return (
    <Card>
      <CardHeader className="px-5 pb-1 pt-4">
        <AnalyticsChartHeader
          chartId="cumulative"
          title="Cumulative spend"
          description="Running total over months in this range"
        />
      </CardHeader>
      <CardContent className="px-3 pb-4">
        {cumulativeChartData.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">No monthly data yet.</p>
        ) : (
          <ChartContainer config={cumulativeChartConfig} className="h-[220px] w-full sm:h-[240px]">
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
                        <span className="text-muted-foreground ml-1 font-normal">
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
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TopMerchantsChart() {
  const { data } = useChartTransactionStats('merchants');
  const goToTransactions = useChartGoToTransactions('merchants');

  const ccy = data?.displayCurrency ?? null;
  const merchantChartData = useMemo(() => buildMerchantChartData(data, ccy), [data, ccy]);

  return (
    <Card>
      <CardHeader className="px-5 pb-1 pt-4">
        <AnalyticsChartHeader
          chartId="merchants"
          title="Top merchants"
          trailing={<span className="text-muted-foreground text-xs">By total spend</span>}
        />
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {(data?.topMerchants ?? []).length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No merchant data yet.</p>
        ) : merchantChartData.length >= 3 ? (
          <ChartContainer
            config={merchantChartConfig}
            className="aspect-auto min-h-[180px] w-full"
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
                      <span className="font-mono font-medium">{formatMoney(Number(value), ccy)}</span>
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
            {(data?.topMerchants ?? []).slice(0, 8).map((m, i) => (
              <Button
                key={m.key}
                type="button"
                variant="ghost"
                onClick={() => goToTransactions({ search: m.displayName })}
                className="h-auto w-full justify-start gap-3 rounded-md px-1 py-0.5 text-left font-normal"
              >
                <span className="text-muted-foreground w-5 shrink-0 text-right text-xs tabular-nums">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.displayName}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{m.count} tx</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatMoneyCompact(m.total, (m.currency ?? ccy) as string | null)}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExchangeRateTrendChart() {
  const { data } = useChartTransactionStats('exchangeRate');
  const exchangeRateSeries = useMemo(() => buildExchangeRateSeries(data), [data]);

  if (!exchangeRateSeries) return null;

  return (
    <Card>
      <CardHeader className="px-5 pb-2 pt-4">
        <AnalyticsChartHeader
          chartId="exchangeRate"
          title="Exchange rate trend"
          description="Daily weighted rate from card spend, based on fiat paid divided by crypto spent."
          trailing={
            <>
              <Badge variant="secondary">
                {exchangeRateSeries.fiatCurrency}/{exchangeRateSeries.cryptoSymbol}
              </Badge>
              {exchangeRateSeries.changePct !== null ? (
                <Badge variant={exchangeRateSeries.changePct >= 0 ? 'warning' : 'success'}>
                  {exchangeRateSeries.changePct >= 0 ? '+' : ''}
                  {exchangeRateSeries.changePct.toFixed(1)}%
                </Badge>
              ) : null}
            </>
          }
        />
      </CardHeader>
      <CardContent className="grid gap-4 px-5 pb-5 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          {exchangeRateSeries.data.length < 2 ? (
            <div className="border-border/70 bg-muted/20 flex h-[220px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
              Sync transactions from more than one day to see the trend line.
            </div>
          ) : (
            <ChartContainer config={exchangeRateChartConfig} className="h-[240px] w-full">
              <ComposedChart
                accessibilityLayer
                data={exchangeRateSeries.data}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={56}
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 })}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const point = payload?.[0]?.payload as { date?: string; txCount?: number } | undefined;
                        return point?.date ? `${point.date} · ${point.txCount ?? 0} tx` : '';
                      }}
                      formatter={(value, name) => (
                        <span className="font-mono font-medium">
                          {formatRate(Number(value), exchangeRateSeries.fiatCurrency, exchangeRateSeries.cryptoSymbol)}
                          <span className="text-muted-foreground ml-1 font-normal">
                            {name === 'average' ? 'weighted avg' : 'daily'}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-rate)"
                  fill="var(--color-rate)"
                  fillOpacity={0.12}
                  strokeWidth={2.25}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="linear"
                  dataKey="average"
                  stroke="var(--color-average)"
                  strokeWidth={1.75}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </div>

        <div className="grid content-start gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Latest</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatRate(
                exchangeRateSeries.latest?.rate,
                exchangeRateSeries.fiatCurrency,
                exchangeRateSeries.cryptoSymbol,
              )}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Weighted avg</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatRate(
                exchangeRateSeries.weightedAverage,
                exchangeRateSeries.fiatCurrency,
                exchangeRateSeries.cryptoSymbol,
              )}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Range</p>
            <p className="mt-1 font-semibold tabular-nums">
              {exchangeRateSeries.min.toLocaleString(undefined, { maximumFractionDigits: 3 })} -{' '}
              {exchangeRateSeries.max.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Direction</p>
            <p className="mt-1 font-semibold">
              {exchangeRateSeries.changePct === null
                ? 'Need more data'
                : exchangeRateSeries.changePct > 0
                  ? 'Fiat cost rose'
                  : exchangeRateSeries.changePct < 0
                    ? 'Fiat cost fell'
                    : 'Flat'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AvgTransactionAmountChart() {
  const { data } = useChartTransactionStats('avgTransaction');
  const avgTransactionSeries = useMemo(() => buildAvgTransactionSeries(data), [data]);

  if (!avgTransactionSeries) return null;

  return (
    <Card>
      <CardHeader className="px-5 pb-2 pt-4">
        <AnalyticsChartHeader
          chartId="avgTransaction"
          title="Average transaction amount"
          description="Daily mean spend per transaction in your primary currency."
          trailing={
            <>
              <Badge variant="secondary">{avgTransactionSeries.currency}</Badge>
              {avgTransactionSeries.changePct !== null ? (
                <Badge variant={avgTransactionSeries.changePct >= 0 ? 'warning' : 'success'}>
                  {avgTransactionSeries.changePct >= 0 ? '+' : ''}
                  {avgTransactionSeries.changePct.toFixed(1)}%
                </Badge>
              ) : null}
            </>
          }
        />
      </CardHeader>
      <CardContent className="grid gap-4 px-5 pb-5 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          {avgTransactionSeries.data.length < 2 ? (
            <div className="border-border/70 bg-muted/20 flex h-[220px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
              Sync transactions from more than one day to see the trend line.
            </div>
          ) : (
            <ChartContainer config={avgTransactionChartConfig} className="h-[240px] w-full">
              <ComposedChart
                accessibilityLayer
                data={avgTransactionSeries.data}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={56}
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatMoneyCompact(Number(value), avgTransactionSeries.currency)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const point = payload?.[0]?.payload as { date?: string; txCount?: number } | undefined;
                        return point?.date ? `${point.date} · ${point.txCount ?? 0} tx` : '';
                      }}
                      formatter={(value, name) => (
                        <span className="font-mono font-medium">
                          {formatMoney(Number(value), avgTransactionSeries.currency)}
                          <span className="text-muted-foreground ml-1 font-normal">
                            {name === 'periodAverage' ? 'period avg' : 'daily'}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="avgAmount"
                  stroke="var(--color-avgAmount)"
                  fill="var(--color-avgAmount)"
                  fillOpacity={0.12}
                  strokeWidth={2.25}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="linear"
                  dataKey="periodAverage"
                  stroke="var(--color-periodAverage)"
                  strokeWidth={1.75}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </div>

        <div className="grid content-start gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Latest day</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatMoney(avgTransactionSeries.latest?.avgAmount ?? 0, avgTransactionSeries.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Period avg</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatMoney(avgTransactionSeries.periodAverage ?? 0, avgTransactionSeries.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Range</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatMoney(avgTransactionSeries.min, avgTransactionSeries.currency)} –{' '}
              {formatMoney(avgTransactionSeries.max, avgTransactionSeries.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Direction</p>
            <p className="mt-1 font-semibold">
              {avgTransactionSeries.changePct === null
                ? 'Need more data'
                : avgTransactionSeries.changePct > 0
                  ? 'Ticket size rose'
                  : avgTransactionSeries.changePct < 0
                    ? 'Ticket size fell'
                    : 'Flat'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

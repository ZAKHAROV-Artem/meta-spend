'use client';

import { useMemo, useState } from 'react';
import { endOfDay, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { CategorySpendShare } from '@crypto-tracker/shared';
import type { AnalyticsRange } from '@/components/filters/DateRangePicker';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

function toIsoDate(d?: Date): string | undefined {
  return d ? format(d, 'yyyy-MM-dd') : undefined;
}

function formatRangeShort(range: AnalyticsRange): string {
  if (!range.from && !range.to) return 'All time';
  if (range.from && range.to)
    return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yy')}`;
  if (range.from) return format(range.from, 'MMM d, yy');
  return format(range.to!, 'MMM d, yy');
}

function pctChange(prev: number, next: number): number | null {
  if (prev === 0) return null;
  return ((next - prev) / prev) * 100;
}

export function PeriodComparison() {
  const [rangeA, setRangeA] = useState<AnalyticsRange>(() => {
    const m = subMonths(new Date(), 1);
    return { from: startOfMonth(m), to: endOfMonth(m) };
  });
  const [rangeB, setRangeB] = useState<AnalyticsRange>(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfDay(now) };
  });

  const filtersA = useMemo(
    () => ({ from: toIsoDate(rangeA.from), to: toIsoDate(rangeA.to) }),
    [rangeA.from, rangeA.to],
  );
  const filtersB = useMemo(
    () => ({ from: toIsoDate(rangeB.from), to: toIsoDate(rangeB.to) }),
    [rangeB.from, rangeB.to],
  );

  const qA = useTransactionStats(filtersA);
  const qB = useTransactionStats(filtersB);

  const ccy = qA.data?.displayCurrency ?? qB.data?.displayCurrency ?? null;

  const barData = useMemo(() => {
    return [
      {
        period: formatRangeShort(rangeA),
        spent: qA.data?.totalSpent ?? 0,
        refunds: qA.data?.totalReceived ?? 0,
      },
      {
        period: formatRangeShort(rangeB),
        spent: qB.data?.totalSpent ?? 0,
        refunds: qB.data?.totalReceived ?? 0,
      },
    ];
  }, [
    qA.data?.totalSpent,
    qA.data?.totalReceived,
    qB.data?.totalSpent,
    qB.data?.totalReceived,
    rangeA,
    rangeB,
  ]);

  const barConfig: ChartConfig = {
    spent: { label: 'Spend', color: 'var(--chart-1)' },
    refunds: { label: 'Refunds', color: 'var(--chart-3)' },
  };

  const categoryRows = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        name: string;
        color: string | null;
        a: number;
        b: number;
      }
    >();

    const addShares = (shares: CategorySpendShare[] | undefined, side: 'a' | 'b') => {
      if (!shares) return;
      for (const row of shares) {
        const key = row.categoryId ?? `uncat:${row.categoryName ?? 'x'}`;
        const name = row.categoryName ?? 'Uncategorized';
        const existing = map.get(key) ?? {
          key,
          name,
          color: row.categoryColor,
          a: 0,
          b: 0,
        };
        if (side === 'a') existing.a = row.total;
        else existing.b = row.total;
        map.set(key, existing);
      }
    };

    addShares(qA.data?.categoryShares, 'a');
    addShares(qB.data?.categoryShares, 'b');

    return [...map.values()].sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b));
  }, [qA.data?.categoryShares, qB.data?.categoryShares]);

  const spendPct = pctChange(qA.data?.totalSpent ?? 0, qB.data?.totalSpent ?? 0);
  const refundPct = pctChange(qA.data?.totalReceived ?? 0, qB.data?.totalReceived ?? 0);

  const loading = (qA.isLoading && !qA.data) || (qB.isLoading && !qB.data);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 space-y-0 pb-2 pt-4 px-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Compare periods</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Side‑by‑side totals and category mix across two date ranges.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Period A
            </span>
            <DateRangePicker value={rangeA} onChange={setRangeA} align="end" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Period B
            </span>
            <DateRangePicker value={rangeB} onChange={setRangeB} align="end" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-5 pb-5">
        {loading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{formatMoney(qA.data?.totalSpent ?? 0, ccy)} · A</Badge>
              <Badge variant="outline">{formatMoney(qB.data?.totalSpent ?? 0, ccy)} · B</Badge>
              {spendPct != null && (
                <Badge
                  variant="secondary"
                  className={cn(spendPct <= 0 ? 'border-success/30 text-success' : '')}
                >
                  Spend Δ {spendPct >= 0 ? '+' : ''}
                  {spendPct.toFixed(1)}%
                </Badge>
              )}
              {refundPct != null && qB.data && (qA.data?.totalReceived ?? 0) + (qB.data.totalReceived ?? 0) > 0 && (
                <Badge variant="outline">
                  Refunds Δ {refundPct >= 0 ? '+' : ''}
                  {refundPct.toFixed(1)}%
                </Badge>
              )}
            </div>

            <ChartContainer config={barConfig} className="h-[220px] w-full">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 4, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 11 }}
                  tickMargin={8}
                  height={48}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatMoneyCompact(v as number, ccy)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span className="font-mono font-medium">
                          {formatMoney(Number(value), ccy)}
                          <span className="ml-1 font-normal text-muted-foreground">
                            {name === 'spent' ? 'spent' : 'refunds'}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                {(qA.data?.totalReceived ?? 0) + (qB.data?.totalReceived ?? 0) > 0 && (
                  <ChartLegend
                    content={(props) => (
                      <ChartLegendContent
                        payload={props.payload ?? []}
                        verticalAlign={props.verticalAlign ?? 'bottom'}
                      />
                    )}
                  />
                )}
                <Bar dataKey="spent" fill="var(--color-spent)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                {(qA.data?.totalReceived ?? 0) + (qB.data?.totalReceived ?? 0) > 0 && (
                  <Bar dataKey="refunds" fill="var(--color-refunds)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                )}
              </BarChart>
            </ChartContainer>

            <div>
              <h4 className="mb-2 text-sm font-medium">Categories</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right tabular-nums">Period A</TableHead>
                      <TableHead className="text-right tabular-nums">Period B</TableHead>
                      <TableHead className="text-right tabular-nums">Δ</TableHead>
                      <TableHead className="text-right tabular-nums">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No category breakdown for these ranges.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categoryRows.map((row) => {
                        const diff = row.b - row.a;
                        const pct = pctChange(row.a, row.b);
                        return (
                          <TableRow key={row.key}>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full ring-1 ring-border"
                                  style={{ backgroundColor: row.color ?? '#94a3b8' }}
                                />
                                <span className="truncate font-medium">{row.name}</span>
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(row.a, ccy)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(row.b, ccy)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                'text-right tabular-nums font-medium',
                                diff > 0 && 'text-destructive',
                                diff < 0 && 'text-success',
                              )}
                            >
                              {diff >= 0 ? '+' : ''}
                              {formatMoney(diff, ccy)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {pct == null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

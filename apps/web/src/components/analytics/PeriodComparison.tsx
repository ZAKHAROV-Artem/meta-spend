'use client';

import { useMemo, useState } from 'react';
import {
  endOfDay,
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import {
  ArrowLeftRight,
  ChevronDown,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import type { CategorySpendShare } from '@metaspend/shared';
import type { AnalyticsRange } from '@/components/filters/DateRangePicker';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

type CategorySort = 'delta-desc' | 'delta-asc' | 'name' | 'b-desc';

const QUICK_COMPARE = [
  {
    label: 'Last month vs this month',
    build: () => {
      const now = new Date();
      const prev = subMonths(now, 1);
      return {
        a: { from: startOfMonth(prev), to: endOfMonth(prev) },
        b: { from: startOfMonth(now), to: endOfDay(now) },
      };
    },
  },
  {
    label: 'Two months ago vs last month',
    build: () => {
      const last = subMonths(new Date(), 1);
      const prior = subMonths(new Date(), 2);
      return {
        a: { from: startOfMonth(prior), to: endOfMonth(prior) },
        b: { from: startOfMonth(last), to: endOfMonth(last) },
      };
    },
  },
  {
    label: 'YTD vs same period last year',
    build: () => {
      const now = new Date();
      const lastYear = subYears(now, 1);
      return {
        a: {
          from: startOfYear(lastYear),
          to: endOfDay(new Date(lastYear.getFullYear(), now.getMonth(), now.getDate())),
        },
        b: { from: startOfYear(now), to: endOfDay(now) },
      };
    },
  },
] as const;

const SORT_LABELS: Record<CategorySort, string> = {
  'delta-desc': 'Biggest change',
  'delta-asc': 'Smallest change',
  name: 'Name A–Z',
  'b-desc': 'Period B high',
};

function toIsoDate(d?: Date): string | undefined {
  return d ? format(d, 'yyyy-MM-dd') : undefined;
}

function pctChange(prev: number, next: number): number | null {
  if (prev === 0) return null;
  return ((next - prev) / prev) * 100;
}

function ChangePill({ delta, pct }: { delta: number; pct: number | null }) {
  const up = delta > 0;
  const down = delta < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums',
        up && 'border-destructive/25 bg-destructive/8 text-destructive',
        down && 'border-success/25 bg-success/8 text-success',
        !up && !down && 'border-border bg-muted/50 text-muted-foreground',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {pct != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : '—'}
    </span>
  );
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
  const [categorySort, setCategorySort] = useState<CategorySort>('delta-desc');

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
  const loading = (qA.isLoading && !qA.data) || (qB.isLoading && !qB.data);

  const spentA = qA.data?.totalSpent ?? 0;
  const spentB = qB.data?.totalSpent ?? 0;
  const txA = qA.data?.txCount ?? 0;
  const txB = qB.data?.txCount ?? 0;
  const spendDelta = spentB - spentA;
  const spendPct = pctChange(spentA, spentB);

  const categoryRows = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; color: string | null; a: number; b: number }
    >();

    const addShares = (shares: CategorySpendShare[] | undefined, side: 'a' | 'b') => {
      if (!shares) return;
      for (const row of shares) {
        const key = row.categoryId ?? `uncat:${row.categoryName ?? 'x'}`;
        const existing = map.get(key) ?? {
          key,
          name: row.categoryName ?? 'Uncategorized',
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

    const rows = [...map.values()];
    rows.sort((x, y) => {
      switch (categorySort) {
        case 'delta-asc':  return (x.b - x.a) - (y.b - y.a);
        case 'name':       return x.name.localeCompare(y.name);
        case 'b-desc':     return y.b - x.b;
        case 'delta-desc':
        default:           return (y.b - y.a) - (x.b - x.a);
      }
    });
    return rows;
  }, [qA.data?.categoryShares, qB.data?.categoryShares, categorySort]);

  const catMax = useMemo(
    () => Math.max(...categoryRows.map((r) => Math.max(r.a, r.b)), 1),
    [categoryRows],
  );

  const swapPeriods = () => {
    setRangeA(rangeB);
    setRangeB(rangeA);
  };

  return (
    <Card>
      <CardHeader className="space-y-0 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">Compare periods</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Side-by-side spend and category breakdown for two date ranges.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sparkles className="size-4" />
                  Quick compare
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {QUICK_COMPARE.map((preset) => (
                  <DropdownMenuItem
                    key={preset.label}
                    onClick={() => {
                      const { a, b } = preset.build();
                      setRangeA(a);
                      setRangeB(b);
                      toast.success(preset.label);
                    }}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={swapPeriods}
              aria-label="Swap periods"
            >
              <ArrowLeftRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-5 pb-6">
        {/* Period pickers + live totals */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Period A */}
          <div className="space-y-3 rounded-xl border border-border/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Period A
            </p>
            <DateRangePicker value={rangeA} onChange={setRangeA} align="start" />
            {loading ? (
              <Skeleton className="h-9 w-36 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-bold tabular-nums tracking-tight">
                  {formatMoney(spentA, ccy)}
                </span>
                <span className="text-sm text-muted-foreground">{txA} transactions</span>
              </div>
            )}
          </div>

          {/* Period B */}
          <div className="space-y-3 rounded-xl border border-border/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Period B
            </p>
            <DateRangePicker value={rangeB} onChange={setRangeB} align="end" />
            {loading ? (
              <Skeleton className="h-9 w-36 rounded-lg" />
            ) : (
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-3xl font-bold tabular-nums tracking-tight">
                  {formatMoney(spentB, ccy)}
                </span>
                <span className="text-sm text-muted-foreground">{txB} transactions</span>
                <ChangePill delta={spendDelta} pct={spendPct} />
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {!loading && categoryRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Spend by category</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    {SORT_LABELS[categorySort]}
                    <ChevronDown className="size-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(Object.keys(SORT_LABELS) as CategorySort[]).map((key) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setCategorySort(key)}
                      className={cn(categorySort === key && 'bg-accent')}
                    >
                      {SORT_LABELS[key]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-px overflow-hidden rounded-xl border border-border/60">
              {categoryRows.map((row) => {
                const diff = row.b - row.a;
                const pct = pctChange(row.a, row.b);
                const barA = (row.a / catMax) * 100;
                const barB = (row.b / catMax) * 100;
                const dot = row.color ?? '#94a3b8';

                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]"
                  >
                    {/* Name */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: dot }}
                      />
                      <span className="truncate text-base font-medium">{row.name}</span>
                    </div>

                    {/* Change pill — mobile right */}
                    <div className="flex items-center justify-end sm:hidden">
                      <ChangePill delta={diff} pct={pct} />
                    </div>

                    {/* Period A bar + value */}
                    <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-muted-foreground sm:hidden">A</span>
                        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                          {formatMoney(row.a, ccy)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-chart-2/60 transition-all"
                          style={{ width: `${barA.toFixed(1)}%` }}
                        />
                      </div>
                    </div>

                    {/* Period B bar + value */}
                    <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-muted-foreground sm:hidden">B</span>
                        <span className="ml-auto text-sm font-semibold tabular-nums">
                          {formatMoney(row.b, ccy)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-chart-1/80 transition-all"
                          style={{ width: `${barB.toFixed(1)}%` }}
                        />
                      </div>
                    </div>

                    {/* Change pill — desktop */}
                    <div className="hidden items-center justify-end sm:flex">
                      <ChangePill delta={diff} pct={pct} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-5 rounded-full bg-chart-2/60" />
                Period A
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-5 rounded-full bg-chart-1/80" />
                Period B
              </span>
            </div>
          </div>
        )}

        {!loading && categoryRows.length === 0 && (
          <p className="py-6 text-center text-base text-muted-foreground">
            No category data for these ranges.
          </p>
        )}

        {loading && <Skeleton className="h-48 w-full rounded-xl" />}
      </CardContent>
    </Card>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { CardTxStatus, Transaction } from '@crypto-tracker/shared';
import { useTransactions, useTransactionStats, type TransactionFilters } from '@/hooks/api/useTransactions';
import { useCurrentUser } from '@/hooks/api/useUserPreferences';
import { useCategories } from '@/hooks/api/useCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { DateRangePicker, type AnalyticsRange } from '@/components/filters/DateRangePicker';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: '' | CardTxStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'REFUNDED', label: 'Refunded' },
];

function formatCurrency(value: string, currency: string) {
  return formatMoney(Number(value), currency || 'USD');
}

function formatTokenAmount(value: string | number, symbol: string) {
  const n = Number(value);
  const amount = Number.isFinite(n)
    ? n.toLocaleString(undefined, {
        maximumFractionDigits: Math.abs(n) < 1 ? 8 : 4,
      })
    : String(value);
  return `${amount} ${symbol}`;
}

function exchangeRateLabel(rate: string | number | null, fiatCurrency: string | null, cryptoSymbol: string | null) {
  if (!rate || !fiatCurrency || !cryptoSymbol) return null;
  const n = Number(rate);
  const value = Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : String(rate);
  return `${value} ${fiatCurrency.toUpperCase()}/${cryptoSymbol}`;
}

function groupByDay(items: Transaction[]) {
  return items.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = format(new Date(item.occurredAt), 'yyyy-MM-dd');
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function dayFiatTotal(items: Transaction[]) {
  const currency = items.find((item) => item.fiatCurrency)?.fiatCurrency ?? 'USD';
  const total = items.reduce((sum, item) => sum + Number(item.fiatAmount ?? 0), 0);

  return formatCurrency(String(total), currency);
}

function CardListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-lg border bg-muted/35" />
      ))}
    </div>
  );
}

function statusVariant(status: CardTxStatus | null) {
  if (status === 'DECLINED') return 'destructive';
  if (status === 'PENDING') return 'warning';
  if (status === 'REFUNDED') return 'info';
  return 'success';
}

function categoryFilterLabel(categoryCount: number, subcategoryCount: number) {
  const total = categoryCount + subcategoryCount;
  if (total === 0) return 'All categories';
  if (categoryCount > 0 && subcategoryCount === 0) return categoryCount === 1 ? '1 category' : `${categoryCount} categories`;
  if (subcategoryCount > 0 && categoryCount === 0) {
    return subcategoryCount === 1 ? '1 subcategory' : `${subcategoryCount} subcategories`;
  }
  return total === 1 ? '1 filter' : `${total} filters`;
}

export function CardTransactionsList({ initialFilters }: { initialFilters?: TransactionFilters }) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const { data: categories = [] } = useCategories();
  const { data: currentUser } = useCurrentUser();
  const { data, isPending, isFetching, isPlaceholderData } = useTransactions(filters, page, PAGE_SIZE);
  const { data: stats, isFetching: statsFetching } = useTransactionStats({
    ...filters,
    defaultCurrency: currentUser?.defaultCurrency ?? undefined,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const grouped = useMemo(() => groupByDay(items), [items]);
  const dateRange = useMemo<AnalyticsRange>(() => {
    return {
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    };
  }, [filters.from, filters.to]);
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.from ||
      filters.to ||
      (filters.categoryId?.length ?? 0) > 0 ||
      (filters.subcategoryId?.length ?? 0) > 0,
  );
  const selectedCategoryIds = filters.categoryId ?? [];
  const selectedSubcategoryIds = filters.subcategoryId ?? [];
  const averageExchangeRate = useMemo(() => {
    const points = stats?.exchangeRateTrend ?? [];
    if (points.length === 0) return null;
    const aggregate = points.reduce(
      (acc, point) => {
        const weight = point.txCount > 0 ? point.txCount : 1;
        return {
          weightedTotal: acc.weightedTotal + point.rate * weight,
          weightSum: acc.weightSum + weight,
        };
      },
      { weightedTotal: 0, weightSum: 0 },
    );
    if (aggregate.weightSum <= 0) return null;
    const fiatSet = new Set(points.map((point) => point.fiatCurrency.toUpperCase()));
    const cryptoSet = new Set(points.map((point) => point.cryptoSymbol.toUpperCase()));
    const pairLabel =
      fiatSet.size === 1 && cryptoSet.size === 1
        ? `${Array.from(fiatSet)[0]}/${Array.from(cryptoSet)[0]}`
        : 'mixed pairs';
    return {
      value: aggregate.weightedTotal / aggregate.weightSum,
      pairLabel,
    };
  }, [stats?.exchangeRateTrend]);
  const averageTransactionAmount = useMemo(() => {
    if (!stats?.displayCurrency || stats.txCount <= 0) return null;
    return formatCurrency(String(stats.totalSpent / stats.txCount), stats.displayCurrency);
  }, [stats?.displayCurrency, stats?.totalSpent, stats?.txCount]);

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({});
  };

  const setDateRangeFilters = (range: AnalyticsRange) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      from: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      to: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    }));
  };

  if (isPending) {
    return <CardListSkeleton />;
  }

  const showListLoading = Boolean(isFetching && isPlaceholderData);
  const settlingEmpty = items.length === 0 && isFetching && !showListLoading;

  return (
    <div className="relative min-w-0 space-y-4">
      <div className="min-w-0 space-y-2">
        <div className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-card/72 p-4 sm:p-5 xl:grid-cols-12 xl:gap-4">
          <label className="relative min-w-0 xl:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search merchant or notes..."
              value={filters.search ?? ''}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </label>
          <div className="min-w-0 xl:col-span-2">
            <Select
              value={filters.status ?? '__all__'}
              onValueChange={(value) => setFilter('status', (value === '__all__' ? undefined : value) as CardTxStatus | undefined)}
            >
              <SelectTrigger className="min-w-0 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {STATUS_OPTIONS.filter((option) => option.value !== '').map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 xl:col-span-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-between px-3 font-normal">
                  <span className="flex min-w-0 items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {categoryFilterLabel(selectedCategoryIds.length, selectedSubcategoryIds.length)}
                    </span>
                  </span>
                  {selectedCategoryIds.length + selectedSubcategoryIds.length > 0 ? (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                      {selectedCategoryIds.length + selectedSubcategoryIds.length}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filter by categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No categories yet</div>
                ) : (
                  categories.map((category) => {
                    const parentChecked = selectedCategoryIds.includes(category.id);
                    const toggleId = (
                      key: 'categoryId' | 'subcategoryId',
                      id: string,
                      nextChecked: boolean,
                    ) => {
                      setPage(1);
                      setFilters((current) => {
                        const currentIds = current[key] ?? [];
                        const nextIds = nextChecked
                          ? [...currentIds, id]
                          : currentIds.filter((x) => x !== id);
                        return { ...current, [key]: nextIds.length ? nextIds : undefined };
                      });
                    };
                    return (
                      <div key={category.id}>
                        <DropdownMenuCheckboxItem
                          checked={parentChecked}
                          onCheckedChange={(nextChecked) => toggleId('categoryId', category.id, nextChecked === true)}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="truncate font-medium">{category.name}</span>
                            {(category.subCategories?.length ?? 0) > 0 && (
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {category.subCategories!.length}
                              </span>
                            )}
                          </span>
                        </DropdownMenuCheckboxItem>
                        {(category.subCategories ?? []).map((sub) => {
                          const subChecked = selectedSubcategoryIds.includes(sub.id);
                          return (
                            <DropdownMenuCheckboxItem
                              key={sub.id}
                              checked={subChecked}
                              className="pl-8"
                              onCheckedChange={(nextChecked) => toggleId('subcategoryId', sub.id, nextChecked === true)}
                            >
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sub.color }} />
                                <span className="truncate text-muted-foreground">{sub.name}</span>
                              </span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </div>
                    );
                  })
                )}
                {selectedCategoryIds.length + selectedSubcategoryIds.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <button
                      type="button"
                      className="w-full rounded-sm px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
                      onClick={() => {
                        setPage(1);
                        setFilters((current) => ({ ...current, categoryId: undefined, subcategoryId: undefined }));
                      }}
                    >
                      Clear category filter
                    </button>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="min-w-0 xl:col-span-3">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRangeFilters}
              align="end"
              triggerClassName="w-full h-9"
            />
          </div>
        </div>
        {hasActiveFilters ? (
          <div className="flex justify-end px-0.5">
            <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 text-muted-foreground" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : null}
      </div>

      {stats?.byCurrency && (stats.byCurrency.length > 1 || (stats.byCurrency.length === 1 && stats.displayCurrency && stats.displayCurrency !== stats.byCurrency[0]?.currency)) ? (
        <div className="flex flex-wrap gap-2">
          {stats.byCurrency.map((slice) => (
            <span
              key={slice.currency}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs"
            >
              <span className="font-semibold">{slice.currency}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatMoney(-slice.totalSpent, slice.currency)}
              </span>
              <span className="text-muted-foreground/70">{slice.txCount} txs</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="h-auto px-3 py-1.5 text-xs font-medium">
          Total transactions: <span className="ml-1 tabular-nums">{total}</span>
        </Badge>
        <Badge variant="outline" className="h-auto px-3 py-1.5 text-xs font-medium">
          Average exchange rate:{' '}
          <span className="ml-1 tabular-nums">
            {statsFetching
              ? '…'
              : averageExchangeRate
                ? `${averageExchangeRate.value.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${averageExchangeRate.pairLabel}`
                : '—'}
          </span>
        </Badge>
        <Badge variant="outline" className="h-auto px-3 py-1.5 text-xs font-medium">
          Average transaction amount:{' '}
          <span className="ml-1 tabular-nums">{statsFetching ? '…' : averageTransactionAmount ?? '—'}</span>
        </Badge>
      </div>

      {items.length === 0 && settlingEmpty ? (
        <CardListSkeleton />
      ) : items.length === 0 && !isFetching ? (
        <Card className="border-dashed bg-card/70 motion-safe:transition-colors">
          <CardContent className="px-4 py-0">
            {hasActiveFilters ? (
              <EmptyState
                icon="🔍"
                title="No card transactions match these filters"
                description="Adjust or clear the filters to see more card activity."
              />
            ) : (
              <EmptyState
                icon="💳"
                title="No card activity yet"
                description="Pair the extension in Settings and card purchases will appear here automatically."
                action={{ label: 'Go to Settings', href: '/settings' }}
              />
            )}
            {hasActiveFilters ? (
              <div className="flex justify-center pb-6">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            aria-busy={showListLoading}
            className={cn(
              'space-y-4 motion-safe:transition-opacity',
              showListLoading ? 'pointer-events-none opacity-60 duration-150' : 'opacity-100 duration-200',
            )}
          >
            {Object.entries(grouped).map(([day, dayItems]) => (
              <Card key={day} className="overflow-hidden bg-card/74">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{format(new Date(day), 'EEEE, MMM d')}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-foreground">{dayFiatTotal(dayItems)}</p>
                  </div>

                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 border-b border-border/60 px-4 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                          <TransactionCategoryBadge transaction={item} />
                          <Badge variant={statusVariant(item.status)}>{item.status ?? 'UNKNOWN'}</Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{item.subtitle ?? 'Card activity'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{new Date(item.occurredAt).toLocaleTimeString()}</span>
                          {item.cryptoAmount && item.cryptoSymbol ? (
                            <span>
                              {formatTokenAmount(item.cryptoAmount, item.cryptoSymbol)}
                            </span>
                          ) : null}
                          {item.gasFeeAmount && item.gasFeeSymbol ? (
                            <span>gas {formatTokenAmount(item.gasFeeAmount, item.gasFeeSymbol)}</span>
                          ) : null}
                          {exchangeRateLabel(item.exchangeRate, item.fiatCurrency, item.cryptoSymbol) ? (
                            <span>{exchangeRateLabel(item.exchangeRate, item.fiatCurrency, item.cryptoSymbol)}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-semibold text-foreground">
                          {item.fiatAmount && item.fiatCurrency ? formatCurrency(item.fiatAmount, item.fiatCurrency) : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.direction.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {items.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/72 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

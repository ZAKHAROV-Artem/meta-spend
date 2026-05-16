'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { CardTxStatus, Transaction } from '@crypto-tracker/shared';
import { useTransactions, useTransactionStats, type TransactionFilters } from '@/hooks/api/useTransactions';
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
import { CalendarDays, ChevronLeft, ChevronRight, CreditCard, Search, SlidersHorizontal } from 'lucide-react';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { DateRangePicker, type AnalyticsRange } from '@/components/filters/DateRangePicker';
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

function categoryFilterLabel(selectedCount: number) {
  if (selectedCount === 0) return 'All categories';
  if (selectedCount === 1) return '1 category';
  return `${selectedCount} categories`;
}

export function CardTransactionsList({ initialFilters }: { initialFilters?: TransactionFilters }) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const { data: categories = [] } = useCategories();
  const { data, isPending, isFetching, isPlaceholderData } = useTransactions(filters, page, PAGE_SIZE);
  const { data: stats, isFetching: statsFetching } = useTransactionStats(filters);

  const items = data?.items ?? [];
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
    filters.search || filters.status || filters.from || filters.to || (filters.categoryId?.length ?? 0) > 0,
  );
  const selectedCategoryIds = filters.categoryId ?? [];

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
                    <span className="truncate">{categoryFilterLabel(selectedCategoryIds.length)}</span>
                  </span>
                  {selectedCategoryIds.length > 0 ? (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                      {selectedCategoryIds.length}
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
                    const checked = selectedCategoryIds.includes(category.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          setPage(1);
                          setFilters((current) => {
                            const currentIds = current.categoryId ?? [];
                            const nextIds = nextChecked === true
                              ? [...currentIds, category.id]
                              : currentIds.filter((id) => id !== category.id);
                            return {
                              ...current,
                              categoryId: nextIds.length ? nextIds : undefined,
                            };
                          });
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate">{category.name}</span>
                        </span>
                      </DropdownMenuCheckboxItem>
                    );
                  })
                )}
                {selectedCategoryIds.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <button
                      type="button"
                      className="w-full rounded-sm px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
                      onClick={() => setFilter('categoryId', undefined)}
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

      <div className="rounded-lg border border-border/70 bg-card/72 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Total:{' '}
              <span className="tabular-nums">{total}</span>{' '}
              {total === 1 ? 'transaction' : 'transactions'}
              {hasActiveFilters ? <span className="font-semibold">&nbsp;(matching filters)</span> : null}
            </p>
            {statsFetching ? (
              <p className="text-xs text-muted-foreground">Refreshing spend totals…</p>
            ) : stats?.mixedCurrencyNotice ? (
              <p className="max-w-xl text-xs text-muted-foreground">
                Filtered rows use more than one fiat currency; spending totals are summed per breakdown in Analytics.
              </p>
            ) : stats?.displayCurrency ? (
              <p className="text-xs text-muted-foreground">
                Settled + pending spend in this filtered set:{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatCurrency(String(stats.totalSpent), stats.displayCurrency)}
                </span>
                {stats.totalReceived > 0 ? (
                  <span className="text-muted-foreground">
                    {' '}
                    · refunds {formatCurrency(String(stats.totalReceived), stats.displayCurrency)}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {(isFetching && isPlaceholderData) || statsFetching
                  ? 'Updating totals…'
                  : hasActiveFilters
                    ? 'Totals reflect the filters above.'
                    : 'Separate display, same portfolio context.'}
              </p>
            )}
          </div>
          <Badge className="w-fit shrink-0" variant="secondary">
            Card only
          </Badge>
        </div>
      </div>

      {items.length === 0 && settlingEmpty ? (
        <CardListSkeleton />
      ) : items.length === 0 && !isFetching ? (
        <Card className="border-dashed bg-card/70 motion-safe:transition-colors">
          <CardContent className="py-16 text-center">
            <CreditCard className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">
              {hasActiveFilters ? 'No card transactions match these filters' : 'No card activity yet'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Adjust or clear the filters to see more card activity.'
                : 'Pair the extension in Settings and card purchases will appear here automatically.'}
            </p>
            {hasActiveFilters ? (
              <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
                Clear filters
              </Button>
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
                              {item.cryptoAmount} {item.cryptoSymbol}
                            </span>
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

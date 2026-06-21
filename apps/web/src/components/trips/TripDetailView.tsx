'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { differenceInCalendarDays, endOfDay, format, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Cell, Label, Pie, PieChart } from 'recharts';
import type { CardTxStatus, Transaction } from '@metaspend/shared';
import { useDeleteTrip, useTrip, useUpdateTrip } from '@/hooks/api/useTrips';
import { useCategories } from '@/hooks/api/useCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label as FormLabel } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { CalendarDays, ChevronLeft, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { DateRangePicker, type AnalyticsRange } from '@/components/filters/DateRangePicker';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';

const CURRENCY_OPTIONS = ['EUR', 'PLN', 'USD', 'GBP', 'CHF'];
const CHART_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#e11d48', '#7c3aed', '#0891b2', '#f97316', '#64748b'];
const STATUS_OPTIONS: Array<{ value: '' | CardTxStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'REFUNDED', label: 'Refunded' },
];

type TripTransactionFilters = {
  categoryId?: string[];
  subcategoryId?: string[];
  status?: CardTxStatus;
  from?: string;
  to?: string;
  search?: string;
};

function formatCurrency(value: string, currency: string) {
  return formatMoney(Number(value), currency || 'USD');
}

function formatTokenAmount(value: string | number, symbol: string) {
  const n = Number(value);
  const amount = Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: Math.abs(n) < 1 ? 8 : 4 })
    : String(value);
  return `${amount} ${symbol}`;
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

function groupByDay(items: Transaction[]) {
  return items.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = format(new Date(item.occurredAt), 'yyyy-MM-dd');
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function dayFiatTotal(items: Transaction[]) {
  const countable = items.filter((item) => item.status !== 'DECLINED');
  const currency =
    countable.find((item) => item.fiatCurrency)?.fiatCurrency ??
    items.find((item) => item.fiatCurrency)?.fiatCurrency ??
    'USD';
  const total = countable.reduce((sum, item) => sum + Number(item.fiatAmount ?? 0), 0);
  return formatCurrency(String(total), currency);
}

function transactionSearchText(item: Transaction) {
  return [
    item.title,
    item.subtitle,
    item.notes,
    item.externalId,
    item.merchantName,
    item.merchantRaw,
    item.categoryName,
    item.subcategoryName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function TripDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted/40" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/35" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border bg-muted/35" />
    </div>
  );
}

export function TripDetailView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { data: trip, isPending } = useTrip(tripId);
  const updateTrip = useUpdateTrip(tripId);
  const deleteTrip = useDeleteTrip();
  const { data: categories = [] } = useCategories();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filters, setFilters] = useState<TripTransactionFilters>({});
  const tripTransactions = useMemo(() => trip?.transactions ?? [], [trip?.transactions]);
  const selectedCategoryIds = useMemo(() => filters.categoryId ?? [], [filters.categoryId]);
  const selectedSubcategoryIds = useMemo(() => filters.subcategoryId ?? [], [filters.subcategoryId]);
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
      selectedCategoryIds.length > 0 ||
      selectedSubcategoryIds.length > 0,
  );
  const filteredTransactions = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    const fromTime = filters.from ? new Date(filters.from).getTime() : null;
    const toTime = filters.to ? new Date(filters.to).getTime() : null;

    return tripTransactions.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      const occurredAt = new Date(item.occurredAt).getTime();
      if (fromTime != null && occurredAt < fromTime) return false;
      if (toTime != null && occurredAt > toTime) return false;
      if (search && !transactionSearchText(item).includes(search)) return false;
      if (selectedCategoryIds.length > 0 || selectedSubcategoryIds.length > 0) {
        const categoryMatch = item.categoryId ? selectedCategoryIds.includes(item.categoryId) : false;
        const subcategoryMatch = item.subcategoryId ? selectedSubcategoryIds.includes(item.subcategoryId) : false;
        if (!categoryMatch && !subcategoryMatch) return false;
      }
      return true;
    });
  }, [filters, selectedCategoryIds, selectedSubcategoryIds, tripTransactions]);
  const grouped = useMemo(() => groupByDay(filteredTransactions), [filteredTransactions]);

  const kpis = useMemo(() => {
    if (!trip) return null;
    const converted = trip.convertedTotal;
    if (converted) {
      return {
        spent: formatMoney(converted.totalSpent, converted.currency),
        received: formatMoney(converted.totalReceived, converted.currency),
      };
    }
    const first = trip.totalsByCurrency[0];
    return {
      spent: first ? formatMoney(first.totalSpent, first.currency) : '—',
      received: first ? formatMoney(first.totalReceived, first.currency) : '—',
    };
  }, [trip]);

  const setFilter = <K extends keyof TripTransactionFilters>(key: K, value: TripTransactionFilters[K]) => {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => setFilters({});

  const toggleCategoryFilter = (
    key: 'categoryId' | 'subcategoryId',
    id: string,
    nextChecked: boolean,
  ) => {
    setFilters((current) => {
      const currentIds = current[key] ?? [];
      const nextIds = nextChecked ? [...currentIds, id] : currentIds.filter((x) => x !== id);
      return { ...current, [key]: nextIds.length ? nextIds : undefined };
    });
  };

  const setDateRangeFilters = (range: AnalyticsRange) => {
    setFilters((current) => ({
      ...current,
      from: range.from ? startOfDay(range.from).toISOString() : undefined,
      to: range.to ? endOfDay(range.to).toISOString() : undefined,
    }));
  };

  if (isPending || !trip || !kpis) {
    return <TripDetailSkeleton />;
  }

  const durationDays = differenceInCalendarDays(new Date(trip.endAt), new Date(trip.startAt)) + 1;
  const breakdownCurrency = trip.convertedTotal?.currency ?? trip.currency;
  const categoryChartData = trip.categoryBreakdown.map((category, index) => ({
    categoryId: category.categoryId,
    name: category.categoryName ?? 'Uncategorized',
    value: category.total,
    count: category.count,
    fill: category.categoryColor ?? CHART_COLORS[index % CHART_COLORS.length],
  }));
  const categoryChartConfig = categoryChartData.reduce<ChartConfig>((config, item, index) => {
    config[`category${index}`] = { label: item.name, color: item.fill };
    return config;
  }, {});

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${trip.name}?`}
        description={`${format(new Date(trip.startAt), 'MMM d')} - ${format(
          new Date(trip.endAt),
          'MMM d, yyyy',
        )}. This removes the trip group, not the underlying transactions.`}
        confirmLabel="Delete trip"
        pending={deleteTrip.isPending}
        onConfirm={() => {
          deleteTrip.mutate(trip.id, {
            onSuccess: () => {
              toast.success('Trip deleted');
              setDeleteOpen(false);
              router.push('/trips');
            },
            onError: (error) => toast.error(error.message),
          });
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Trips
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{trip.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(trip.startAt), 'MMM d')} – {format(new Date(trip.endAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={trip.currency}
            onValueChange={(currency) => {
              updateTrip.mutate(
                { currency },
                {
                  onSuccess: () => toast.success('Trip currency updated'),
                  onError: (error) => toast.error(error.message),
                },
              );
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set([trip.currency, ...CURRENCY_OPTIONS])).map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
            disabled={deleteTrip.isPending}
            aria-label={`Delete ${trip.name}`}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Spent" value={kpis.spent} />
        <StatCard label="Total Received" value={kpis.received} />
        <StatCard label="Transactions" value={String(trip.transactionCount)} />
        <StatCard label="Duration" value={`${durationDays} ${durationDays === 1 ? 'day' : 'days'}`} />
      </div>

      {trip.categoryBreakdown.length > 0 ? (
        <Card>
          <CardContent className="px-5 py-4">
            <p className="text-sm font-semibold">Category breakdown</p>
            <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
              <ChartContainer config={categoryChartConfig} className="h-[190px] w-[190px] shrink-0">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        formatter={(value) => (
                          <span className="font-mono font-medium">
                            {formatMoney(Number(value), breakdownCurrency)}
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
                  >
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        const vb = viewBox as { cx?: number; cy?: number };
                        if (vb?.cx == null || vb?.cy == null) return null;
                        return (
                          <text x={vb.cx} y={vb.cy} textAnchor="middle" dominantBaseline="central">
                            <tspan x={vb.cx} dy="-0.3em" className="fill-foreground" style={{ fontSize: 13, fontWeight: 700 }}>
                              {formatMoney(trip.convertedTotal?.totalSpent ?? 0, breakdownCurrency)}
                            </tspan>
                            <tspan x={vb.cx} dy="1.2em" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                              spent
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="w-full min-w-0 flex-1 space-y-2">
                {categoryChartData.map((category) => (
                  <div key={category.categoryId ?? category.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: category.fill }} />
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className="text-xs text-muted-foreground">{category.count}</span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(category.value, breakdownCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="min-w-0 space-y-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200">
        <div className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-card/72 p-4 motion-safe:transition-colors sm:p-5 xl:grid-cols-12 xl:gap-4">
          <div className="relative min-w-0 xl:col-span-5">
            <FormLabel htmlFor="trip-detail-search" className="sr-only">
              Search merchant or notes
            </FormLabel>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="trip-detail-search"
              className="pl-10"
              placeholder="Search merchant or notes..."
              value={filters.search ?? ''}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </div>
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
                    return (
                      <div key={category.id}>
                        <DropdownMenuCheckboxItem
                          checked={parentChecked}
                          onCheckedChange={(nextChecked) => toggleCategoryFilter('categoryId', category.id, nextChecked === true)}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="truncate font-medium">{category.name}</span>
                            {(category.subCategories?.length ?? 0) > 0 ? (
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {category.subCategories!.length}
                              </span>
                            ) : null}
                          </span>
                        </DropdownMenuCheckboxItem>
                        {(category.subCategories ?? []).map((sub) => {
                          const subChecked = selectedSubcategoryIds.includes(sub.id);
                          return (
                            <DropdownMenuCheckboxItem
                              key={sub.id}
                              checked={subChecked}
                              className="pl-8"
                              onCheckedChange={(nextChecked) => toggleCategoryFilter('subcategoryId', sub.id, nextChecked === true)}
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
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto w-full justify-start rounded-sm px-3 py-2 text-left text-sm font-normal text-muted-foreground"
                      onClick={() => setFilters((current) => ({ ...current, categoryId: undefined, subcategoryId: undefined }))}
                    >
                      Clear category filter
                    </Button>
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
          <div className="flex justify-end px-0.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150">
            <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 text-muted-foreground" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border/70 bg-card/72 px-3 py-2 text-sm text-muted-foreground motion-safe:transition-colors">
        {hasActiveFilters ? (
          <>
            Showing <span className="font-semibold text-foreground">{filteredTransactions.length}</span> of{' '}
            <span className="font-semibold text-foreground">{tripTransactions.length}</span> trip transactions
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{tripTransactions.length}</span> trip transactions
          </>
        )}
      </div>

      {filteredTransactions.length === 0 ? (
        <Card className="border-dashed bg-card/70 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200">
          <CardContent className="px-4 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No trip transactions match these filters</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Adjust or clear the filters to see more transactions from this trip.
            </p>
            {hasActiveFilters ? (
              <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 motion-safe:transition-opacity motion-safe:duration-200">
          {Object.entries(grouped).map(([day, dayItems]) => (
            <Card key={day} className="overflow-hidden bg-card/74 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
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
                    className={cn(
                      'flex flex-col gap-4 border-b border-border/60 px-4 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between',
                      'motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/25',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <TransactionCategoryBadge transaction={item} />
                        <Badge variant={statusVariant(item.status)}>{item.status ?? 'UNKNOWN'}</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.subtitle ?? 'Card activity'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{new Date(item.occurredAt).toLocaleTimeString()}</span>
                        {item.cryptoAmount && item.cryptoSymbol ? (
                          <span>{formatTokenAmount(item.cryptoAmount, item.cryptoSymbol)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {item.fiatAmount && item.fiatCurrency
                          ? formatCurrency(item.fiatAmount, item.fiatCurrency)
                          : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.direction.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

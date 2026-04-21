'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { type Transaction, type TxType } from '@crypto-tracker/shared';
import { useTransactions, type TransactionFilters } from '@/hooks/api/useTransactions';
import { useAutoPortfolioSync } from '@/hooks/useAutoPortfolioSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  Wallet,
} from 'lucide-react';
import { SUPPORTED_CHAINS } from '@crypto-tracker/shared';

const PAGE_SIZE = 20;

const TX_TYPE_OPTIONS: Array<{ value: '' | TxType; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'TRANSFER_OUT', label: 'Sent' },
  { value: 'TRANSFER_IN', label: 'Received' },
  { value: 'SWAP', label: 'Swap' },
  { value: 'BRIDGE', label: 'Bridge' },
  { value: 'GAS_ONLY', label: 'Gas' },
  { value: 'CONTRACT_INTERACTION', label: 'Contract' },
];

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numeric);
}

function groupByDay(items: Transaction[]) {
  return items.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = format(new Date(item.occurredAt), 'yyyy-MM-dd');
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function formatDateFilterLabel(range: DateRange | undefined): string {
  if (!range?.from) return 'Date range';
  if (range.from && !range.to) return format(range.from, 'MMM d, yyyy');
  return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to!, 'MMM d, yyyy')}`;
}

function HoldingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-[1.7rem] border bg-muted/35" />
      ))}
    </div>
  );
}

export function TransactionsList() {
  useAutoPortfolioSync(true);

  const [filters, setFilters] = useState<TransactionFilters>({ source: 'HOLDINGS' });
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useTransactions({ ...filters, source: 'HOLDINGS' }, page, PAGE_SIZE);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const grouped = useMemo(() => groupByDay(items), [items]);
  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!filters.from) return undefined;
    return {
      from: new Date(filters.from),
      to: filters.to ? new Date(filters.to) : undefined,
    };
  }, [filters.from, filters.to]);

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  if (isLoading) {
    return <HoldingsSkeleton />;
  }

  if (items.length === 0 && !isFetching) {
    return (
      <Card className="border-dashed bg-card/70">
        <CardContent className="py-16 text-center">
          <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No holdings activity yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Once MetaMask is connected, supported chain history will appear here automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-[2rem] border border-border/70 bg-card/72 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.36)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-5 xl:p-5">
        <label className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search hash, address, notes..."
            value={filters.search ?? ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </label>

        <Select
          value={filters.txType ?? '__all__'}
          onValueChange={(value) => setFilter('txType', (value === '__all__' ? undefined : value) as TxType | undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {TX_TYPE_OPTIONS.filter((option) => option.value !== '').map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.chainId ? String(filters.chainId) : '__all__'}
          onValueChange={(value) => setFilter('chainId', value === '__all__' ? undefined : Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All chains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All chains</SelectItem>
            {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
              <SelectItem key={id} value={id}>
                {chain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDateFilterLabel(dateRange)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setFilter('from', range?.from ? format(range.from, 'yyyy-MM-dd') : undefined);
                  setFilter('to', range?.to ? format(range.to, 'yyyy-MM-dd') : undefined);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {(filters.from || filters.to) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter('from', undefined);
                setFilter('to', undefined);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[2rem] border border-border/70 bg-card/72 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {total} holding transaction{total === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFetching ? 'Refreshing…' : 'Grouped by day and refreshed automatically.'}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          Holdings only
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([day, dayItems]) => (
          <Card key={day} className="overflow-hidden bg-card/74">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-4 sm:px-5">
                <CalendarDays className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(day), 'EEEE, MMM d')}
                </p>
              </div>

              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 border-b border-border/60 px-4 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      {item.txType ? (
                        <Badge variant="outline">
                          {item.txType.replaceAll('_', ' ')}
                        </Badge>
                      ) : null}
                      {item.chainId ? (
                        <Badge variant="secondary">
                          {SUPPORTED_CHAINS[item.chainId as keyof typeof SUPPORTED_CHAINS]?.name ?? `Chain ${item.chainId}`}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.subtitle ?? 'No extra details'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{new Date(item.occurredAt).toLocaleTimeString()}</span>
                      {item.hash ? <span className="font-mono">{item.hash.slice(0, 10)}…{item.hash.slice(-6)}</span> : null}
                      {item.assetSymbol ? <span>{item.assetSymbol}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${
                        item.direction === 'INFLOW'
                          ? 'bg-success-soft text-success'
                          : item.direction === 'OUTFLOW'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      {item.direction === 'INFLOW' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {item.amountUsd ? formatCurrency(item.amountUsd) : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.direction.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/70 bg-card/72 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
    </div>
  );
}

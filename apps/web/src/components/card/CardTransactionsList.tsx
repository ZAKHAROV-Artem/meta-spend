'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { CardTxStatus, Transaction } from '@crypto-tracker/shared';
import { useTransactions, type TransactionFilters } from '@/hooks/api/useTransactions';
import { useAutoPortfolioSync } from '@/hooks/useAutoPortfolioSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, CreditCard, Search } from 'lucide-react';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: '' | CardTxStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'REFUNDED', label: 'Refunded' },
];

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function groupByDay(items: Transaction[]) {
  return items.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = format(new Date(item.occurredAt), 'yyyy-MM-dd');
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function CardListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-[1.7rem] border bg-muted/35" />
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

export function CardTransactionsList() {
  useAutoPortfolioSync(true);

  const [filters, setFilters] = useState<TransactionFilters>({ source: 'CARD' });
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useTransactions({ ...filters, source: 'CARD' }, page, PAGE_SIZE);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const grouped = useMemo(() => groupByDay(items), [items]);

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  if (isLoading) {
    return <CardListSkeleton />;
  }

  if (items.length === 0 && !isFetching) {
    return (
      <Card className="border-dashed bg-card/70">
        <CardContent className="py-16 text-center">
          <CreditCard className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No card activity yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pair the extension in Settings and card purchases will appear here automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-[2rem] border border-border/70 bg-card/72 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.36)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4 xl:p-5">
        <label className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search merchant or notes..."
            value={filters.search ?? ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </label>
        <Select
          value={filters.status ?? '__all__'}
          onValueChange={(value) => setFilter('status', (value === '__all__' ? undefined : value) as CardTxStatus | undefined)}
        >
          <SelectTrigger className="w-full">
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
        <div className="flex gap-2">
          <Input type="date" value={filters.from ?? ''} onChange={(event) => setFilter('from', event.target.value)} />
          <Input type="date" value={filters.to ?? ''} onChange={(event) => setFilter('to', event.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[2rem] border border-border/70 bg-card/72 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {total} card transaction{total === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFetching ? 'Refreshing…' : 'Separate display, same portfolio context.'}
          </p>
        </div>
        <Badge variant="secondary">Card only</Badge>
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

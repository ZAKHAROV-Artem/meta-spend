'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays, format } from 'date-fns';
import type { CardTxStatus, Transaction } from '@crypto-tracker/shared';
import { useTrip } from '@/hooks/api/useTrips';
import { useCurrentUser } from '@/hooks/api/useUserPreferences';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft } from 'lucide-react';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { formatMoney } from '@/lib/format';

const CURRENCY_OPTIONS = ['EUR', 'PLN', 'USD', 'GBP', 'CHF'];
const NATIVE_VALUE = '__native__';

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

function groupByDay(items: Transaction[]) {
  return items.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = format(new Date(item.occurredAt), 'yyyy-MM-dd');
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
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
  const [displayCurrency, setDisplayCurrency] = useState<string>('');
  const { data: currentUser } = useCurrentUser();
  const activeCurrency = displayCurrency || currentUser?.defaultCurrency || '';
  const { data: trip, isPending } = useTrip(tripId, activeCurrency || undefined);

  const grouped = useMemo(() => groupByDay(trip?.transactions ?? []), [trip?.transactions]);

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

  if (isPending || !trip || !kpis) {
    return <TripDetailSkeleton />;
  }

  const durationDays = differenceInCalendarDays(new Date(trip.endAt), new Date(trip.startAt)) + 1;
  const maxCategoryTotal = Math.max(
    ...trip.categoryBreakdown.map((c) => Math.abs(c.total)),
    1,
  );
  const breakdownCurrency = trip.convertedTotal?.currency ?? trip.totalsByCurrency[0]?.currency ?? '';

  return (
    <div className="space-y-6">
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
        <Select
          value={displayCurrency || NATIVE_VALUE}
          onValueChange={(value) => setDisplayCurrency(value === NATIVE_VALUE ? '' : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NATIVE_VALUE}>Native</SelectItem>
            {CURRENCY_OPTIONS.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Spent" value={kpis.spent} />
        <StatCard label="Total Received" value={kpis.received} />
        <StatCard label="Transactions" value={String(trip.transactionCount)} />
        <StatCard label="Duration" value={`${durationDays} ${durationDays === 1 ? 'day' : 'days'}`} />
      </div>

      {trip.categoryBreakdown.length > 0 ? (
        <Card>
          <CardContent className="space-y-3 px-5 py-4">
            <p className="text-sm font-semibold">Category breakdown</p>
            {trip.categoryBreakdown.map((category) => (
              <div key={category.categoryId ?? 'uncategorized'} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category.categoryColor ?? 'var(--muted-foreground)' }}
                    />
                    <span>{category.categoryName ?? 'Uncategorized'}</span>
                    <span className="text-xs text-muted-foreground">{category.count}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(category.total, breakdownCurrency)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(Math.abs(category.total) / maxCategoryTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
    </div>
  );
}

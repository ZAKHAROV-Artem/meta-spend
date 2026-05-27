'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import type { Transaction } from '@crypto-tracker/shared';
import { useTransactions } from '@/hooks/api/useTransactions';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

const RECENT_LIMIT = 9;

function RecentTransactionCard({
  tx,
  className,
}: {
  tx: Pick<
    Transaction,
    | 'id'
    | 'title'
    | 'occurredAt'
    | 'amountPrimary'
    | 'currency'
    | 'fiatAmount'
    | 'fiatCurrency'
    | 'categoryName'
    | 'categoryColor'
    | 'subcategoryName'
    | 'subcategoryColor'
  >;
  className?: string;
}) {
  const amount =
    tx.amountPrimary != null && tx.currency
      ? formatMoney(Number(tx.amountPrimary), tx.currency)
      : tx.fiatAmount != null && tx.fiatCurrency
        ? formatMoney(Number(tx.fiatAmount), tx.fiatCurrency)
        : '—';

  return (
    <Link
      href="/transactions"
      className={cn(
        'flex h-full flex-col gap-2 rounded-xl border border-border/70 bg-background/40 p-3 transition-colors hover:border-border hover:bg-muted/40',
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{tx.title}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(tx.occurredAt), 'MMM d, yyyy · HH:mm')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TransactionCategoryBadge transaction={tx} />
        <span className="shrink-0 text-sm font-semibold tabular-nums">{amount}</span>
      </div>
    </Link>
  );
}

export function RecentTransactions() {
  const { data, isLoading } = useTransactions(undefined, 1, RECENT_LIMIT);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-2 pt-4">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
          <Link href="/transactions">
            All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {isLoading && !data ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: RECENT_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-[7.5rem] rounded-xl" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((tx) => (
              <RecentTransactionCard key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

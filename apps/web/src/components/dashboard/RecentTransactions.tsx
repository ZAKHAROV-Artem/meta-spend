'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { useTransactions } from '@/hooks/api/useTransactions';
import { TransactionCategoryBadge } from '@/components/transactions/TransactionCategoryBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/format';

export function RecentTransactions() {
  const { data, isLoading } = useTransactions(undefined, 1, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
          <Link href="/transactions">
            All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 px-5 pb-4">
        {isLoading && !data ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          data.items.map((tx) => (
            <Link
              key={tx.id}
              href="/transactions"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tx.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.occurredAt), 'MMM d, yyyy · HH:mm')}
                </p>
              </div>
              <TransactionCategoryBadge transaction={tx} />
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {tx.amountPrimary != null && tx.currency
                  ? formatMoney(Number(tx.amountPrimary), tx.currency)
                  : tx.fiatAmount != null && tx.fiatCurrency
                    ? formatMoney(Number(tx.fiatAmount), tx.fiatCurrency)
                    : '—'}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

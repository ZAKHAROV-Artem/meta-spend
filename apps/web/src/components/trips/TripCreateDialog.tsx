'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Check, Minus, Plus, Search, X } from 'lucide-react';
import type { Transaction } from '@metaspend/shared';
import { useCreateTrip, usePreviewTrip } from '@/hooks/api/useTrips';
import { useTransactions } from '@/hooks/api/useTransactions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';

interface TripCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTx: Transaction;
  endTx: Transaction;
  includeTransactionIds: string[];
  excludeTransactionIds: string[];
  onSelectionChange: (next: { includeTransactionIds: string[]; excludeTransactionIds: string[] }) => void;
  onCreated?: () => void;
}

function txTime(tx: Transaction) {
  return new Date(tx.occurredAt).getTime();
}

function formatAmount(tx: Transaction) {
  return tx.fiatAmount && tx.fiatCurrency ? formatMoney(Number(tx.fiatAmount), tx.fiatCurrency) : '-';
}

function TransactionLine({
  tx,
  trailing,
  muted = false,
}: {
  tx: Transaction;
  trailing?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-2 motion-safe:transition-all motion-safe:duration-200',
        muted ? 'opacity-65' : 'opacity-100 hover:bg-muted/45',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {format(new Date(tx.occurredAt), 'MMM d, yyyy HH:mm')} · {tx.direction.toLowerCase()}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums">{formatAmount(tx)}</p>
      {trailing}
    </div>
  );
}

export function TripCreateDialog({
  open,
  onOpenChange,
  startTx,
  endTx,
  includeTransactionIds,
  excludeTransactionIds,
  onSelectionChange,
  onCreated,
}: TripCreateDialogProps) {
  const router = useRouter();
  const shouldAnimate = !useReducedMotion();
  const createTrip = useCreateTrip();
  const previewTrip = usePreviewTrip();
  const [search, setSearch] = useState('');
  const { data: searchData, isFetching: searchFetching } = useTransactions(
    search.trim() ? { search: search.trim() } : undefined,
    1,
    8,
  );

  const minDate = Math.min(txTime(startTx), txTime(endTx));
  const maxDate = Math.max(txTime(startTx), txTime(endTx));
  const [name, setName] = useState('');
  useEffect(() => {
    if (open) setName('');
  }, [open, startTx.id, endTx.id]);

  const includeKey = includeTransactionIds.join('|');
  const excludeKey = excludeTransactionIds.join('|');
  useEffect(() => {
    if (!open) return;
    previewTrip.mutate({
      startTransactionId: startTx.id,
      endTransactionId: endTx.id,
      includeTransactionIds,
      excludeTransactionIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startTx.id, endTx.id, includeKey, excludeKey]);

  const preview = previewTrip.data;
  const includedIds = new Set(preview?.transactions.map((tx) => tx.id) ?? []);
  const extraIds = new Set(preview?.extraTransactionIds ?? []);
  const excludedIds = new Set(excludeTransactionIds);
  const anchorIds = new Set([startTx.id, endTx.id]);

  const updateSelection = (nextInclude: string[], nextExclude: string[]) => {
    onSelectionChange({
      includeTransactionIds: [...new Set(nextInclude)],
      excludeTransactionIds: [...new Set(nextExclude.filter((id) => !anchorIds.has(id)))],
    });
  };

  const addExtra = (id: string) => {
    updateSelection([...includeTransactionIds, id], excludeTransactionIds.filter((excludedId) => excludedId !== id));
  };

  const removeExtra = (id: string) => {
    updateSelection(includeTransactionIds.filter((includeId) => includeId !== id), excludeTransactionIds);
  };

  const excludeAuto = (id: string) => {
    updateSelection(includeTransactionIds, [...excludeTransactionIds, id]);
  };

  const restoreExcluded = () => {
    updateSelection(includeTransactionIds, []);
  };

  const searchResults = (searchData?.items ?? []).filter((tx) => !includedIds.has(tx.id));
  const isPending = createTrip.isPending;
  const rangeLabel = `${format(new Date(minDate), 'MMM d')} - ${format(new Date(maxDate), 'MMM d, yyyy')}`;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    createTrip.mutate(
      {
        name: trimmed,
        startTransactionId: startTx.id,
        endTransactionId: endTx.id,
        includeTransactionIds,
        excludeTransactionIds,
      },
      {
        onSuccess: (trip) => {
          toast.success('Trip created', {
            action: { label: 'View trip', onClick: () => router.push(`/trips/${trip.id}`) },
          });
          onCreated?.();
          onOpenChange(false);
          router.push(`/trips/${trip.id}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(920px,86vh)] sm:max-h-[min(920px,86vh)] sm:w-[min(1440px,92vw)] sm:max-w-none">
        <DialogHeader className="shrink-0 px-4 pb-3 pt-4 pr-12 sm:px-8 sm:pt-6 sm:pr-14">
          <DialogTitle>Create trip</DialogTitle>
          <DialogDescription>
            Review the automatic range, exclude unrelated rows, and add any extra transactions from another date.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:gap-6">
          <div className="min-w-0 space-y-4">
            <motion.div
              className="grid gap-3 rounded-lg border border-border/70 bg-muted/25 p-3 motion-safe:transition-colors sm:grid-cols-3"
              initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0 }}
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">Range</p>
                <p className="mt-1 text-sm font-semibold">{rangeLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">Transactions</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {previewTrip.isPending ? '...' : preview?.transactionCount ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">Currency</p>
                <p className="mt-1 text-sm font-semibold">{preview?.currency ?? '-'}</p>
              </div>
            </motion.div>

            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip name</Label>
              <Input
                id="trip-name"
                placeholder="Rhodes June 2026"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            {previewTrip.error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {previewTrip.error.message}
              </div>
            ) : null}

            <motion.div
              className="overflow-hidden rounded-lg border border-border/70 motion-safe:transition-colors"
              initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 }}
            >
              <div className="flex flex-col gap-2 border-b border-border/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold">Included transactions</p>
                <div className="flex flex-wrap items-center gap-2">
                  {excludeTransactionIds.length > 0 ? (
                    <Button variant="ghost" size="xs" onClick={restoreExcluded}>
                      Restore excluded
                    </Button>
                  ) : null}
                  {preview?.totalsByCurrency.map((total) => (
                    <Badge key={total.currency} variant="outline" className="font-mono">
                      {formatMoney(total.totalSpent, total.currency)}
                    </Badge>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[min(380px,40dvh)]">
                <div className="divide-y divide-border/60 p-2">
                  {previewTrip.isPending && !preview ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">Loading trip preview...</p>
                  ) : preview?.transactions.length ? (
                    preview.transactions.map((tx) => {
                      const isAnchor = anchorIds.has(tx.id);
                      const isExtra = extraIds.has(tx.id);
                      return (
                        <TransactionLine
                          key={tx.id}
                          tx={tx}
                          trailing={
                            isAnchor ? (
                              <Badge variant="secondary">Anchor</Badge>
                            ) : isExtra ? (
                              <Button variant="ghost" size="icon-sm" aria-label="Remove extra transaction" onClick={() => removeExtra(tx.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon-sm" aria-label="Exclude transaction" onClick={() => excludeAuto(tx.id)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                            )
                          }
                        />
                      );
                    })
                  ) : (
                    <p className="py-10 text-center text-sm text-muted-foreground">No transactions selected yet.</p>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </div>

          <motion.div
            className="min-w-0 space-y-3"
            initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.16 }}
          >
            <div>
              <Label htmlFor="trip-extra-search">Add extra transaction</Label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="trip-extra-search"
                  className="pl-9"
                  placeholder="Search any date..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border/70 motion-safe:transition-colors">
              <div className="border-b border-border/70 px-3 py-2">
                <p className="text-sm font-semibold">{search.trim() ? 'Search results' : 'Recent transactions'}</p>
              </div>
              <ScrollArea className="h-[min(460px,48dvh)]">
                <div className="divide-y divide-border/60 p-2">
                  {searchFetching ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Searching...</p>
                  ) : searchResults.length ? (
                    searchResults.map((tx) => {
                      const excluded = excludedIds.has(tx.id);
                      return (
                        <TransactionLine
                          key={tx.id}
                          tx={tx}
                          muted={excluded}
                          trailing={
                            <Button variant={excluded ? 'secondary' : 'outline'} size="sm" onClick={() => addExtra(tx.id)}>
                              {excluded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              {excluded ? 'Restore' : 'Add'}
                            </Button>
                          }
                        />
                      );
                    })
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">No more matches.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/70 bg-popover/95 px-4 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.04)] sm:px-8">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending || previewTrip.isPending || !preview}>
            {isPending ? 'Creating...' : 'Create trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

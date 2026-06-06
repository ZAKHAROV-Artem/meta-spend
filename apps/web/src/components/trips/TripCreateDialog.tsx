'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Transaction } from '@crypto-tracker/shared';
import { useCreateTrip } from '@/hooks/api/useTrips';
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

interface TripCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTx: Transaction;
  endTx: Transaction;
  allItems: Transaction[];
}

export function TripCreateDialog({ open, onOpenChange, startTx, endTx, allItems }: TripCreateDialogProps) {
  const router = useRouter();
  const createTrip = useCreateTrip();

  const { minDate, maxDate, tripTransactionIds } = useMemo(() => {
    const startTime = new Date(startTx.occurredAt).getTime();
    const endTime = new Date(endTx.occurredAt).getTime();
    const min = Math.min(startTime, endTime);
    const max = Math.max(startTime, endTime);
    const ids = allItems
      .filter((tx) => {
        const t = new Date(tx.occurredAt).getTime();
        return t >= min && t <= max;
      })
      .map((tx) => tx.id);
    if (!ids.includes(startTx.id)) ids.push(startTx.id);
    if (!ids.includes(endTx.id)) ids.push(endTx.id);
    return { minDate: min, maxDate: max, tripTransactionIds: ids };
  }, [startTx, endTx, allItems]);

  const defaultName = useMemo(
    () => `Trip ${format(new Date(minDate), 'MMM d')}–${format(new Date(maxDate), 'MMM d, yyyy')}`,
    [minDate, maxDate],
  );
  const [name, setName] = useState(defaultName);

  const isPending = createTrip.isPending;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    createTrip.mutate(
      { name: trimmed, transactionIds: tripTransactionIds },
      {
        onSuccess: (trip) => {
          toast.success('Trip created', {
            action: { label: 'View trip', onClick: () => router.push(`/trips/${trip.id}`) },
          });
          setName(defaultName);
          onOpenChange(false);
          router.push(`/trips/${trip.id}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name this trip</DialogTitle>
          <DialogDescription>
            {format(new Date(minDate), 'MMM d')} – {format(new Date(maxDate), 'MMM d, yyyy')} ·{' '}
            {tripTransactionIds.length} transactions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip name</Label>
            <Input id="trip-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? 'Creating…' : 'Create trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

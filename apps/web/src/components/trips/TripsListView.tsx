'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTrips } from '@/hooks/api/useTrips';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatMoney } from '@/lib/format';

function TripsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg border bg-muted/35" />
      ))}
    </div>
  );
}

export function TripsListView() {
  const router = useRouter();
  const { data: trips = [], isPending } = useTrips();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Group transactions into trips to see how much each journey cost.
        </p>
      </div>

      {isPending ? (
        <TripsListSkeleton />
      ) : trips.length === 0 ? (
        <Card className="border-dashed bg-card/70">
          <CardContent className="px-4 py-0">
            <EmptyState
              icon="✈️"
              title="No trips yet"
              description="Right-click any transaction to start a trip."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="hover:bg-accent/30 cursor-pointer transition-colors"
              onClick={() => router.push(`/trips/${trip.id}`)}
            >
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-semibold">{trip.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(trip.startAt), 'MMM d')} –{' '}
                    {format(new Date(trip.endAt), 'MMM d, yyyy')} · {trip.transactionCount} transactions
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  {trip.totalsByCurrency.map((t) => (
                    <p key={t.currency} className="text-sm font-semibold tabular-nums">
                      {formatMoney(t.totalSpent, t.currency)}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

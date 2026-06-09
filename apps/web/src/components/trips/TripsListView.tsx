'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
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
  const shouldAnimate = !useReducedMotion();
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
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(index, 6) * 0.05 }}
              whileHover={shouldAnimate ? { scale: 1.01 } : {}}
              whileTap={shouldAnimate ? { scale: 0.99 } : {}}
            >
              <Card
                className="hover:bg-accent/30 cursor-pointer motion-safe:transition-colors"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <CardContent className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{trip.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(trip.startAt), 'MMM d')} –{' '}
                      {format(new Date(trip.endAt), 'MMM d, yyyy')} · {trip.transactionCount} transactions
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoney(
                        trip.totalsByCurrency.find((t) => t.currency === trip.currency)?.totalSpent ??
                          trip.totalsByCurrency[0]?.totalSpent ??
                          0,
                        trip.currency,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{trip.currency}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

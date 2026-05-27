'use client';

import { useEffect, useState } from 'react';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { CalendarDays } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type AnalyticsRange = { from?: Date; to?: Date };

type Preset = {
  id: string;
  label: string;
  build: () => AnalyticsRange;
};

const PRESETS: Preset[] = [
  {
    id: 'today',
    label: 'Today',
    build: () => {
      const now = new Date();
      return { from: startOfDay(now), to: endOfDay(now) };
    },
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    build: () => {
      const y = subDays(new Date(), 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    },
  },
  {
    id: 'this-week',
    label: 'This week',
    build: () => {
      const now = new Date();
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    },
  },
  {
    id: 'last-week',
    label: 'Last week',
    build: () => {
      const w = subDays(new Date(), 7);
      return {
        from: startOfWeek(w, { weekStartsOn: 1 }),
        to: endOfWeek(w, { weekStartsOn: 1 }),
      };
    },
  },
  {
    id: 'this-month',
    label: 'This month',
    build: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfMonth(now) };
    },
  },
  {
    id: 'last-month',
    label: 'Last month',
    build: () => {
      const m = subMonths(new Date(), 1);
      return { from: startOfMonth(m), to: endOfMonth(m) };
    },
  },
  {
    id: 'last-3-months',
    label: 'Last 3 months',
    build: () => {
      const now = new Date();
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    },
  },
  {
    id: 'last-6-months',
    label: 'Last 6 months',
    build: () => {
      const now = new Date();
      return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
    },
  },
  {
    id: 'ytd',
    label: 'Year to date',
    build: () => {
      const now = new Date();
      return { from: startOfYear(now), to: endOfDay(now) };
    },
  },
];

function sameDate(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
}

function formatRangeLabel(range: AnalyticsRange | undefined): string {
  if (!range?.from && !range?.to) return 'All time';
  if (range.from && !range.to) return format(range.from, 'MMM d, yyyy');
  if (!range.from && range.to) return `Until ${format(range.to, 'MMM d, yyyy')}`;
  if (range.from && range.to) {
    if (sameDate(range.from, range.to)) return format(range.from, 'MMM d, yyyy');
    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
  }
  return 'All time';
}

function rangeMatchesPreset(range: AnalyticsRange, preset: AnalyticsRange): boolean {
  return sameDate(range.from, preset.from) && sameDate(range.to, preset.to);
}

export function DateRangePicker({
  value,
  onChange,
  align = 'start',
  triggerClassName,
  emptyLabel = 'All time',
  className,
}: {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
  align?: 'start' | 'end' | 'center';
  triggerClassName?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Pending range while the popover is open. Only committed when complete.
  const [pending, setPending] = useState<AnalyticsRange>(value);

  // Sync pending with value whenever the popover opens or external value changes.
  useEffect(() => {
    if (open) setPending(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) setPending(value);
  }, [value, open]);

  const activePreset = PRESETS.find((p) => rangeMatchesPreset(value, p.build()));
  const hasSelection = !!(value.from || value.to);

  const dayPickerSelected: DateRange | undefined =
    pending.from || pending.to ? { from: pending.from, to: pending.to } : undefined;

  const commit = (next: AnalyticsRange) => {
    onChange(next);
    setOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    const next: AnalyticsRange = { from: range?.from, to: range?.to };
    setPending(next);
    // Only commit and close once a full range is selected.
    if (next.from && next.to) {
      commit(next);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 justify-start font-normal',
            !hasSelection && 'text-muted-foreground',
            triggerClassName,
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {activePreset
              ? activePreset.label
              : hasSelection
                ? formatRangeLabel(value)
                : emptyLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={align}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row flex-wrap gap-1 border-b p-2 sm:flex-col sm:flex-nowrap sm:border-b-0 sm:border-r">
            {PRESETS.map((preset) => {
              const presetRange = preset.build();
              const isActive = rangeMatchesPreset(value, presetRange);
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="justify-start sm:w-36"
                  onClick={() => commit(presetRange)}
                >
                  {preset.label}
                </Button>
              );
            })}
            <Button
              variant={!hasSelection ? 'secondary' : 'ghost'}
              className="justify-start sm:w-36"
              onClick={() => commit({})}
            >
              All time
            </Button>
          </div>
          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dayPickerSelected}
              onSelect={handleCalendarSelect}
              defaultMonth={pending.from ?? value.from ?? subMonths(new Date(), 1)}
            />
            {(pending.from || pending.to) && (
              <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                <span className="text-muted-foreground">
                  {pending.from && !pending.to ? 'Pick the end date…' : formatRangeLabel(pending)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    setPending({});
                    commit({});
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

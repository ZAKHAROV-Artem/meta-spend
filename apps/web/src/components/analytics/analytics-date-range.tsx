'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import {
  DateRangePicker,
  type AnalyticsRange,
} from '@/components/filters/DateRangePicker';
import { useTransactionStats } from '@/hooks/api/useTransactionStats';
import type { TransactionFilters } from '@/hooks/api/useTransactions';
import { useCurrentUser } from '@/hooks/api/useUserPreferences';

export type AnalyticsChartId =
  | 'monthly'
  | 'categories'
  | 'cumulative'
  | 'merchants'
  | 'exchangeRate'
  | 'avgTransaction';

type AnalyticsDateRangeContextValue = {
  globalRange: AnalyticsRange;
  setGlobalRange: (range: AnalyticsRange) => void;
  getChartRange: (chartId: AnalyticsChartId) => AnalyticsRange;
  setChartRange: (chartId: AnalyticsChartId, range: AnalyticsRange) => void;
};

const AnalyticsDateRangeContext = createContext<AnalyticsDateRangeContextValue | null>(null);

function toIsoDate(d?: Date): string | undefined {
  return d ? format(d, 'yyyy-MM-dd') : undefined;
}

function rangeToFilters(range: AnalyticsRange): TransactionFilters {
  return { from: toIsoDate(range.from), to: toIsoDate(range.to) };
}

export function AnalyticsDateRangeProvider({ children }: { children: ReactNode }) {
  const [globalRange, setGlobalRangeState] = useState<AnalyticsRange>({});
  const [chartOverrides, setChartOverrides] = useState<
    Partial<Record<AnalyticsChartId, AnalyticsRange>>
  >({});

  const setGlobalRange = useCallback((range: AnalyticsRange) => {
    setGlobalRangeState(range);
    setChartOverrides({});
  }, []);

  const getChartRange = useCallback(
    (chartId: AnalyticsChartId) => chartOverrides[chartId] ?? globalRange,
    [chartOverrides, globalRange],
  );

  const setChartRange = useCallback((chartId: AnalyticsChartId, range: AnalyticsRange) => {
    setChartOverrides((prev) => ({ ...prev, [chartId]: range }));
  }, []);

  const value = useMemo(
    () => ({
      globalRange,
      setGlobalRange,
      getChartRange,
      setChartRange,
    }),
    [globalRange, setGlobalRange, getChartRange, setChartRange],
  );

  return (
    <AnalyticsDateRangeContext.Provider value={value}>
      {children}
    </AnalyticsDateRangeContext.Provider>
  );
}

export function useAnalyticsDateRanges() {
  const ctx = useContext(AnalyticsDateRangeContext);
  if (!ctx) {
    throw new Error('useAnalyticsDateRanges must be used within AnalyticsDateRangeProvider');
  }
  return ctx;
}

export function useGlobalTransactionStats() {
  const { globalRange } = useAnalyticsDateRanges();
  const { data: currentUser } = useCurrentUser();
  const filters = useMemo(
    () => ({ ...rangeToFilters(globalRange), defaultCurrency: currentUser?.defaultCurrency ?? undefined }),
    [globalRange, currentUser?.defaultCurrency],
  );
  return useTransactionStats(filters);
}

export function useChartTransactionStats(chartId: AnalyticsChartId) {
  const { getChartRange } = useAnalyticsDateRanges();
  const { data: currentUser } = useCurrentUser();
  const range = getChartRange(chartId);
  const filters = useMemo(
    () => ({ ...rangeToFilters(range), defaultCurrency: currentUser?.defaultCurrency ?? undefined }),
    [range, currentUser?.defaultCurrency],
  );
  return useTransactionStats(filters);
}

export function useChartGoToTransactions(chartId: AnalyticsChartId) {
  const router = useRouter();
  const { getChartRange } = useAnalyticsDateRanges();

  return useCallback(
    (params: Record<string, string | undefined>) => {
      const range = getChartRange(chartId);
      const query = new URLSearchParams();
      const from = toIsoDate(range.from);
      const to = toIsoDate(range.to);
      if (from) query.set('from', from);
      if (to) query.set('to', to);
      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, value);
        else query.delete(key);
      }
      router.push(`/transactions${query.toString() ? `?${query.toString()}` : ''}`);
    },
    [chartId, getChartRange, router],
  );
}

export function GlobalRangePicker({ className }: { className?: string }) {
  const { globalRange, setGlobalRange } = useAnalyticsDateRanges();
  return (
    <DateRangePicker
      value={globalRange}
      onChange={setGlobalRange}
      align="end"
      className={className}
    />
  );
}

export function ChartRangePicker({
  chartId,
  className,
}: {
  chartId: AnalyticsChartId;
  className?: string;
}) {
  const { getChartRange, setChartRange } = useAnalyticsDateRanges();
  const range = getChartRange(chartId);
  return (
    <DateRangePicker
      value={range}
      onChange={(next) => setChartRange(chartId, next)}
      align="end"
      className={className}
    />
  );
}

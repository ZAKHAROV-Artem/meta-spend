import { format } from 'date-fns';
import type { CardTransactionAnalytics } from '@metaspend/shared';
import type { ChartConfig } from '@/components/ui/chart';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

function monthLabel(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yy');
}

function monthLabelShort(year: number, month: number) {
  return format(new Date(Date.UTC(year, month - 1, 1)), 'MMM');
}

function dayLabel(isoDate: string) {
  return format(new Date(`${isoDate}T00:00:00.000Z`), 'MMM d');
}

export const monthlyChartConfig: ChartConfig = {
  spent: { label: 'Spent', color: 'var(--chart-1)' },
  refunds: { label: 'Refunds', color: 'var(--chart-3)' },
};

export const cumulativeChartConfig: ChartConfig = {
  cumulative: { label: 'Cumulative', color: 'var(--chart-2)' },
  delta: { label: 'This month', color: 'var(--chart-1)' },
};

export const merchantChartConfig: ChartConfig = {
  total: { label: 'Spend', color: 'var(--chart-1)' },
};

export const exchangeRateChartConfig: ChartConfig = {
  rate: { label: 'Daily rate', color: 'var(--chart-2)' },
  average: { label: 'Weighted avg', color: 'var(--chart-4)' },
};

export const avgTransactionChartConfig: ChartConfig = {
  avgAmount: { label: 'Daily avg', color: 'var(--chart-3)' },
  periodAverage: { label: 'Period avg', color: 'var(--chart-5)' },
};

export function buildMonthlyChartData(data: CardTransactionAnalytics | undefined) {
  const rows = (data?.monthly ?? []).map((item) => ({
    month: monthLabelShort(item.year, item.month),
    monthFull: monthLabel(item.year, item.month),
    year: item.year,
    monthNumber: item.month,
    spent: item.spent,
    refunds: item.received,
  }));
  const n = rows.length;
  if (n < 2) return rows.map((row) => ({ ...row, trend: row.spent }));
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    const y = rows[i]!.spent;
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return rows.map((row, i) => ({ ...row, trend: intercept + slope * i }));
}

export function buildCumulativeChartData(data: CardTransactionAnalytics | undefined) {
  let run = 0;
  return (data?.monthly ?? []).map((item) => {
    run += item.spent;
    return {
      month: monthLabelShort(item.year, item.month),
      monthFull: monthLabel(item.year, item.month),
      cumulative: run,
      delta: item.spent,
    };
  });
}

export function buildMerchantChartData(
  data: CardTransactionAnalytics | undefined,
  ccy: string | null,
) {
  return (data?.topMerchants ?? []).slice(0, 8).map((m) => ({
    key: m.key,
    shortName: m.displayName.length > 26 ? `${m.displayName.slice(0, 24)}…` : m.displayName,
    displayName: m.displayName,
    total: m.total,
    count: m.count,
    currency: m.currency ?? ccy,
  }));
}

export function buildCategoryChartData(data: CardTransactionAnalytics | undefined) {
  return (data?.categoryShares ?? []).slice(0, 8).map((item, i) => ({
    categoryId: item.categoryId,
    name: item.categoryName ?? 'Uncategorized',
    value: item.total,
    percent: item.sharePercent,
    count: item.count,
    fill: item.categoryColor ?? CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export function buildCategoryChartConfig(
  categoryChartData: ReturnType<typeof buildCategoryChartData>,
): ChartConfig {
  return Object.fromEntries(
    categoryChartData.map((item, i) => [
      item.name,
      { label: item.name, color: item.fill ?? CHART_COLORS[i % CHART_COLORS.length] },
    ]),
  );
}

export function buildExchangeRateSeries(data: CardTransactionAnalytics | undefined) {
  const points = data?.exchangeRateTrend ?? [];
  if (points.length === 0) return null;

  const pairCounts = new Map<string, number>();
  for (const point of points) {
    const key = `${point.fiatCurrency}/${point.cryptoSymbol}`;
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + point.txCount);
  }
  const selectedPair = [...pairCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!selectedPair) return null;

  const pairPoints = points.filter(
    (point) => `${point.fiatCurrency}/${point.cryptoSymbol}` === selectedPair,
  );
  const fiatCurrency = pairPoints[0]?.fiatCurrency ?? null;
  const cryptoSymbol = pairPoints[0]?.cryptoSymbol ?? null;
  const fiatTotal = pairPoints.reduce((sum, point) => sum + point.fiatTotal, 0);
  const cryptoTotal = pairPoints.reduce((sum, point) => sum + point.cryptoTotal, 0);
  const weightedAverage = cryptoTotal > 0 ? fiatTotal / cryptoTotal : null;
  const first = pairPoints[0] ?? null;
  const latest = pairPoints[pairPoints.length - 1] ?? null;
  const min = Math.min(...pairPoints.map((point) => point.rate));
  const max = Math.max(...pairPoints.map((point) => point.rate));
  const changePct =
    first && latest && first.rate > 0 ? ((latest.rate - first.rate) / first.rate) * 100 : null;

  return {
    fiatCurrency,
    cryptoSymbol,
    weightedAverage,
    latest,
    changePct,
    min,
    max,
    data: pairPoints.map((point) => ({
      ...point,
      day: dayLabel(point.date),
      average: weightedAverage,
    })),
  };
}

export function buildAvgTransactionSeries(data: CardTransactionAnalytics | undefined) {
  const points = data?.avgTransactionAmountTrend ?? [];
  if (points.length === 0) return null;

  const currencyCounts = new Map<string, number>();
  for (const point of points) {
    currencyCounts.set(point.currency, (currencyCounts.get(point.currency) ?? 0) + point.txCount);
  }
  const selectedCurrency = [...currencyCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!selectedCurrency) return null;

  const currencyPoints = points.filter((point) => point.currency === selectedCurrency);
  const fiatTotal = currencyPoints.reduce((sum, point) => sum + point.fiatTotal, 0);
  const txCount = currencyPoints.reduce((sum, point) => sum + point.txCount, 0);
  const periodAverage = txCount > 0 ? fiatTotal / txCount : null;
  const first = currencyPoints[0] ?? null;
  const latest = currencyPoints[currencyPoints.length - 1] ?? null;
  const dailyAvgs = currencyPoints.map((point) => point.avgAmount);
  const min = Math.min(...dailyAvgs);
  const max = Math.max(...dailyAvgs);
  const changePct =
    first && latest && first.avgAmount > 0
      ? ((latest.avgAmount - first.avgAmount) / first.avgAmount) * 100
      : null;

  return {
    currency: selectedCurrency,
    periodAverage,
    latest,
    changePct,
    min,
    max,
    data: currencyPoints.map((point) => ({
      ...point,
      day: dayLabel(point.date),
      periodAverage,
    })),
  };
}

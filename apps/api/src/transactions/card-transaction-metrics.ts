import { CardTxStatus, Prisma } from '@metaspend/db';
import type {
  AvgTransactionAmountTrendPoint,
  CryptoSpendSummary,
  ExchangeRateTrendPoint,
} from '@metaspend/shared';

type CardMetricRow = {
  fiatAmount?: Prisma.Decimal | string | number | null;
  fiatCurrency?: string | null;
  cryptoAmount?: Prisma.Decimal | string | number | null;
  cryptoSymbol?: string | null;
  timestamp?: Date | null;
  merchantRaw?: string | null;
  rawData?: Prisma.JsonValue | null;
  status?: CardTxStatus | string | null;
};

const SPENDING_STATUSES = new Set<string>([CardTxStatus.SETTLED, CardTxStatus.PENDING]);

function absNumber(value: Prisma.Decimal | string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.abs(n) : null;
}

function normalizeSymbol(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toUpperCase().slice(0, 32) : null;
}

function isSpendRow(row: CardMetricRow): boolean {
  const status = row.status ? String(row.status) : CardTxStatus.SETTLED;
  if (!SPENDING_STATUSES.has(status)) return false;
  const amount = Number(row.fiatAmount ?? 0);
  return Number.isFinite(amount) ? amount <= 0 : true;
}

function trimDecimal(value: number, maxFractionDigits = 8): string {
  return value.toLocaleString('en-US', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

function rawObject(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function parseCryptoToken(raw: unknown): { amount: number; symbol: string } | null {
  if (typeof raw !== 'string') return null;
  const match = /^\s*\+?(\d+(?:[,.]\d+)?)\s+([a-z][a-z0-9]*)\s*$/iu.exec(raw);
  if (!match) return null;
  const amount = Number(match[1]!.replace(',', '.'));
  const symbol = normalizeSymbol(match[2]);
  if (!Number.isFinite(amount) || !symbol) return null;
  return { amount, symbol };
}

export function cardGasFee(row: CardMetricRow): { amount: string; symbol: string } | null {
  const scrape = rawObject(rawObject(row.rawData)?.['cardScrape'] as Prisma.JsonValue | null | undefined);
  const rawGas = parseCryptoToken(scrape?.['gasFeeRaw']);
  const amount = absNumber(scrape?.['gasFeeAmount'] as string | number | null | undefined) ?? rawGas?.amount ?? null;
  const symbol = normalizeSymbol(scrape?.['gasFeeSymbol']) ?? rawGas?.symbol ?? null;
  if (amount !== null && symbol) {
    return { amount: trimDecimal(amount, 12), symbol };
  }

  const segments = (row.merchantRaw ?? '').split('|').map((part) => part.trim()).filter(Boolean);
  const parsed = segments.map(parseCryptoToken).find(Boolean);
  return parsed ? { amount: trimDecimal(parsed.amount, 12), symbol: parsed.symbol } : null;
}

export function cardExchangeRate(row: CardMetricRow): string | null {
  const fiat = absNumber(row.fiatAmount);
  const crypto = absNumber(row.cryptoAmount);
  if (!fiat || !crypto) return null;
  return trimDecimal(fiat / crypto, 8);
}

export function cryptoSpendSummaries(rows: CardMetricRow[]): CryptoSpendSummary[] {
  const summaries = new Map<
    string,
    { symbol: string; totalSpent: number; totalGasFee: number; fiatTotal: number; cryptoRateBase: number; txCount: number }
  >();

  for (const row of rows) {
    if (!isSpendRow(row)) continue;
    const symbol = normalizeSymbol(row.cryptoSymbol);
    const crypto = absNumber(row.cryptoAmount);
    const fiat = absNumber(row.fiatAmount);
    const gas = cardGasFee(row);
    const gasSymbol = gas?.symbol ?? symbol;
    const key = symbol ?? gasSymbol;
    if (!key) continue;

    const current = summaries.get(key) ?? {
      symbol: key,
      totalSpent: 0,
      totalGasFee: 0,
      fiatTotal: 0,
      cryptoRateBase: 0,
      txCount: 0,
    };

    if (symbol === key && crypto !== null) {
      current.totalSpent += crypto;
      current.txCount += 1;
      if (fiat !== null) {
        current.fiatTotal += fiat;
        current.cryptoRateBase += crypto;
      }
    }

    if (gas && gas.symbol === key) {
      current.totalGasFee += Number(gas.amount);
    }

    summaries.set(key, current);
  }

  return [...summaries.values()]
    .map((item) => ({
      symbol: item.symbol,
      totalSpent: Number(item.totalSpent.toFixed(8)),
      totalGasFee: Number(item.totalGasFee.toFixed(12)),
      averageFiatPerCryptoRate:
        item.fiatTotal > 0 && item.cryptoRateBase > 0
          ? Number((item.fiatTotal / item.cryptoRateBase).toFixed(8))
          : null,
      txCount: item.txCount,
    }))
    .filter((item) => item.totalSpent > 0 || item.totalGasFee > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

export function exchangeRateTrend(rows: CardMetricRow[]): ExchangeRateTrendPoint[] {
  const groups = new Map<
    string,
    {
      date: string;
      fiatCurrency: string;
      cryptoSymbol: string;
      fiatTotal: number;
      cryptoTotal: number;
      txCount: number;
    }
  >();

  for (const row of rows) {
    if (!isSpendRow(row)) continue;
    const fiat = absNumber(row.fiatAmount);
    const crypto = absNumber(row.cryptoAmount);
    const fiatCurrency = normalizeSymbol(row.fiatCurrency);
    const cryptoSymbol = normalizeSymbol(row.cryptoSymbol);
    if (!row.timestamp || !fiat || !crypto || !fiatCurrency || !cryptoSymbol) continue;

    const date = row.timestamp.toISOString().slice(0, 10);
    const key = `${date}:${fiatCurrency}:${cryptoSymbol}`;
    const current = groups.get(key) ?? {
      date,
      fiatCurrency,
      cryptoSymbol,
      fiatTotal: 0,
      cryptoTotal: 0,
      txCount: 0,
    };

    current.fiatTotal += fiat;
    current.cryptoTotal += crypto;
    current.txCount += 1;
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      fiatTotal: Number(group.fiatTotal.toFixed(2)),
      cryptoTotal: Number(group.cryptoTotal.toFixed(8)),
      rate: Number((group.fiatTotal / group.cryptoTotal).toFixed(8)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function avgTransactionAmountTrend(rows: CardMetricRow[]): AvgTransactionAmountTrendPoint[] {
  const groups = new Map<
    string,
    {
      date: string;
      currency: string;
      fiatTotal: number;
      txCount: number;
    }
  >();

  for (const row of rows) {
    if (!isSpendRow(row)) continue;
    const fiat = absNumber(row.fiatAmount);
    const currency = normalizeSymbol(row.fiatCurrency);
    if (!row.timestamp || !fiat || !currency) continue;

    const date = row.timestamp.toISOString().slice(0, 10);
    const key = `${date}:${currency}`;
    const current = groups.get(key) ?? {
      date,
      currency,
      fiatTotal: 0,
      txCount: 0,
    };

    current.fiatTotal += fiat;
    current.txCount += 1;
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((group) => ({
      date: group.date,
      currency: group.currency,
      fiatTotal: Number(group.fiatTotal.toFixed(2)),
      txCount: group.txCount,
      avgAmount: Number((group.fiatTotal / group.txCount).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

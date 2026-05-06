/**
 * Rows from DOM scrape (`merchant`…) or snapshots using `title` / nested `funding`.
 */

import type { CardTxWire, ParsedCardWire } from './api';

export interface ScrapedCardTransaction {
  merchant?: string;
  title?: string;
  time?: string;
  amount?: string;
  type?: string;
  status?: string | null;
  transactionId?: string | null;
  date?: string | null;
  cardPan?: string | null;
  source?: string | null;
  spent?: string | null;
  gasFee?: string | null;
  funding?: {
    source?: string | null;
    spent?: string | null;
    gasFee?: string | null;
  } | null;
}

export const CARD_PARSER_VERSION = 2;

function normalizeStatus(raw: string | null | undefined): CardTxWire {
  const key = (raw ?? '').trim().toUpperCase();

  switch (key) {
    case 'PENDING':
    case 'AUTHORIZED':
      return 'PENDING';
    case 'COMPLETE':
    case 'COMPLETED':
    case 'SETTLED':
      return 'SETTLED';
    case 'DECLINED':
    case 'CANCELLED':
    case 'CANCELED':
      return 'DECLINED';
    case 'REFUND':
    case 'REFUNDED':
      return 'REFUNDED';
    default:
      return 'SETTLED';
  }
}

/** Parses DD/MM/YYYY hh:mm am/pm in local TZ, e.g. `04/05/2026 09:51 pm` */
export function ukDateTimeMeridianToIso(raw: string | null | undefined): string | null {

  const s = raw?.trim();

  if (!s) return null;

  const re = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/iu;

  const m = re.exec(s);

  if (!m) {

    const d = new Date(s);

    return Number.isNaN(d.getTime()) ? null : d.toISOString();

  }

  let hour = Number(m[4]);
  const minute = Number(m[5]);
  const ampm = m[6]!.toLowerCase();
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);

  if (hour < 12 && ampm === 'pm') hour += 12;

  if (hour === 12 && ampm === 'am') hour = 0;

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();

}

export function splitMoneyToken(raw: string | null | undefined): { numeric: string; currencyRaw: string } | null {

  const s = raw?.trim()?.replace(/^,/u, '');
  if (!s) return null;

  const m = /^(-?\d+(?:\.\d+)?)\s+(.+)$/u.exec(s);
  if (!m) return null;

  return { numeric: m[1]!, currencyRaw: m[2]!.trim() };

}

function cryptoSymbolDisplay(currencyRaw: string): string {

  const trimmed = currencyRaw.trim();
  const compact = trimmed.replace(/\s+/gu, '').toUpperCase();

  if (/\bMM?USD\b|\bMILLI\s?USD\b/iu.test(trimmed) || /M+M?USD/iu.test(compact)) {
    return 'MUSD';

  }

  return compact.slice(0, 32);

}

export function splitCryptoSpend(raw: string | null | undefined): { numeric: string; symbol: string } | null {

  const parts = splitMoneyToken(raw?.trim());
  if (!parts) return null;

  const symbol = cryptoSymbolDisplay(parts.currencyRaw);
  return { numeric: parts.numeric, symbol };

}

export function scrapedToParsedCardTx(row: ScrapedCardTransaction): ParsedCardWire | null {

  const ext = row.transactionId?.trim();
  if (!ext) return null;

  const merchantName = (row.merchant?.trim() ?? row.title?.trim() ?? 'Unknown merchant').slice(0, 512);

  const composedDateTime =
    typeof row.date === 'string' && typeof row.time === 'string'

      ? row.date.includes(row.time.trim())

        ? row.date.trim()

        : `${row.date.replace(/\s+.*$/u, '').trim()} ${row.time.trim()}`

      : row.date;

  const occurredAt = ukDateTimeMeridianToIso(composedDateTime);

  if (!occurredAt) return null;

  const fiat = splitMoneyToken(row.amount);
  if (!fiat) return null;

  const fiatCurrency = fiat.currencyRaw.slice(0, 8).toUpperCase();

  const spentRaw = row.funding?.spent ?? row.spent ?? null;
  let cryptoParsed = splitCryptoSpend(spentRaw);

  let cryptoAmount: string | null = cryptoParsed?.numeric ?? null;

  let cryptoSymbol: string | null = cryptoParsed?.symbol ?? null;

  /** Some entries only expose fiat spend */
  if (cryptoAmount === null) {
    cryptoAmount = fiat.numeric;

    cryptoSymbol = fiatCurrency;
  }

  const fundingMasked = row.funding?.source?.trim() ?? row.source?.trim() ?? null;

  return {
    externalId: ext.slice(0, 512),
    occurredAt,
    merchantName,
    fiatAmount: fiat.numeric,
    fiatCurrency,
    merchantRaw:
      `${row.cardPan ?? ''}|${row.type ?? ''}|${row.gasFee ?? row.funding?.gasFee ?? ''}|${spentRaw ?? ''}`
        .replace(/\|\|+/gu, '|')
        .slice(0, 2048) || undefined,
    cryptoAmount,

    cryptoSymbol,
    fundingSourceMasked: fundingMasked ?? null,

    status: normalizeStatus(row.status),
    parserVersion: CARD_PARSER_VERSION,
  };

}

export function scrapedManyToParsedPayload(rows: ScrapedCardTransaction[]): ParsedCardWire[] {

  const out: ParsedCardWire[] = [];
  const seenExternal = new Set<string>();

  for (const row of rows) {

    const parsed = scrapedToParsedCardTx(row);

    if (!parsed) continue;

    if (seenExternal.has(parsed.externalId)) continue;

    seenExternal.add(parsed.externalId);

    out.push(parsed);
  }

  return out;

}

/** Matches `@crypto-tracker/shared` ParsedCardTx / POST body without pulling built artifacts. */

export interface ParsedCardWire {
  externalId: string;
  occurredAt: string;
  merchantName: string;
  merchantRaw?: string | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
  gasFeeAmount?: string | null;
  gasFeeSymbol?: string | null;
  gasFeeRaw?: string | null;
  spentRaw?: string | null;
  creditedRaw?: string | null;
  status: CardTxWire;
  parserVersion: number;
  rawHtml?: string | null;
  fundingSourceMasked?: string | null;
  creditDestinationMasked?: string | null;
}

export type CardTxWire = 'PENDING' | 'SETTLED' | 'DECLINED' | 'REFUNDED';

export interface CardSyncBodyWire {
  parserVersion: number;
  items: ParsedCardWire[];
  cardBalanceSnapshot?: { amount: string; currency: string };
}

export interface CardSyncResultWire {
  inserted: number;
  updated: number;
  skipped: number;
}

export const API_URL = process.env.PLASMO_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1';

export async function pairExtension(code: string): Promise<{ token: string }> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 12_000);
  const res = await fetch(`${API_URL}/auth/extension/pair`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ code: code.trim() }),
    signal: controller.signal,
  }).finally(() => globalThis.clearTimeout(timeout));

  const body = (await res.json().catch(() => null)) as {
    token?: string;
    message?: string | string[] | Record<string, unknown>;
  } | null;

  if (!res.ok) {
    let msg = `pair failed (${res.status})`;
    const m = body?.message;
    if (Array.isArray(m)) msg = m.join('; ');
    else if (typeof m === 'string') msg = m;
    else if (m !== undefined && m !== null) msg = JSON.stringify(m);
    throw new Error(msg);
  }

  const token = body?.token;
  if (!token) {
    throw new Error('Malformed pair response.');
  }

  return { token };
}

export async function syncCardTransactions(
  bearerToken: string,
  payload: CardSyncBodyWire,
): Promise<CardSyncResultWire> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  const res = await fetch(`${API_URL}/card-transactions/sync`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const body = (await res.json().catch(() => null)) as
    | (CardSyncResultWire & { message?: string | unknown })
    | null;

  if (!res.ok) {
    let msg = `sync failed (${res.status})`;
    if (body && typeof body === 'object' && body.message !== undefined) {
      const m = body.message;
      msg = typeof m === 'string' ? m : JSON.stringify(m);
    }
    throw new Error(msg);
  }

  return {
    inserted: Number(body?.inserted ?? 0),
    updated: Number(body?.updated ?? 0),
    skipped: Number(body?.skipped ?? 0),
  };
}

export async function disconnectExtension(bearerToken: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const res = await fetch(`${API_URL}/auth/extension/disconnect-current`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${bearerToken}`,
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (res.ok || res.status === 401) {
    // 401 means server already considers it disconnected/invalid.
    return;
  }

  const body = (await res.json().catch(() => null)) as { message?: string | unknown } | null;
  if (body && typeof body === 'object' && body.message !== undefined) {
    const msg = body.message;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  throw new Error(`disconnect failed (${res.status})`);
}

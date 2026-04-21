import { CardSyncBodySchema, type ParsedCardTx } from '@crypto-tracker/shared';
import { CURRENT_PARSER_VERSION } from '../constants';
import { getApiBase, getExtensionToken, markSyncedCardItems, setLastSyncAt } from './storage';

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function postWithRetry(
  url: string,
  token: string,
  body: unknown,
  attempts = 3,
): Promise<{ ok: boolean; status: number; text: string }> {
  let last: { ok: boolean; status: number; text: string } = { ok: false, status: 0, text: '' };
  for (let i = 0; i < attempts; i += 1) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    last = { ok: res.ok, status: res.status, text };
    if (res.ok) return last;
    if (res.status === 401 || res.status === 400) return last;
    await sleep(400 * 2 ** i);
  }
  return last;
}

const CHUNK = 100;

export async function syncParsedItems(items: ParsedCardTx[]): Promise<{
  ok: boolean;
  message: string;
  inserted?: number;
  updated?: number;
}> {
  if (items.length === 0) {
    return { ok: true, message: 'Nothing to sync.' };
  }
  const token = await getExtensionToken();
  if (!token) {
    return { ok: false, message: 'Not paired. Open the extension popup and enter a pairing code.' };
  }
  const base = await getApiBase();
  const fullParsed = CardSyncBodySchema.safeParse({
    parserVersion: CURRENT_PARSER_VERSION,
    items,
  });
  if (!fullParsed.success) {
    return { ok: false, message: `Validation failed: ${JSON.stringify(fullParsed.error.flatten())}` };
  }

  let inserted = 0;
  let updated = 0;
  const syncedItems: ParsedCardTx[] = [];

  for (let offset = 0; offset < fullParsed.data.items.length; offset += CHUNK) {
    const chunk = fullParsed.data.items.slice(offset, offset + CHUNK);
    if (chunk.length === 0) break;
    const chunkParsed = CardSyncBodySchema.safeParse({
      parserVersion: CURRENT_PARSER_VERSION,
      items: chunk,
    });
    if (!chunkParsed.success) {
      return { ok: false, message: `Chunk validation failed: ${JSON.stringify(chunkParsed.error.flatten())}` };
    }
    const body = chunkParsed.data;
    const res = await postWithRetry(`${base}/card-transactions/sync`, token, body);
    if (!res.ok) {
      return {
        ok: false,
        message: `Sync failed (${res.status}): ${res.text.slice(0, 200)}`,
      };
    }
    try {
      const json = JSON.parse(res.text) as { inserted?: number; updated?: number };
      inserted += json.inserted ?? 0;
      updated += json.updated ?? 0;
    } catch {
      /* ignore parse */
    }
    syncedItems.push(...chunk);
  }

  await markSyncedCardItems(syncedItems);
  await setLastSyncAt(new Date().toISOString());
  await chrome.action.setBadgeText({ text: String(inserted + updated || '') });
  await chrome.action.setBadgeBackgroundColor({ color: '#0d9488' });

  return {
    ok: true,
    message: `Synced (+${inserted} new, ~${updated} updated)`,
    inserted,
    updated,
  };
}

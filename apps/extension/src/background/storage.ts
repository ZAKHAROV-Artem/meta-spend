import type { ParsedCardTx } from '@crypto-tracker/shared';
import { SEEN_IDS_MAX } from '../constants';
import { fingerprintParsedCardTx } from '../card-item-fingerprint';

const DEFAULT_API = 'http://localhost:4001/api/v1';
const SYNCED_CARD_FINGERPRINTS_KEY = 'syncedCardFingerprints';

export async function getApiBase(): Promise<string> {
  const { apiBaseUrl } = await chrome.storage.local.get('apiBaseUrl');
  return typeof apiBaseUrl === 'string' && apiBaseUrl.length > 0
    ? apiBaseUrl.replace(/\/$/, '')
    : DEFAULT_API;
}

export async function getExtensionToken(): Promise<string | null> {
  const { extensionToken } = await chrome.storage.local.get('extensionToken');
  return typeof extensionToken === 'string' ? extensionToken : null;
}

export async function getSeenExternalIds(): Promise<string[]> {
  const { seenExternalIds } = await chrome.storage.local.get('seenExternalIds');
  return Array.isArray(seenExternalIds) ? (seenExternalIds as string[]) : [];
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((entry) => typeof entry === 'string');
}

async function getSyncedCardFingerprints(): Promise<Record<string, string>> {
  const stored = await chrome.storage.local.get(SYNCED_CARD_FINGERPRINTS_KEY);
  const value = stored[SYNCED_CARD_FINGERPRINTS_KEY];
  return isStringRecord(value) ? value : {};
}

export async function markSyncedCardItems(items: ParsedCardTx[]): Promise<void> {
  if (items.length === 0) return;

  const synced = await getSyncedCardFingerprints();
  const next = new Map(Object.entries(synced));

  for (const item of items) {
    next.delete(item.externalId);
    next.set(item.externalId, fingerprintParsedCardTx(item));
  }

  while (next.size > SEEN_IDS_MAX) {
    const oldest = next.keys().next().value;
    if (!oldest) break;
    next.delete(oldest);
  }

  await chrome.storage.local.set({
    [SYNCED_CARD_FINGERPRINTS_KEY]: Object.fromEntries(next),
  });
}

export async function filterChangedCardItems(items: ParsedCardTx[]): Promise<ParsedCardTx[]> {
  if (items.length === 0) return [];

  const [syncedFingerprints, legacySeenIds] = await Promise.all([
    getSyncedCardFingerprints(),
    getSeenExternalIds(),
  ]);
  const legacySeen = new Set(legacySeenIds);

  return items.filter((item) => {
    const syncedFingerprint = syncedFingerprints[item.externalId];
    if (typeof syncedFingerprint === 'string') {
      return syncedFingerprint !== fingerprintParsedCardTx(item);
    }
    return !legacySeen.has(item.externalId);
  });
}

export async function setLastSyncAt(iso: string): Promise<void> {
  await chrome.storage.local.set({ lastSyncAt: iso });
}

import type { ParsedCardTx } from '@crypto-tracker/shared';
import { CARD_MATCH_PATTERNS, isSupportedCardUrl } from '../card-page';
import { ensureCardContentScript } from '../runtime/ensure-card-content-script';
import { filterChangedCardItems } from './storage';
import { syncParsedItems } from './sync-api';

type RuntimeMessage =
  | { type: 'CARD_BATCH'; items: ParsedCardTx[] }
  | { type: 'GET_SYNC_STATUS' }
  | { type: 'PING' };

async function primeOpenCardTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({ url: [...CARD_MATCH_PATTERNS] });

  await Promise.all(
    tabs.map(async (tab) => {
      if (!tab.id || !tab.url || !isSupportedCardUrl(tab.url)) return;
      await ensureCardContentScript(tab.id, tab.url);
    }),
  );
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message?.type === 'CARD_BATCH') {
    void (async () => {
      const changed = await filterChangedCardItems(message.items);
      if (changed.length === 0) {
        sendResponse({ ok: true, message: 'All items already synced.' });
        return;
      }
      const result = await syncParsedItems(changed);
      sendResponse(result);
    })();
    return true;
  }
  if (message?.type === 'GET_SYNC_STATUS') {
    void chrome.storage.local.get(['lastSyncAt']).then((s) => {
      sendResponse({ lastSyncAt: s.lastSyncAt ?? null });
    });
    return true;
  }
  if (message?.type === 'PING') {
    sendResponse({ ok: true });
    return false;
  }
  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  void primeOpenCardTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void primeOpenCardTabs();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url || !isSupportedCardUrl(tab.url)) return;
  void ensureCardContentScript(tabId, tab.url);
});

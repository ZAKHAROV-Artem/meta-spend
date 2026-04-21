import { parseCardPage } from './parser';
import { fingerprintParsedCardTx } from '../card-item-fingerprint';

const DEBOUNCE_MS = 800;

declare global {
  interface Window {
    __cryptoTrackCardSyncInitialized?: boolean;
  }
}

if (!window.__cryptoTrackCardSyncInitialized) {
  window.__cryptoTrackCardSyncInitialized = true;

  const sentFingerprints = new Map<string, string>();
  let isSending = false;
  let needsFlush = false;

  function diffItems(items: ReturnType<typeof parseCardPage>) {
    return items.filter((item) => sentFingerprints.get(item.externalId) !== fingerprintParsedCardTx(item));
  }

  function rememberItems(items: ReturnType<typeof parseCardPage>): void {
    for (const item of items) {
      sentFingerprints.set(item.externalId, fingerprintParsedCardTx(item));
    }
  }

  function sendRuntimeMessage(items: ReturnType<typeof parseCardPage>): Promise<{ ok?: boolean } | undefined> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'CARD_BATCH', items }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false });
          return;
        }
        resolve(response as { ok?: boolean } | undefined);
      });
    });
  }

  async function sendBatch(): Promise<void> {
    if (isSending) {
      needsFlush = true;
      return;
    }

    isSending = true;
    try {
      do {
        needsFlush = false;
        const items = parseCardPage(document);
        const changedItems = diffItems(items);
        if (changedItems.length === 0) continue;

        const response = await sendRuntimeMessage(changedItems);
        if (response?.ok) {
          rememberItems(changedItems);
        }
      } while (needsFlush);
    } finally {
      isSending = false;
    }
  }

  function requestBatchSend(): void {
    void sendBatch();
  }

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function scheduleSend(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      requestBatchSend();
    }, DEBOUNCE_MS);
  }

  const observer = new MutationObserver(() => {
    scheduleSend();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('scroll', scheduleSend, { passive: true });

  scheduleSend();

  chrome.runtime.onMessage.addListener((msg: { type?: string }, _sender, sendResponse) => {
    if (msg?.type === 'PING') {
      sendResponse({ ok: true });
      return false;
    }

    if (msg?.type === 'SCRAPE_NOW') {
      void sendBatch();
      sendResponse({ ok: true });
      return false;
    }

    return false;
  });
}

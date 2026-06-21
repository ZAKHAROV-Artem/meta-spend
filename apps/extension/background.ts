import {
  CARD_PARSER_VERSION,
  scrapedManyToParsedPayload,
  type ScrapedCardTransaction,
} from './src/lib/normalize';

type CaptureResult =
  | {
      ok: true;
      html: string;
      sourceUrl: string;
      capturedAt: string;
      transactionCount: number;
      transactions: ScrapedCardTransaction[];
      cardBalance?: { amount: string; currency: string };
    }
  | {
      ok: false;
      error: string;
      sourceUrl?: string;
      capturedAt: string;
    };

type CaptureMessage = { type: 'CAPTURE_CARD_HTML' };
type ScrapeMessage = { type: 'SCRAPE_CARD_HTML' };

type StoredCapture = CaptureResult & {
  jobId: string;
  savedAt: string;
};

/** Pairing token is saved from the popup. */
export const STORAGE_API_TOKEN_KEY = 'metaspendApiToken';

const LOG_PREFIX = '[MetaSpend Card Capture]';

const STORAGE_KEY = 'cardCaptures';
/** Content-script scrape must finish quickly; sync HTTP runs in the popup (MV3 workers suspend on long fetch). */
const SCRAPE_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function isCardPage(url: string | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.hostname === 'card.metamask.io' || parsed.hostname === 'portfolio.metamask.io';
  } catch {
    return false;
  }
}

/** Injected via `chrome.scripting.executeScript` — keep self-contained. */
function scrapeFromPage(): CaptureResult {
  type PT = ScrapedCardTransaction;

  const capturedAt = new Date().toISOString();

  try {
    const cleanText = (value: string | null | undefined): string => (value ?? '').replace(/\s+/g, ' ').trim();
    const textFrom = (root: Element, selector: string): string =>
      cleanText(root.querySelector(selector)?.textContent);
    const detailValue = (row: Element, label: string): string | null => {
      const detailRows = Array.from(row.querySelectorAll('.transactionRow__details_row_container'));

      const match = detailRows.find(
        (item) => cleanText(item.querySelector('p:first-child')?.textContent) === label,
      );

      if (!match) return null;

      return cleanText(match.querySelector('p:last-child')?.textContent) || null;
    };

    const fundingValue = (row: Element, label: string): string | null => {
      const fundingRows = Array.from(row.querySelectorAll('.transactionRow__details_funding_row'));

      const match = fundingRows.find(
        (item) => cleanText(item.querySelector('p:first-child')?.textContent) === label,
      );

      if (!match) return null;

      return cleanText(match.querySelector('p:last-child')?.textContent) || null;
    };

    const parseTransaction = (row: Element): PT => ({
      merchant: textFrom(row, '.transactionRow__details_row_merchant'),

      time: textFrom(row, '.transactionRow__summary_title_container p:last-child'),

      amount: textFrom(row, '.transactionRow__summary_container > div:last-child p:first-child'),

      type: textFrom(row, '.transactionRow__summary_container > div:last-child p:last-child'),

      status: detailValue(row, 'Status'),

      transactionId: detailValue(row, 'Transaction ID'),

      date: detailValue(row, 'Date'),

      cardPan: detailValue(row, 'Card PAN'),

      source: fundingValue(row, 'Source'),

      spent: fundingValue(row, 'Spent'),

      gasFee: fundingValue(row, 'Gas fee'),

      destination: fundingValue(row, 'Destination') ?? detailValue(row, 'Destination'),

      credited: fundingValue(row, 'Credited') ?? detailValue(row, 'Credited'),
    });

    const list =
      document.querySelector('.transactionList__main_container') ??
      document.querySelector('main') ??
      document.body;

    if (!list) {
      return {
        ok: false,
        error: 'Could not find document body.',

        sourceUrl: location.href,
        capturedAt,
      };

    }

    const rowsFromDom = Array.from(list.querySelectorAll('.transactionRow__accordion_main_container'));
    const transactions = rowsFromDom.map(parseTransaction);

    const scrapeCardBalanceSnapshot = (): { amount: string; currency: string } | null => {
      const container = document.querySelector('.cardImagery__card_svg_container');
      if (!container) return null;
      const textEls = container.querySelectorAll('svg text');
      for (let ti = 0; ti < textEls.length; ti++) {
        const textEl = textEls[ti];
        const tspans = textEl.querySelectorAll('tspan');
        if (tspans.length === 0) continue;
        let amount = '';
        for (let ni = 0; ni < textEl.childNodes.length; ni++) {
          const node = textEl.childNodes[ni];
          if (node.nodeType === Node.TEXT_NODE) {
            amount += (node.textContent || '').trim();
          }
        }
        amount = amount.replace(/\s/g, '');
        const currencyEl = tspans[tspans.length - 1];
        const currency = ((currencyEl && currencyEl.textContent) || '')
          .trim()
          .replace(/\s/g, '');
        if (!amount || !currency) continue;
        const normalizedAmount = amount.replace(/,/g, '');
        if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) continue;
        return { amount: normalizedAmount, currency };
      }
      return null;
    };

    const snap = scrapeCardBalanceSnapshot();
    const out: CaptureResult = {
      ok: true,
      html: '',
      sourceUrl: location.href,
      capturedAt,
      transactionCount: transactions.length,
      transactions,
    };
    if (snap) out.cardBalance = snap;
    return out;

  } catch (error) {

    return {

      ok: false,
      error: error instanceof Error ? error.message : String(error),

      sourceUrl: location.href,
      capturedAt,
    };

  }

}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;

}

async function askContentScript(tabId: number): Promise<CaptureResult> {
  console.log(LOG_PREFIX, 'asking content script to scrape tab', tabId);
  return withTimeout(
    chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_CARD_HTML' } satisfies ScrapeMessage),
    SCRAPE_TIMEOUT_MS,
    'Timed out waiting for the MetaMask page scraper.',
  );

}

async function executeFallbackScraper(tabId: number): Promise<CaptureResult> {
  console.log(LOG_PREFIX, 'content script was not ready, injecting fallback scraper into tab', tabId);

  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: scrapeFromPage,

  });

  return (
    result?.result ??
    ({
      ok: false,
      error: 'Script executed but returned no result.',
      capturedAt: new Date().toISOString(),
    } satisfies CaptureResult)

  );

}

async function captureTab(tab: chrome.tabs.Tab): Promise<CaptureResult> {

  console.log(LOG_PREFIX, 'capture requested for active tab', { id: tab.id, url: tab.url });


  if (!tab.id) {
    return {
      ok: false,
      error: 'Active tab has no id.',

      sourceUrl: tab.url,

      capturedAt: new Date().toISOString(),

    };

  }


  if (!isCardPage(tab.url)) {

    return {

      ok: false,
      error: 'Open card.metamask.io or portfolio.metamask.io before syncing.',

      sourceUrl: tab.url,

      capturedAt: new Date().toISOString(),
    };


  }


  try {

    const result = await askContentScript(tab.id);


    console.log(LOG_PREFIX, 'content script scrape finished', result.ok ? result.transactionCount : result.error);


    return result;


  } catch (error) {



    console.warn(LOG_PREFIX, 'content script scrape failed, trying fallback injection', error);



    return withTimeout(
      executeFallbackScraper(tab.id),
      SCRAPE_TIMEOUT_MS,
      'Timed out while injecting the fallback scraper.',
    );



  }



}



async function saveCapture(jobId: string, result: CaptureResult): Promise<StoredCapture> {



  const savedCapture: StoredCapture = {
    ...result,
    jobId,
    savedAt: new Date().toISOString(),
  };


  const current = await chrome.storage.local.get(STORAGE_KEY);
  const captures = Array.isArray(current[STORAGE_KEY]) ? current[STORAGE_KEY] : [];

  const nextCaptures = [savedCapture, ...captures].slice(0, 20);


  await chrome.storage.local.set({ [STORAGE_KEY]: nextCaptures });


  console.log(LOG_PREFIX, 'saved capture in chrome.storage.local', {
    jobId,
    ok: savedCapture.ok,
    transactionCount: savedCapture.ok ? savedCapture.transactionCount : 0,
  });


  return savedCapture;


}



async function getStoredApiToken(): Promise<string | undefined> {
  const v = await chrome.storage.local.get(STORAGE_API_TOKEN_KEY);
  const token = v[STORAGE_API_TOKEN_KEY];
  return typeof token === 'string' && token.length > 0 ? token : undefined;



}



chrome.runtime.onMessage.addListener((message: CaptureMessage, _sender, sendResponse) => {
  if (message?.type !== 'CAPTURE_CARD_HTML') return false;

  console.log(LOG_PREFIX, 'capture request from popup');

  void (async () => {
    const jobId = crypto.randomUUID();

    try {
      const tab = await getActiveTab();
      const result =
        tab
          ? await captureTab(tab)
          : ({ ok: false, error: 'No active tab found.', capturedAt: new Date().toISOString() } satisfies CaptureResult);

      await saveCapture(jobId, result);

      if (!result.ok) {
        sendResponse({ ok: false as const, error: result.error, jobId });
        return;
      }

      const token = await getStoredApiToken();

      if (!token) {
        sendResponse({
          ok: true as const,
          jobId,
          scrapeOk: true,
          transactionCount: result.transactionCount,
          syncPayload: null,
          scrapeOnlyMessage: `Scraped ${result.transactionCount} rows. Pair the extension first to push transactions.`,
        });
        return;
      }

      const items = scrapedManyToParsedPayload(result.transactions);

      sendResponse({
        ok: true as const,
        jobId,
        scrapeOk: true,
        transactionCount: result.transactionCount,
        syncPayload: {
          parserVersion: CARD_PARSER_VERSION,
          items,
          ...(result.ok && result.cardBalance
            ? { cardBalanceSnapshot: result.cardBalance }
            : {}),
        },
        scrapeOnlyMessage: null,
      });


    } catch (outer) {
      const errMsg = outer instanceof Error ? outer.message : String(outer);

      console.error(LOG_PREFIX, 'capture job failed', outer);

      await saveCapture(jobId, {
        ok: false,

        error: errMsg,
        capturedAt: new Date().toISOString(),

      });


      sendResponse({ ok: false as const, error: errMsg, jobId });
    }



  })();



  return true;


});

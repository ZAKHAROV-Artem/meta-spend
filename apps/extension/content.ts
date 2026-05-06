import type { PlasmoCSConfig } from 'plasmo';

import type { ScrapedCardTransaction } from './src/lib/normalize';

type CaptureResult =
  | {
      ok: true;
      html: string;
      sourceUrl: string;
      capturedAt: string;
      transactionCount: number;
      transactions: ScrapedCardTransaction[];
    }
  | {
      ok: false;
      error: string;
      sourceUrl?: string;
      capturedAt: string;
    };

type ScrapeMessage = { type: 'SCRAPE_CARD_HTML' };

const LOG_PREFIX = '[CryptoTrack Card Capture]';

export const config: PlasmoCSConfig = {
  matches: ['https://portfolio.metamask.io/*', 'https://card.metamask.io/*'],
  run_at: 'document_idle',
};

function cleanText(value: string | null | undefined): string {

  return (value ?? '').replace(/\s+/g, ' ').trim();


}

function textFrom(root: Element, selector: string): string {
  return cleanText(root.querySelector(selector)?.textContent);


}

function detailValue(row: Element, label: string): string | null {
  const detailRows = Array.from(row.querySelectorAll('.transactionRow__details_row_container'));
  const match = detailRows.find((item) => cleanText(item.querySelector('p:first-child')?.textContent) === label);

  if (!match) return null;

  return cleanText(match.querySelector('p:last-child')?.textContent) || null;


}

function fundingValue(row: Element, label: string): string | null {


  const fundingRows = Array.from(row.querySelectorAll('.transactionRow__details_funding_row'));
  const match = fundingRows.find((item) => cleanText(item.querySelector('p:first-child')?.textContent) === label);

  if (!match) return null;

  return cleanText(match.querySelector('p:last-child')?.textContent) || null;


}


function parseTransaction(row: Element): ScrapedCardTransaction {


  return {


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

  };


}




function scrapeTransactions(): CaptureResult {
  const capturedAt = new Date().toISOString();
  console.log(LOG_PREFIX, 'scraping transactions from page', location.href);

  try {
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



    const rows = Array.from(list.querySelectorAll('.transactionRow__accordion_main_container'));

    const transactions = rows.map(parseTransaction);



    const result = {
      ok: true,
      html: '',
      sourceUrl: location.href,
      capturedAt,
      transactionCount: transactions.length,
      transactions,
    } satisfies CaptureResult;



    console.log(LOG_PREFIX, 'scrape complete', {
      transactionCount: result.transactionCount,
      firstTransaction: result.transactions[0] ?? null,
    });



    return result;


  } catch (error) {

    console.error(LOG_PREFIX, 'scrape failed', error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      sourceUrl: location.href,

      capturedAt,

    };


  }



}



chrome.runtime.onMessage.addListener((message: ScrapeMessage, _sender, sendResponse) => {
  if (message?.type !== 'SCRAPE_CARD_HTML') return false;

  console.log(LOG_PREFIX, 'received scrape request from background worker');


  sendResponse(scrapeTransactions());


  return false;


});

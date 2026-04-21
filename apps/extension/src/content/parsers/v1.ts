import type { CardTxStatus, ParsedCardTx } from '@crypto-tracker/shared';
import { CURRENT_PARSER_VERSION } from '../../constants';

function stableId(parts: string[]): string {
  const key = parts.join('|').slice(0, 500);
  let h = 5381;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 33) ^ key.charCodeAt(i);
  }
  return `mm-card-${(h >>> 0).toString(16)}`;
}

function parseFiat(text: string): { amount: string; currency: string } | null {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return null;
  const symOrder = t.match(/^([+-]?\d[\d,]*(?:\.\d+)?)\s*([A-Z]{3,8})$/i);
  if (symOrder) {
    return { amount: symOrder[1]!.replace(/,/g, ''), currency: symOrder[2]!.toUpperCase() };
  }
  const curFirst = t.match(/^([A-Z]{3,8})\s*([+-]?\d[\d,]*(?:\.\d+)?)$/i);
  if (curFirst) {
    return { amount: curFirst[2]!.replace(/,/g, ''), currency: curFirst[1]!.toUpperCase() };
  }
  if (t.startsWith('$')) {
    const n = t.replace(/[$,\s]/g, '');
    if (/^\d+(\.\d+)?$/.test(n)) return { amount: n, currency: 'USD' };
  }
  const bare = t.match(/^([\d,.]+)$/);
  if (bare) return { amount: bare[1]!.replace(/,/g, ''), currency: 'USD' };
  return null;
}

function inferStatus(text: string): CardTxStatus {
  const l = text.toLowerCase();
  if (l.includes('declin')) return 'DECLINED';
  if (l.includes('pending')) return 'PENDING';
  if (l.includes('refund')) return 'REFUNDED';
  if (l.includes('complete') || l.includes('settled')) return 'SETTLED';
  return 'SETTLED';
}

function parseDate(raw: string): string | null {
  const normalized = raw.replace(/\s+/g, ' ').trim();
  const dayFirst = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(am|pm))?$/i,
  );
  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = Number(dayFirst[2]) - 1;
    const year = Number(dayFirst[3]);
    const hour12 = Number(dayFirst[4] ?? '12');
    const minutes = Number(dayFirst[5] ?? '0');
    const meridiem = (dayFirst[6] ?? 'am').toLowerCase();
    const hours = meridiem === 'pm' ? (hour12 % 12) + 12 : hour12 % 12;
    const date = new Date(year, month, day, hours, minutes, 0, 0);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function getDetailValue(map: Map<string, string>, label: string): string {
  return map.get(label.toLowerCase()) ?? '';
}

function parseAccordionRows(root: ParentNode): ParsedCardTx[] {
  const accordions = root.querySelectorAll('.transactionRow__accordion_main_container');
  const out: ParsedCardTx[] = [];

  for (const accordion of accordions) {
    const detailMap = new Map<string, string>();
    accordion.querySelectorAll('.transactionRow__details_row_container').forEach((row) => {
      const texts = [...row.querySelectorAll('p')]
        .map((node) => normalizeText(node.textContent))
        .filter(Boolean);
      if (texts.length < 2) return;
      detailMap.set(texts[0]!.toLowerCase(), texts[texts.length - 1]!);
    });

    const summary = accordion.querySelector('.transactionRow__summary_container');
    const summaryTexts = [...accordion.querySelectorAll('.MuiAccordionSummary-root p')]
      .map((node) => normalizeText(node.textContent))
      .filter(Boolean);
    const amountText =
      normalizeText(summary?.querySelector('.MuiTypography-alignRight')?.textContent) ||
      summaryTexts.find((text) => parseFiat(text)) ||
      '';
    const fiat = parseFiat(amountText);
    if (!fiat) continue;

    const merchant =
      getDetailValue(detailMap, 'merchant') ||
      normalizeText(accordion.querySelector('.transactionRow__details_row_merchant')?.textContent) ||
      summaryTexts[0] ||
      '';
    const transactionId = getDetailValue(detailMap, 'transaction id');
    const dateText = getDetailValue(detailMap, 'date');
    const occurredAt = parseDate(dateText);
    if (!merchant || !occurredAt) continue;

    const statusText = getDetailValue(detailMap, 'status') || summaryTexts.join(' ');
    const externalId =
      transactionId.length > 0
        ? `mm-card-${transactionId.toLowerCase()}`
        : stableId([occurredAt, merchant, fiat.amount, fiat.currency]);

    out.push({
      externalId,
      occurredAt,
      merchantName: merchant.slice(0, 512),
      merchantRaw: merchant.slice(0, 2000) || null,
      fiatAmount: fiat.amount,
      fiatCurrency: fiat.currency,
      cryptoAmount: null,
      cryptoSymbol: null,
      status: inferStatus(statusText),
      parserVersion: CURRENT_PARSER_VERSION,
      rawHtml: (accordion as HTMLElement).outerHTML.slice(0, 60000),
    });
  }

  return out;
}

export function tryParseV1(doc: Document): ParsedCardTx[] | null {
  const main = doc.querySelector('main');
  const root = main ?? doc.body;
  const out: ParsedCardTx[] = [];

  const accordionRows = parseAccordionRows(root);
  if (accordionRows.length > 0) return accordionRows;

  const tableRows = root.querySelectorAll('table tbody tr');
  for (const tr of tableRows) {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) continue;
    const texts = [...cells].map((c) => c.textContent?.trim() ?? '').filter(Boolean);
    if (texts.length < 2) continue;
    const dateText = texts.find((t) => !Number.isNaN(Date.parse(t))) ?? texts[0]!;
    const iso = parseDate(dateText) ?? new Date().toISOString();
    const fiatText = texts.find((t) => parseFiat(t)) ?? '';
    const fiat = parseFiat(fiatText);
    if (!fiat) continue;
    const merchant =
      texts.find((t) => t !== dateText && t !== fiatText && !parseFiat(t)) ?? texts[1]!;
    const rowHtml = tr.outerHTML.slice(0, 60000);
    out.push({
      externalId: stableId([iso, merchant, fiat.amount, fiat.currency]),
      occurredAt: iso,
      merchantName: merchant.slice(0, 512),
      merchantRaw: merchant.slice(0, 2000) || null,
      fiatAmount: fiat.amount,
      fiatCurrency: fiat.currency,
      cryptoAmount: null,
      cryptoSymbol: null,
      status: inferStatus(texts.join(' ')),
      parserVersion: CURRENT_PARSER_VERSION,
      rawHtml: rowHtml,
    });
  }

  if (out.length > 0) return out;

  const roleRows = root.querySelectorAll('[role="row"]');
  for (const row of roleRows) {
    const rowText = row.textContent?.trim() ?? '';
    if (rowText.length < 4) continue;
    const cells = row.querySelectorAll('[role="cell"], [role="gridcell"], div, span');
    const parts: string[] = [];
    cells.forEach((c) => {
      const t = c.textContent?.trim();
      if (t && t.length < 200) parts.push(t);
    });
    const unique = [...new Set(parts)];
    if (unique.length < 2) continue;
    const dateText = unique.find((t) => !Number.isNaN(Date.parse(t)));
    if (!dateText) continue;
    const iso = parseDate(dateText) ?? new Date().toISOString();
    const fiatText = unique.find((t) => parseFiat(t)) ?? '';
    const fiat = parseFiat(fiatText);
    if (!fiat) continue;
    const merchant =
      unique.find((t) => t !== dateText && t !== fiatText && !parseFiat(t)) ?? unique[1]!;
    out.push({
      externalId: stableId([iso, merchant, fiat.amount, fiat.currency]),
      occurredAt: iso,
      merchantName: merchant.slice(0, 512),
      merchantRaw: merchant.slice(0, 2000) || null,
      fiatAmount: fiat.amount,
      fiatCurrency: fiat.currency,
      cryptoAmount: null,
      cryptoSymbol: null,
      status: inferStatus(rowText),
      parserVersion: CURRENT_PARSER_VERSION,
      rawHtml: (row as HTMLElement).outerHTML.slice(0, 60000),
    });
  }

  return out.length ? out : null;
}

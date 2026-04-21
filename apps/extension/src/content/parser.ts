import type { ParsedCardTx } from '@crypto-tracker/shared';
import { tryParseV1 } from './parsers/v1';

const parsers = [tryParseV1];

export function parseCardPage(doc: Document): ParsedCardTx[] {
  for (let i = parsers.length - 1; i >= 0; i -= 1) {
    const r = parsers[i]!(doc);
    if (r && r.length > 0) return r;
  }
  return [];
}

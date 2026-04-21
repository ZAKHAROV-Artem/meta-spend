import type { ParsedCardTx } from '@crypto-tracker/shared';

export function fingerprintParsedCardTx(item: ParsedCardTx): string {
  return [
    item.externalId,
    item.occurredAt,
    item.merchantName.trim(),
    item.merchantRaw ?? '',
    item.fiatAmount,
    item.fiatCurrency.toUpperCase(),
    item.cryptoAmount ?? '',
    item.cryptoSymbol?.toUpperCase() ?? '',
    item.status,
  ].join('|');
}

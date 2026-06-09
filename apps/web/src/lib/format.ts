/**
 * Format a number as currency using the narrow symbol form.
 * PLN → "zł", USD → "$", EUR → "€", GBP → "£", JPY → "¥", etc.
 */
export function formatMoney(amount: number, currency: string | null | undefined): string {
  if (currency && currency !== '—') {
    try {
      if (/^[A-Z]{3}$/i.test(currency)) {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          maximumFractionDigits: 2,
        }).format(amount);
      }
    } catch {
      /* fallback */
    }
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: Math.abs(amount) < 1 ? 8 : 6,
    }).format(amount)} ${currency.toUpperCase()}`;
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount);
}

/**
 * Compact version: $1.2K, zł12.3M, etc.
 */
export function formatMoneyCompact(
  amount: number,
  currency: string | null | undefined,
): string {
  if (currency && currency !== '—') {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    } catch {
      /* fallback */
    }
  }
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

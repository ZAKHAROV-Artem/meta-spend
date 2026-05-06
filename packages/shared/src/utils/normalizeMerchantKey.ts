/** Same normalization as card merchant grouping (lowercase, strip punctuation, collapse spaces). */
export function normalizeMerchantKey(value: string | null | undefined): string {
  return (value ?? 'Card transaction')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

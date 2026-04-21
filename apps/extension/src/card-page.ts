export const CARD_MATCH_PATTERNS = [
  'https://portfolio.metamask.io/*',
  'https://card.metamask.io/*',
] as const;

export function isSupportedCardUrl(url: string | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'portfolio.metamask.io' ||
      (parsed.hostname === 'card.metamask.io' && parsed.pathname.startsWith('/card/transaction'))
    );
  } catch {
    return false;
  }
}

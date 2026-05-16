/**
 * Reads MetaMask Portfolio card preview (`685.84` + `mUSD`) from the SVG block.
 */
export function scrapeCardBalanceSnapshot(doc: Document = document): {
  amount: string;
  currency: string;
} | null {
  const container = doc.querySelector('.cardImagery__card_svg_container');
  if (!container) return null;

  const textEls = container.querySelectorAll('svg text');
  for (const textEl of textEls) {
    const tspans = textEl.querySelectorAll('tspan');
    if (tspans.length === 0) continue;

    let amount = '';
    for (const node of textEl.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        amount += (node.textContent ?? '').trim();
      }
    }
    amount = amount.replace(/\s/g, '');
    const currency = (tspans[tspans.length - 1]?.textContent ?? '').trim().replace(/\s/g, '');
    if (!amount || !currency) continue;
    const normalizedAmount = amount.replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) continue;

    return { amount: normalizedAmount, currency };
  }

  return null;
}

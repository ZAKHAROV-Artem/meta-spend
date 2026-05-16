/** Snapshot from MetaMask Portfolio card preview (extension sync). */
export interface CardBalanceSnapshot {
  amount: string;
  currency: string;
}

/** Card-only product: only card balance and primary address are tracked. */
export interface PortfolioOverview {
  address: string | null;
  /** Present after extension sync captured the card balance from portfolio.metamask.io */
  cardBalance: CardBalanceSnapshot | null;
}

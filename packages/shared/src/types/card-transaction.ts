export type CardTxStatus = 'PENDING' | 'SETTLED' | 'DECLINED' | 'REFUNDED';

/** Wire shape from browser extension → API sync endpoint */
export interface ParsedCardTx {
  externalId: string;
  occurredAt: string;
  merchantName: string;
  merchantRaw?: string | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount: string | null;
  cryptoSymbol: string | null;
  gasFeeAmount?: string | null;
  gasFeeSymbol?: string | null;
  gasFeeRaw?: string | null;
  spentRaw?: string | null;
  status: CardTxStatus;
  parserVersion: number;
  rawHtml?: string | null;
  fundingSourceMasked?: string | null;
}

export interface CardSyncResult {
  inserted: number;
  updated: number;
  skipped: number;
}

export interface ExtensionPairCodeResponse {
  code: string;
  expiresAt: string;
}

export interface ExtensionPairResponse {
  token: string;
}

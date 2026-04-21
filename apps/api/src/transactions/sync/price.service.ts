import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const COINGECKO_IDS: Record<number, string> = {
  1: 'ethereum',
  10: 'ethereum',
  137: 'matic-network',
  42161: 'ethereum',
  8453: 'ethereum',
  59144: 'ethereum',
};

interface CoinGeckoHistoryResponse {
  market_data?: {
    current_price?: {
      usd?: number;
    };
  };
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly cache = new Map<string, number | null>();
  private readonly currentPriceCache = new Map<string, number | null>();

  constructor(private readonly configService: ConfigService) {}

  async getUsdPrice(chainId: number, dateStr: string): Promise<number | null> {
    const coinGeckoId = COINGECKO_IDS[chainId];
    if (!coinGeckoId) {
      return null;
    }

    const cacheKey = `${coinGeckoId}:${dateStr}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) ?? null;
    }

    try {
      const date = new Date(dateStr);
      const formattedDate = `${String(date.getUTCDate()).padStart(2, '0')}-${String(
        date.getUTCMonth() + 1,
      ).padStart(2, '0')}-${date.getUTCFullYear()}`;
      const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/history?date=${formattedDate}&localization=false`;

      const apiKey = this.configService.get<string>('coingecko.apiKey');
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-cg-pro-api-key'] = apiKey;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`CoinGecko request failed with status ${res.status}`);
      }

      const data = (await res.json()) as CoinGeckoHistoryResponse;
      const price = data.market_data?.current_price?.usd ?? null;
      this.cache.set(cacheKey, price);
      return price;
    } catch (error) {
      this.logger.warn(
        `Unable to fetch USD price for chain ${chainId} on ${dateStr}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      this.cache.set(cacheKey, null);
      return null;
    }
  }

  async getCurrentUsdPrice(chainId: number): Promise<number | null> {
    const coinGeckoId = COINGECKO_IDS[chainId];
    if (!coinGeckoId) {
      return null;
    }

    const cacheKey = `current:${coinGeckoId}`;
    if (this.currentPriceCache.has(cacheKey)) {
      return this.currentPriceCache.get(cacheKey) ?? null;
    }

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`;
      const apiKey = this.configService.get<string>('coingecko.apiKey');
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-cg-pro-api-key'] = apiKey;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`CoinGecko current price request failed with status ${res.status}`);
      }

      const data = (await res.json()) as Record<string, { usd?: number } | undefined>;
      const price = data[coinGeckoId]?.usd ?? null;
      this.currentPriceCache.set(cacheKey, price);
      return price;
    } catch (error) {
      this.logger.warn(
        `Unable to fetch current USD price for chain ${chainId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      this.currentPriceCache.set(cacheKey, null);
      return null;
    }
  }
}

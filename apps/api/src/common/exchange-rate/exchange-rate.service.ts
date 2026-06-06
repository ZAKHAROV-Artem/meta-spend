import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly cache = new Map<string, { rates: Record<string, number>; fetchedAt: number }>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Returns exchange rates where 1 unit of baseCurrency = N units of foreign currency.
   * E.g. getRates('EUR') might return { EUR: 1, PLN: 4.25, USD: 1.10 }
   * To convert PLN amount to EUR: plnAmount / rates['PLN']
   */
  async getRates(baseCurrency: string): Promise<Record<string, number>> {
    const key = baseCurrency.toUpperCase();
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < this.TTL_MS) {
      return cached.rates;
    }

    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { rates: Record<string, number> };
      const rates: Record<string, number> = { [key]: 1, ...json.rates };
      this.cache.set(key, { rates, fetchedAt: Date.now() });
      return rates;
    } catch (err) {
      this.logger.warn(`FX fetch failed for ${key}: ${err instanceof Error ? err.message : err}`);
      // Return identity rate so callers degrade gracefully
      return { [key]: 1 };
    }
  }
}

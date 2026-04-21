import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type PairEntry = { userId: string; expiresAt: number };

const PAIR_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ExtensionPairCodeStore {
  private readonly map = new Map<string, PairEntry>();

  /** Allocate a unique 6-digit code bound to `userId`. */
  allocate(userId: string): { code: string; expiresAt: number } {
    this.gc();
    for (let attempt = 0; attempt < 64; attempt += 1) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      if (this.map.has(code)) continue;
      const expiresAt = Date.now() + PAIR_TTL_MS;
      this.map.set(code, { userId, expiresAt });
      return { code, expiresAt };
    }
    throw new ServiceUnavailableException('Could not allocate extension pair code');
  }

  /** Remove a code and return the user id if it was still valid. */
  consume(code: string): { userId: string } | null {
    const entry = this.map.get(code);
    this.map.delete(code);
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    return { userId: entry.userId };
  }

  private gc(): void {
    const now = Date.now();
    for (const [key, value] of this.map) {
      if (now > value.expiresAt) {
        this.map.delete(key);
      }
    }
  }
}

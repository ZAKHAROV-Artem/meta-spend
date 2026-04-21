import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

@Injectable()
export class NonceStore {
  private readonly store = new Map<string, NonceEntry>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  generate(): string {
    const nonce = randomBytes(16).toString('hex');
    this.store.set(nonce, { nonce, expiresAt: Date.now() + this.TTL_MS });
    this.cleanup();
    return nonce;
  }

  consume(nonce: string): boolean {
    const entry = this.store.get(nonce);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(nonce);
      return false;
    }
    this.store.delete(nonce);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

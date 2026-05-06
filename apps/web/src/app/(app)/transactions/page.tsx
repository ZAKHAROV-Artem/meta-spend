import type { Metadata } from 'next';
import { CardTransactionsList } from '@/components/card/CardTransactionsList';

export const metadata: Metadata = { title: 'Transactions — CryptoTrack' };

export default function TransactionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl motion-safe:scroll-smooth">
      <CardTransactionsList />
    </div>
  );
}

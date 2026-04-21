import type { Metadata } from 'next';
import { TransactionsList } from '@/components/transactions/TransactionsList';

export const metadata: Metadata = { title: 'Holdings — CryptoTrack' };

export default function HoldingsPage() {
  return (
    <div>
      <TransactionsList />
    </div>
  );
}

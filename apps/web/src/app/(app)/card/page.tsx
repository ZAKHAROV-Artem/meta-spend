import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardTransactionsList } from '@/components/card/CardTransactionsList';

export const metadata: Metadata = { title: 'MetaMask Card — CryptoTrack' };

export default function CardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spending"
        title="Card"
        description="MetaMask Card activity as a separate view of the same portfolio timeline."
      />
      <CardTransactionsList />
    </div>
  );
}

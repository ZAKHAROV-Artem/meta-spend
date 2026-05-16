import type { Metadata } from 'next';
import { CardTransactionsList } from '@/components/card/CardTransactionsList';
import type { CardTxStatus } from '@crypto-tracker/shared';

export const metadata: Metadata = { title: 'Transactions — MetaSpend' };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const status = first(params?.status) as CardTxStatus | undefined;
  const from = first(params?.from);
  const to = first(params?.to);
  const search = first(params?.search);
  const categoryIdRaw = first(params?.categoryId);
  const categoryId = categoryIdRaw
    ? categoryIdRaw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl motion-safe:scroll-smooth">
      <CardTransactionsList
        initialFilters={{
          status,
          from: from || undefined,
          to: to || undefined,
          search: search || undefined,
          categoryId: categoryId?.length ? categoryId : undefined,
        }}
      />
    </div>
  );
}

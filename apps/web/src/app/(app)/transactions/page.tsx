import type { Metadata } from 'next';
import { CardTransactionsList } from '@/components/card/CardTransactionsList';
import { PageContainer } from '@/components/layout/PageContainer';
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
  const subcategoryIdRaw = first(params?.subcategoryId);
  const subcategoryId = subcategoryIdRaw
    ? subcategoryIdRaw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  return (
    <PageContainer>
      <CardTransactionsList
        initialFilters={{
          status,
          from: from || undefined,
          to: to || undefined,
          search: search || undefined,
          categoryId: categoryId?.length ? categoryId : undefined,
          subcategoryId: subcategoryId?.length ? subcategoryId : undefined,
        }}
      />
    </PageContainer>
  );
}

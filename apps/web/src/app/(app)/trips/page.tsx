import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { TripsListView } from '@/components/trips/TripsListView';

export const metadata: Metadata = { title: 'Trips — MetaSpend' };

export default function TripsPage() {
  return (
    <PageContainer>
      <TripsListView />
    </PageContainer>
  );
}

import { PageContainer } from '@/components/layout/PageContainer';
import { TripDetailView } from '@/components/trips/TripDetailView';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer>
      <TripDetailView tripId={id} />
    </PageContainer>
  );
}

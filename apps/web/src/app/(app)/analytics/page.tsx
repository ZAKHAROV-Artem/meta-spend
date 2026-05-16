import type { Metadata } from 'next';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';

export const metadata: Metadata = { title: 'Analytics — MetaSpend' };

export default function AnalyticsPage() {
  return <AnalyticsOverview />;
}

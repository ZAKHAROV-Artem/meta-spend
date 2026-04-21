import type { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'Analytics — CryptoTrack' };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="See inflows, expenses, trends, and category mix across your MetaMask portfolio."
      />
      <AnalyticsDashboard />
    </div>
  );
}

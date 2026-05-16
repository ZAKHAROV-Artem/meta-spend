import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = { title: 'Dashboard — MetaSpend' };

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl motion-safe:scroll-smooth">
      <DashboardView />
    </div>
  );
}

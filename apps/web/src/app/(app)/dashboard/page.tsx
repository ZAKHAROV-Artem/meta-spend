import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Dashboard — CryptoTrack',
};

export default async function DashboardPage() {
  const session = await auth();
  const greeting = session?.user?.email
    ? `Welcome back, ${session.user.email.split('@')[0]}`
    : 'Welcome back';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={greeting}
        description="One MetaMask portfolio view for balance, cash flow, holdings, and card activity."
      />
      <DashboardStats />
    </div>
  );
}

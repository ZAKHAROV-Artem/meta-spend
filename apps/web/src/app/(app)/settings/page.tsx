import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'Settings — CryptoTrack' };

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control"
        title="Settings"
        description="Manage your MetaMask connection, browser extension pairing, and account access."
      />
      <div className="mx-auto max-w-3xl">
        <SettingsPanel email={session?.user?.email ?? ''} />
      </div>
    </div>
  );
}

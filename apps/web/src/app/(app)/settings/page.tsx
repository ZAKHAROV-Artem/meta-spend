import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export const metadata: Metadata = { title: 'Settings — MetaSpend' };

export default async function SettingsPage() {
  const session = await auth();
  return <SettingsPanel email={session?.user?.email ?? ''} />;
}

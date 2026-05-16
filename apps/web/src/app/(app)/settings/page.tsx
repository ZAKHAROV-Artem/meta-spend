import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export const metadata: Metadata = { title: 'Settings — MetaSpend' };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <SettingsPanel email={user?.email ?? ''} />;
}

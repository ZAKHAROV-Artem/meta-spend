import type { Metadata } from 'next';
import { RulesManager } from '@/components/rules/RulesManager';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'Rules — CryptoTrack' };

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automation"
        title="Rules"
        description="Create lightweight matching rules so recurring on-chain activity gets categorized automatically."
      />
      <RulesManager />
    </div>
  );
}

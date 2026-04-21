import type { Metadata } from 'next';
import { CategoriesManager } from '@/components/categories/CategoriesManager';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'Categories — CryptoTrack' };

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Categories"
        description="Shape the labeling system behind your reports with built-in and custom categories."
      />
      <CategoriesManager />
    </div>
  );
}

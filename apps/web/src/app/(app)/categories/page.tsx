import type { Metadata } from 'next';
import { CategoriesManager } from '@/components/categories/CategoriesManager';

export const metadata: Metadata = { title: 'Categories — MetaSpend' };

export default function CategoriesPage() {
  return (
    <div className="space-y-4">
      <CategoriesManager />
    </div>
  );
}

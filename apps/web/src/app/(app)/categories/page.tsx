import type { Metadata } from 'next';
import { CategoriesManager } from '@/components/categories/CategoriesManager';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = { title: 'Categories — MetaSpend' };

export default function CategoriesPage() {
  return (
    <PageContainer>
      <CategoriesManager />
    </PageContainer>
  );
}

import type { Metadata } from 'next';
import { CategorizeSpendingsPage } from '@/components/categories/CategorizeSpendingsPage';

export const metadata: Metadata = { title: 'Categorize Spendings — MetaSpend' };

export default function CategoriesCategorizePage() {
  return <CategorizeSpendingsPage />;
}

import { useApiQuery, useApiMutation } from './useApi';
import type { Category, CreateCategoryDto } from '@crypto-tracker/shared';

export function useCategories() {
  return useApiQuery<Category[]>('/categories');
}

export function useCreateCategory() {
  return useApiMutation<Category, CreateCategoryDto>('POST', '/categories', ['/categories']);
}

export function useDeleteCategory() {
  return useApiMutation<void, string>('DELETE', (id) => `/categories/${id}`, ['/categories']);
}

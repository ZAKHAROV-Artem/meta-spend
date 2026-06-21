import { useApiQuery, useApiMutation } from './useApi';
import type { Category, CreateCategoryDto } from '@metaspend/shared';

export function useCategories() {
  return useApiQuery<Category[]>('/categories');
}

export function useCreateCategory() {
  return useApiMutation<Category, CreateCategoryDto>('POST', '/categories', ['/categories']);
}

export function useCreateDefaultCategories() {
  return useApiMutation<Category[], void>('POST', '/categories/defaults', ['/categories']);
}

export function useSeedDefaultCategories() {
  return useApiMutation<Category[], undefined>('POST', '/categories/seed-defaults', ['/categories']);
}

export function useSeedDefaultSubcategories() {
  return useApiMutation<Category[], undefined>('POST', '/categories/default-subcategories', ['/categories']);
}

export function useDeleteCategory() {
  return useApiMutation<void, string>('DELETE', (id) => `/categories/${id}`, ['/categories']);
}

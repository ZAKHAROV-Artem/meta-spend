'use client';
import { useApiQuery, useApiMutation } from './useApi';
import type { AuthUser } from '@crypto-tracker/shared';

export function useCurrentUser() {
  return useApiQuery<AuthUser>('/auth/me');
}

export function useUpdateUserPreferences() {
  return useApiMutation<AuthUser, { defaultCurrency?: string | null }>(
    'PATCH',
    '/auth/me',
    ['/auth/me'],
  );
}

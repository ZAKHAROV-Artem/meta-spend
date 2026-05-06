'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BulkCategorizeResult, UniqueMerchant } from '@crypto-tracker/shared';
import { useAccessToken, useApiQuery } from './useApi';

const API_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1`;

async function getErrorMessage(res: Response) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? `API error ${res.status}`;
}

export function useCardMerchants() {
  return useApiQuery<UniqueMerchant[]>('/transactions/card-merchants');
}

export function useUpdateCardMerchantCategory() {
  const token = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { key: string; categoryId: string | null }) => {
      if (!token) throw new Error('Not signed in');
      const res = await fetch(`${API_URL}/transactions/card-merchants/${encodeURIComponent(vars.key)}/category`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId: vars.categoryId }),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      return res.json() as Promise<BulkCategorizeResult>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['/transactions/card-merchants'] });
      void queryClient.invalidateQueries({ queryKey: ['/transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['/transactions/stats'] });
      void queryClient.invalidateQueries({ queryKey: ['/categories'] });
      void queryClient.invalidateQueries({ queryKey: ['/transactions/categorization-runs'] });
    },
  });
}

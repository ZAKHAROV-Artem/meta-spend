'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccessToken } from './useApi';

const API_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1`;

export type UpdateCardTransactionInput = {
  categoryId?: string | null;
  subcategoryId?: string | null;
  notes?: string | null;
};

async function getErrorMessage(res: Response) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? `API error ${res.status}`;
}

export function useUpdateCardTransaction() {
  const token = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { id: string; body: UpdateCardTransactionInput }) => {
      if (!token) throw new Error('Not signed in');
      const res = await fetch(`${API_URL}/transactions/${vars.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vars.body),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['/transactions'] });
    },
  });
}

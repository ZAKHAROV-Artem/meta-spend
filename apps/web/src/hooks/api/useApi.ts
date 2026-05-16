'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1`;

export function useAccessToken() {
  const [token, setToken] = useState<string | undefined>();
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setToken(data.session?.access_token);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  return token;
}

async function getErrorMessage(res: Response) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? `API error ${res.status}`;
}

async function getFreshToken(): Promise<string | undefined> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export function useApiQuery<T>(
  path: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  const token = useAccessToken();
  const router = useRouter();
  const basePath = path.split('?')[0] ?? path;
  return useQuery<T>({
    queryKey: [basePath, path],
    queryFn: async () => {
      const accessToken = token ?? (await getFreshToken());
      if (!accessToken) {
        router.push('/auth/login');
        throw new Error('Not authenticated');
      }
      const res = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const message = await getErrorMessage(res);
        if (res.status === 401) {
          router.push('/auth/login');
        }
        throw new Error(message);
      }
      return res.json() as Promise<T>;
    },
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string | ((vars: TVariables) => string),
  invalidateKeys?: string[],
  callbacks?: { onSuccess?: (data: TData) => void; onError?: (error: Error) => void },
) {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const accessToken = token ?? (await getFreshToken());
      if (!accessToken) {
        router.push('/auth/login');
        throw new Error('Not authenticated');
      }
      const url = typeof path === 'function' ? path(variables) : path;
      const hasJsonBody = method !== 'DELETE' && variables !== undefined;
      const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
      if (hasJsonBody) headers['Content-Type'] = 'application/json';
      const res = await fetch(`${API_URL}${url}`, {
        method,
        headers,
        body: hasJsonBody ? JSON.stringify(variables) : undefined,
      });
      if (!res.ok && res.status !== 204) {
        const message = await getErrorMessage(res);
        if (res.status === 401) router.push('/auth/login');
        throw new Error(message);
      }
      if (res.status === 204) return undefined as TData;
      return res.json() as Promise<TData>;
    },
    onSuccess: (data) => {
      invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      callbacks?.onSuccess?.(data);
    },
    onError: callbacks?.onError,
  });
}

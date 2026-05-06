'use client';

import { getSession, signOut, useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

const API_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1`;
let hasTriggeredUnauthorizedSignOut = false;

export function useAccessToken() {
  const { data: session } = useSession();
  return (session as Record<string, unknown> | null)?.['accessToken'] as string | undefined;
}

function extractAccessToken(session: unknown): string | undefined {
  return (session as Record<string, unknown> | null)?.['accessToken'] as string | undefined;
}

async function getErrorMessage(res: Response) {
  const body = await res.json().catch(() => null) as { message?: string } | null;
  if (res.status === 401) {
    return body?.message ?? 'Your session expired. Please sign in again.';
  }

  return body?.message ?? `API error ${res.status}`;
}

async function handleUnauthorized() {
  if (hasTriggeredUnauthorizedSignOut) {
    return;
  }

  hasTriggeredUnauthorizedSignOut = true;
  await signOut({ callbackUrl: '/login' });
}

async function getSettledAccessToken(currentToken: string | undefined): Promise<string> {
  if (currentToken) return currentToken;

  const session = await getSession();
  const refreshedToken = extractAccessToken(session);
  if (refreshedToken) return refreshedToken;

  await handleUnauthorized();
  throw new Error('Your session expired. Please sign in again.');
}

export function useApiQuery<T>(
  path: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  const token = useAccessToken();
  const basePath = path.split('?')[0] ?? path;
  return useQuery<T>({
    queryKey: [basePath, path, token],
    queryFn: async () => {
      const res = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const message = await getErrorMessage(res);
        if (res.status === 401) {
          await handleUnauthorized();
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
  callbacks?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  },
) {
  const token = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const accessToken = await getSettledAccessToken(token);

      const url = typeof path === 'function' ? path(variables) : path;
      const hasJsonBody = method !== 'DELETE' && variables !== undefined;
      const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
      if (hasJsonBody) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_URL}${url}`, {
        method,
        headers,
        body: hasJsonBody ? JSON.stringify(variables) : undefined,
      });
      if (!res.ok && res.status !== 204) {
        const message = await getErrorMessage(res);
        if (res.status === 401) {
          await handleUnauthorized();
        }
        throw new Error(message);
      }
      if (res.status === 204) return undefined as TData;
      return res.json() as Promise<TData>;
    },
    onSuccess: (data) => {
      invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      callbacks?.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

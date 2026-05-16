'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import {
  getAccessToken,
  getRefreshToken,
  setSession,
  clearSession,
  type StoredUser,
} from '@/lib/auth'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'
const BASE_PATH = '/api/v1'

// Refresh the access token using the stored refresh token.
// Returns the new access token or null if refresh failed.
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    const res = await fetch(`${API_URL}${BASE_PATH}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    setSession(data.accessToken, data.refreshToken, data.user as StoredUser)
    return data.accessToken as string
  } catch {
    return null
  }
}

// Core fetch wrapper: attaches Bearer token, handles 401 → refresh → retry once.
async function apiFetch(
  path: string,
  options: RequestInit = {},
  onUnauthorized: () => void,
): Promise<Response> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${API_URL}${BASE_PATH}${path}`, { ...options, headers })

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (!newToken) {
      clearSession()
      onUnauthorized()
      return res
    }
    const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
    return fetch(`${API_URL}${BASE_PATH}${path}`, { ...options, headers: retryHeaders })
  }

  return res
}

async function getErrorMessage(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? `API error ${res.status}`
}

// Hook: provides the current access token (updates when localStorage changes across tabs).
export function useAccessToken(): string | null {
  const [token, setToken] = useState<string | null>(() => getAccessToken())

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ms_access_token') setToken(e.newValue)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return token
}

// Hook: useApiQuery — wraps useQuery with auto auth + error handling.
export function useApiQuery<T>(
  path: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  const router = useRouter()
  const onUnauthorized = useCallback(() => router.push('/auth/login'), [router])
  const basePath = path.split('?')[0] ?? path

  return useQuery<T>({
    queryKey: [basePath, path],
    queryFn: async () => {
      const res = await apiFetch(path, {}, onUnauthorized)
      if (!res.ok) {
        const message = await getErrorMessage(res)
        throw new Error(message)
      }
      return res.json() as Promise<T>
    },
    ...options,
  })
}

// Hook: useApiMutation — wraps useMutation with auto auth + invalidation + callbacks.
export function useApiMutation<TData, TVariables>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string | ((vars: TVariables) => string),
  invalidateKeys?: string[],
  callbacks?: { onSuccess?: (data: TData) => void; onError?: (error: Error) => void },
) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const onUnauthorized = useCallback(() => router.push('/auth/login'), [router])

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const url = typeof path === 'function' ? path(variables) : path
      const hasJsonBody = method !== 'DELETE' && variables !== undefined
      const fetchOptions: RequestInit = { method }
      if (hasJsonBody) {
        fetchOptions.body = JSON.stringify(variables)
      }
      // Override Content-Type for non-JSON DELETE requests
      const res = await apiFetch(url, fetchOptions, onUnauthorized)
      if (!res.ok && res.status !== 204) {
        const message = await getErrorMessage(res)
        throw new Error(message)
      }
      if (res.status === 204) return undefined as TData
      return res.json() as Promise<TData>
    },
    onSuccess: (data) => {
      invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      callbacks?.onSuccess?.(data)
    },
    onError: callbacks?.onError,
  })
}

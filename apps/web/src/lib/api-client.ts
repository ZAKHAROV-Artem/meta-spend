import type { AuthResponse, AuthUser, RegisterDto } from '@crypto-tracker/shared';

const BASE_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/v1`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
    throw new Error(error.message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  auth: {
    register: (data: RegisterDto) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: (token: string) =>
      request<AuthUser>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },
};

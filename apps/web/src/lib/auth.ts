import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { LoginSchema } from '@crypto-tracker/shared';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function callApi<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

type ApiAuthResponse = {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

function getAccessTokenExpiresAt(accessToken: string): number {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) {
      return Date.now() + 14 * 60 * 1000;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return decoded.exp ? decoded.exp * 1000 : Date.now() + 14 * 60 * 1000;
  } catch {
    return Date.now() + 14 * 60 * 1000;
  }
}

async function refreshAccessToken(token: Record<string, unknown>) {
  const refreshToken = token['refreshToken'];
  if (typeof refreshToken !== 'string' || !refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  const refreshed = await callApi<RefreshResponse>('/auth/refresh', { refreshToken });
  if (!refreshed) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  return {
    ...token,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    accessTokenExpiresAt: getAccessTokenExpiresAt(refreshed.accessToken),
    error: undefined,
  };
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const data = await callApi<ApiAuthResponse>('/auth/login', parsed.data);
        if (!data) return null;
        return {
          id: data.user.id,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
    Credentials({
      id: 'siwe',
      async authorize(credentials) {
        const { message, signature } = credentials as { message: string; signature: string };
        if (!message || !signature) return null;
        const data = await callApi<ApiAuthResponse>('/auth/siwe/verify', { message, signature });
        if (!data) return null;
        return {
          id: data.user.id,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token['id'] = user.id;
        token['accessToken'] = (user as Record<string, unknown>)['accessToken'];
        token['refreshToken'] = (user as Record<string, unknown>)['refreshToken'];
        token['accessTokenExpiresAt'] = getAccessTokenExpiresAt(
          (user as Record<string, unknown>)['accessToken'] as string,
        );
        token['error'] = undefined;
      }

      const accessToken = token['accessToken'];
      const accessTokenExpiresAt = token['accessTokenExpiresAt'];

      if (typeof accessToken === 'string' && typeof accessTokenExpiresAt === 'number') {
        if (Date.now() < accessTokenExpiresAt - 30_000) {
          return token;
        }

        return refreshAccessToken(token);
      }

      return token;
    },
    session({ session, token }) {
      if (token['id']) session.user.id = token['id'] as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any)['accessToken'] = token['accessToken'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any)['error'] = token['error'];
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});

'use client';

import { useEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { signOut, useSession } from 'next-auth/react';

function SessionHealth() {
  const { data: session, status } = useSession();
  const sessionError = (session as Record<string, unknown> | null)?.['error'];

  useEffect(() => {
    if (status === 'authenticated' && sessionError === 'RefreshAccessTokenError') {
      void signOut({ callbackUrl: '/login' });
    }
  }, [sessionError, status]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
      <SessionHealth />
      {children}
    </NextAuthSessionProvider>
  );
}

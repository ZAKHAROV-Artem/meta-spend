'use client';

import { SessionProvider } from './SessionProvider';
import { QueryProvider } from './QueryProvider';
import { WagmiProvider } from './WagmiProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <WagmiProvider>
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </QueryProvider>
        </WagmiProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

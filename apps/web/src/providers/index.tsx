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
        <QueryProvider>
          <WagmiProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </WagmiProvider>
        </QueryProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

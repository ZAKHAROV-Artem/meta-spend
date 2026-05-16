'use client';

import { QueryProvider } from './QueryProvider';
import { WagmiProvider } from './WagmiProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WagmiProvider>
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </QueryProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

import type { Metadata } from 'next';
import { Providers } from '@/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CryptoTrack — Crypto Expense Tracker',
  description:
    'Turn your crypto wallet activity into clean financial reports. Track expenses, categorize transactions, and analyze spending — just like a bank app, but for Web3.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Providers } from '@/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaSpend — MetaMask Card Transaction Visualizer',
  description:
    'Beautifully visualize your MetaMask Card spending. Track purchases, analyze categories, and understand where your crypto goes — in real time.',
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

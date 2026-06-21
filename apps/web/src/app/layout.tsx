import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaSpend — MetaMask Card Transaction Visualizer',
  description:
    'Beautifully visualize your MetaMask Card spending. Track purchases, analyze categories, and understand where your crypto goes — in real time.',
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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

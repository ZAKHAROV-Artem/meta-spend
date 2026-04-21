import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AutoConnectPortfolio } from '@/components/wallet/AutoConnectPortfolio';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen p-3 md:p-4">
      <AutoConnectPortfolio />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_28%)]" />
      <div className="relative flex min-h-[calc(100vh-1.5rem)] gap-4 md:min-h-[calc(100vh-2rem)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar />
          <main className="flex-1 rounded-[2rem] border border-border/70 bg-surface/80 p-4 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

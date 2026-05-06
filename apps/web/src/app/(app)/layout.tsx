import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen px-4 py-4 md:px-5 md:py-5">
      <div className="relative flex min-h-[calc(100vh-2rem)] gap-4 md:min-h-[calc(100vh-2.5rem)] md:gap-5">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar />
          <main className="flex-1 rounded-lg border border-border bg-surface p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

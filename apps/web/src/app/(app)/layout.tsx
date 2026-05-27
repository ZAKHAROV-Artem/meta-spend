import { MobileNavTrigger } from '@/components/layout/MobileNavTrigger';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen px-4 py-4 md:px-5 md:py-5">
      <div className="relative flex min-h-[calc(100vh-2rem)] gap-4 md:min-h-[calc(100vh-2.5rem)] md:gap-5">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-3 flex items-center md:hidden">
            <MobileNavTrigger />
          </div>
          <main className="flex-1 rounded-2xl border border-border bg-surface p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

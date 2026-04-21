'use client';

import Link from 'next/link';
import { PanelLeftClose, Zap } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { useUiStore } from '@/store/ui.store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const closeMobileNav = useUiStore((s) => s.closeMobileNav);

  return (
    <TooltipProvider delayDuration={100}>
      <>
        <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-20 shrink-0 md:block">
          <div className="flex h-full flex-col rounded-[2rem] border border-sidebar-border bg-sidebar-background px-3 py-4 text-sidebar-foreground shadow-[0_28px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex justify-center">
              <Link href="/dashboard" className="group flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-sidebar-border bg-sidebar-accent/70 text-sidebar-foreground transition hover:border-primary/40 hover:text-primary">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] bg-primary/14 ring-1 ring-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </Link>
            </div>
            <SidebarNav />
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-background/45 backdrop-blur-sm"
              onClick={closeMobileNav}
            />
            <aside className="absolute inset-y-3 left-3 flex w-[18rem] flex-col rounded-[2rem] border border-sidebar-border bg-sidebar-background p-4 text-sidebar-foreground shadow-[0_28px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <Link href="/dashboard" onClick={closeMobileNav} className="flex items-center gap-3 font-semibold">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/14 ring-1 ring-primary/20">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">CryptoTrack</p>
                    <p className="text-xs text-sidebar-muted-foreground">Finance cockpit</p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={closeMobileNav}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <SidebarNav mobile onNavigate={closeMobileNav} />
            </aside>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}

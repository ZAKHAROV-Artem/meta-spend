'use client';

import Link from 'next/link';
import { PanelLeftClose, WalletCards } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { SidebarAccountMenu } from './SidebarAccountMenu';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useUiStore } from '@/store/ui.store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const closeMobileNav = useUiStore((s) => s.closeMobileNav);

  return (
    <TooltipProvider delayDuration={100}>
      <>
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[4.5rem] shrink-0 md:block md:top-5 md:h-[calc(100vh-2.5rem)]">
          <div className="flex h-full flex-col rounded-2xl border border-sidebar-border bg-sidebar-background px-2.5 py-4 text-sidebar-foreground">
            <div className="mb-3 flex justify-center">
              <Link href="/dashboard" className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-sidebar-border bg-sidebar-accent/70 text-sidebar-foreground transition hover:border-primary/40 hover:text-primary">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <WalletCards className="h-4 w-4 text-primary" />
                </div>
              </Link>
            </div>
            <SidebarNav />
            <div className="mt-auto flex flex-col items-center gap-2 border-t border-sidebar-border pt-3">
              <ThemeSwitcher variant="sidebar" />
              <SidebarAccountMenu />
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <Button
              type="button"
              variant="ghost"
              aria-label="Close navigation"
              className="absolute inset-0 h-full w-full rounded-none bg-background/45 hover:bg-background/45"
              onClick={closeMobileNav}
            />
            <aside className="absolute inset-y-4 left-4 flex w-[18rem] flex-col rounded-2xl border border-sidebar-border bg-sidebar-background p-4 text-sidebar-foreground">
              <div className="mb-5 flex items-center justify-between">
                <Link href="/dashboard" onClick={closeMobileNav} className="flex items-center gap-3 font-semibold">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <WalletCards className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">MetaSpend</p>
                    <p className="text-xs text-sidebar-muted-foreground">MetaMask Card</p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon-sm" className="rounded-lg" onClick={closeMobileNav}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <SidebarNav mobile onNavigate={closeMobileNav} />
              <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border pt-4">
                <ThemeSwitcher variant="sidebar" className="w-full flex-row justify-center" />
                <SidebarAccountMenu mobile />
              </div>
            </aside>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}

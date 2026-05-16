'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { ThemeSwitcher } from './ThemeSwitcher';

const PAGE_LABELS: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Overview and recent activity' },
  '/transactions': { title: 'Transactions', description: 'MetaMask Card activity' },
  '/analytics': { title: 'Analytics', description: 'Spend trends and categories' },
  '/categories': { title: 'Categories', description: 'Labels for card spend' },
  '/settings': { title: 'Settings', description: 'Account, wallet, and extension' },
};

export function TopBar() {
  const openMobileNav = useUiStore((s) => s.openMobileNav);
  const pathname = usePathname();

  const pageInfo =
    Object.entries(PAGE_LABELS).find(([key]) => pathname === key || pathname.startsWith(`${key}/`))?.[1] ??
    PAGE_LABELS['/transactions'];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 md:px-5 md:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={openMobileNav}
          className="shrink-0 rounded-full md:hidden"
          type="button"
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground md:text-base">{pageInfo.title}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{pageInfo.description}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <ThemeSwitcher />
      </div>
    </header>
  );
}

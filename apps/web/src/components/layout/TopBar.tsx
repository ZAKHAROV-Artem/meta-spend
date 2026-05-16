'use client';

import { useEffect, useState } from 'react';
import { Menu, Settings, UserCircle, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUiStore } from '@/store/ui.store';
import { ThemeSwitcher } from './ThemeSwitcher';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const PAGE_LABELS: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Overview and recent activity' },
  '/transactions': { title: 'Transactions', description: 'MetaMask Card activity' },
  '/analytics': { title: 'Analytics', description: 'Spend trends and categories' },
  '/categories': { title: 'Categories', description: 'Labels for card spend' },
  '/settings': { title: 'Settings', description: 'Account, wallet, and extension' },
};

function getAvatarLabel(user: User | null): string {
  if (!user) return '?';
  if (user.email) return user.email[0]!.toUpperCase();
  const wallet = user.user_metadata?.wallet_address as string | undefined;
  if (wallet) return wallet[0]!.toUpperCase();
  return '?';
}

function getUserDisplayLabel(user: User | null): string {
  if (!user) return '';
  if (user.email) return user.email;
  const wallet = user.user_metadata?.wallet_address as string | undefined;
  if (wallet && wallet.length > 10) {
    return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
  }
  return wallet ?? '';
}

export function TopBar() {
  const openMobileNav = useUiStore((s) => s.openMobileNav);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient().auth.getUser().then(({ data }) => {
      if (!cancelled) setUser(data.user ?? null);
    });
    return () => { cancelled = true; };
  }, []);

  const pageInfo =
    Object.entries(PAGE_LABELS).find(([key]) => pathname === key || pathname.startsWith(`${key}/`))?.[1] ??
    PAGE_LABELS['/transactions'];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 md:px-5 md:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={openMobileNav}
          className="shrink-0 rounded-full md:hidden"
          type="button"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground md:text-base">{pageInfo.title}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{pageInfo.description}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full" type="button" aria-label="User menu">
              {user ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getAvatarLabel(user)}
                </span>
              ) : (
                <UserCircle className="size-5 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {getUserDisplayLabel(user) ? (
              <>
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {getUserDisplayLabel(user)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

'use client';

import { Menu, LogOut, Settings } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUiStore } from '@/store/ui.store';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { ThemeSwitcher } from './ThemeSwitcher';

const PAGE_LABELS: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Your MetaMask portfolio in one banking-style view' },
  '/holdings': { title: 'Holdings', description: 'Grouped on-chain activity and current crypto balances' },
  '/card': { title: 'Card', description: 'MetaMask Card spending, refunds, and merchant activity' },
  '/analytics': { title: 'Analytics', description: 'Trends, totals, and category movement across your portfolio' },
  '/categories': { title: 'Categories', description: 'Organize activity with your own labels' },
  '/rules': { title: 'Rules', description: 'Automate categorization with matching logic' },
  '/settings': { title: 'Settings', description: 'Manage MetaMask connection, extension access, and account details' },
};

export function TopBar() {
  const openMobileNav = useUiStore((s) => s.openMobileNav);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const email = session?.user?.email ?? '';
  const initials = email[0]?.toUpperCase() ?? 'U';
  const pageInfo =
    Object.entries(PAGE_LABELS).find(([key]) => pathname === key || pathname.startsWith(`${key}/`))?.[1] ??
    PAGE_LABELS['/dashboard'];

  return (
    <header className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-border/70 bg-floating/85 px-4 py-3 shadow-[0_22px_56px_-30px_rgba(15,23,42,0.38)] backdrop-blur-xl md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={openMobileNav}
          className="rounded-full md:hidden"
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-primary/80">
            Workspace
          </p>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground md:text-base">
              {pageInfo.title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {pageInfo.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto">
        <ThemeSwitcher />
        <ConnectWalletButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full border border-border/70 bg-background/60">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary ring-1 ring-primary/25">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {email || 'Wallet account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-destructive focus:text-destructive"
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

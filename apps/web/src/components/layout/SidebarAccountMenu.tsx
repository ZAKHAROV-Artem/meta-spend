'use client';

import { useEffect, useState } from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clearSession, getStoredUser, type StoredUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

function getAvatarLabel(user: StoredUser | null): string {
  if (!user) return '?';
  if (user.email) return user.email[0]!.toUpperCase();
  return '?';
}

function getUserDisplayLabel(user: StoredUser | null): string {
  if (!user) return '';
  return user.displayName ?? user.email ?? '';
}

export function SidebarAccountMenu({
  mobile = false,
  className,
}: {
  mobile?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ms_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSignOut = () => {
    clearSession();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={mobile ? 'default' : 'icon-sm'}
          className={cn(
            mobile
              ? 'h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5'
              : 'h-11 w-11 rounded-xl',
            className,
          )}
          type="button"
          aria-label="User menu"
        >
          {user ? (
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
                mobile ? 'h-9 w-9 text-sm' : 'h-8 w-8 text-xs',
              )}
            >
              {getAvatarLabel(user)}
            </span>
          ) : (
            <UserCircle className={cn('text-muted-foreground', mobile ? 'size-5' : 'size-5')} />
          )}
          {mobile ? (
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {getUserDisplayLabel(user) || 'Account'}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={mobile ? 'start' : 'end'} side={mobile ? 'top' : 'right'} className="w-52">
        {getUserDisplayLabel(user) ? (
          <>
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
              {getUserDisplayLabel(user)}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className="flex cursor-pointer items-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

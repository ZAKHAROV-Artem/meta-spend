'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditCard, LayoutDashboard, Plane, Settings, Tag } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/trips', label: 'Trips', icon: Plane },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  mobile,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 text-sm font-medium transition-all duration-150',
        mobile
          ? 'rounded-xl border border-transparent px-4 py-3'
          : 'h-11 w-11 justify-center rounded-xl border border-transparent',
        active
          ? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
      )}
    >
      <Icon className={cn('shrink-0', active ? 'text-primary h-4 w-4' : 'h-4 w-4')} />
      {(mobile || !collapsed) && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed && !mobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function SidebarNav({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const collapsed = !mobile;

  return (
    <nav className={cn('flex flex-1 flex-col space-y-2', mobile ? '' : 'items-center')}>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          collapsed={collapsed}
          mobile={mobile}
          onNavigate={onNavigate}
          active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
        />
      ))}
    </nav>
  );
}

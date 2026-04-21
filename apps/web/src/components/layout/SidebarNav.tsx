'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Tag,
  Zap,
  Settings,
  CreditCard,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/holdings', label: 'Holdings', icon: ArrowLeftRight },
  { href: '/card', label: 'Card', icon: CreditCard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/rules', label: 'Rules', icon: Zap },
];

const BOTTOM_ITEMS = [
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
          ? 'rounded-[1.4rem] border border-transparent px-4 py-3'
          : 'h-12 w-12 justify-center rounded-[1.2rem] border border-transparent',
        active
          ? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_14px_34px_-20px_rgba(15,23,42,0.45)]'
          : 'text-sidebar-muted-foreground hover:border-sidebar-border/70 hover:bg-sidebar-accent/72 hover:text-sidebar-foreground',
      )}
    >
      <Icon className={cn('shrink-0', active ? 'h-4 w-4 text-primary' : 'h-4 w-4')} />
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
    <div className={cn('flex flex-1 flex-col justify-between', mobile ? 'py-4' : 'py-3')}>
      <nav className={cn('space-y-2', mobile ? '' : 'px-1')}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            mobile={mobile}
            onNavigate={onNavigate}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>
      <nav className={cn('space-y-2', mobile ? '' : 'px-1')}>
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            mobile={mobile}
            onNavigate={onNavigate}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </div>
  );
}

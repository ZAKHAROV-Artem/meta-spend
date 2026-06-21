'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeSwitcher({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'sidebar';
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSidebar = variant === 'sidebar';

  return (
    <div
      className={cn(
        'flex gap-1 p-1',
        isSidebar
          ? 'flex-col rounded-xl border border-sidebar-border bg-sidebar-accent/50'
          : 'flex-row items-center rounded-full border border-border/70 bg-muted/55',
        className,
      )}
    >
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;

        return (
          <Button
            key={value}
            type="button"
            variant="ghost"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              'p-0 transition-all',
              isSidebar ? 'h-9 w-9 rounded-lg' : 'size-8 rounded-full',
              isSidebar
                ? 'text-sidebar-muted-foreground hover:text-sidebar-foreground'
                : 'text-muted-foreground hover:text-foreground',
              active &&
                (isSidebar
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border'
                  : 'bg-background text-foreground ring-1 ring-border/80'),
            )}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}

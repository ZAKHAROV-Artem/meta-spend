'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui.store';

export function MobileNavTrigger() {
  const openMobileNav = useUiStore((s) => s.openMobileNav);

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={openMobileNav}
      className="shrink-0 rounded-full md:hidden"
      type="button"
      aria-label="Open navigation"
    >
      <Menu className="size-4" />
    </Button>
  );
}

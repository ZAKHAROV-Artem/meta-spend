'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          🦊 MetaSpend
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-foreground/70 hover:text-foreground">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="bg-[#F6851B] text-white hover:bg-[#E2761B] border-0 shadow-md shadow-orange-500/20"
          >
            <Link href="/auth/login">Get started free</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

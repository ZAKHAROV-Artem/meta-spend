'use client';

import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const chips = [
  {
    label: 'This month',
    value: '$648.20',
    position: 'absolute -top-4 -right-4',
  },
  {
    label: 'Top category',
    value: '🍕 Food & Dining',
    position: 'absolute -bottom-4 -left-4',
  },
] as const;

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* SVG atmospheric background */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blob-orange" cx="80%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#F6851B" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F6851B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob-amber" cx="20%" cy="90%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#blob-orange)" />
        <rect width="100%" height="100%" fill="url(#blob-amber)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left: animated text content */}
          <motion.div
            className="flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                ✦ Now in beta
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Smart analytics for your{' '}
              <span className="text-primary">MetaMask Card</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Track every spend, categorize automatically, understand your habits.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="gap-2 border-0 bg-[#F6851B] text-base text-white shadow-lg shadow-orange-500/30 hover:bg-[#E2761B]"
              >
                <Link href="/auth/login">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: animated card widget */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Orange glow behind card */}
              <div className="absolute inset-0 scale-105 rounded-3xl bg-primary opacity-20 blur-3xl" />

              {/* Entrance animation wrapper */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              >
                {/* Float animation wrapper */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  {/* Main card */}
                  <div className="relative rounded-2xl bg-[#1a0d00] p-5 text-white shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-orange-300/70">
                          MetaMask
                        </p>
                        <p className="mt-0.5 text-base font-bold">Card</p>
                      </div>
                      <span className="text-2xl">🦊</span>
                    </div>

                    <div className="mb-2">
                      <p className="mb-1 text-xs uppercase tracking-widest text-orange-200/50">
                        Balance
                      </p>
                      <p className="text-3xl font-bold tracking-tight">$2,847.50</p>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="font-mono text-xs tracking-wider text-orange-200/50">
                        0x71C7…9e2B
                      </p>
                    </div>

                    {/* Floating chips */}
                    {chips.map((chip, index) => (
                      <motion.div
                        key={chip.label}
                        className={`${chip.position} rounded-xl bg-card px-3 py-2 shadow-lg`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.8 + index * 0.15,
                          duration: 0.4,
                          ease: 'easeOut',
                        }}
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {chip.label}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-foreground">
                          {chip.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

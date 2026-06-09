'use client';

import Link from 'next/link';
import { motion, type Variants, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const TRANSACTIONS = [
  { icon: '☕', label: 'Blue Bottle Coffee', category: 'Food & Drink', amount: '-$4.20', color: 'bg-amber-500' },
  { icon: '🛒', label: 'Whole Foods Market', category: 'Groceries', amount: '-$67.84', color: 'bg-green-500' },
  { icon: '⛽', label: 'Shell Gas Station', category: 'Transport', amount: '-$55.00', color: 'bg-blue-500' },
];

export function HeroSection() {
  const shouldFloat = !useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden bg-background" style={{ minHeight: '92vh' }}>
      {/* Layered atmospheric background */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="hg-1" cx="75%" cy="15%" r="55%">
            <stop offset="0%" stopColor="#F6851B" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#F6851B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hg-2" cx="10%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hg-3" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#F6851B" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#F6851B" stopOpacity="0" />
          </radialGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#hg-1)" />
        <rect width="100%" height="100%" fill="url(#hg-2)" />
        <rect width="100%" height="100%" fill="url(#hg-3)" />
        {/* Noise overlay */}
        <rect width="100%" height="100%" fill="transparent" filter="url(#noise)" opacity="0.025" />
      </svg>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 sm:py-32 lg:min-h-[92vh] lg:flex-row lg:gap-16 lg:py-0">
        {/* Left: text content */}
        <motion.div
          className="flex flex-col items-start lg:flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Beta badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3 w-3" />
              Now in open beta
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="mt-6 font-display text-5xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]"
          >
            Smart analytics
            <br />
            for your{' '}
            <span
              className="inline-block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #F6851B 0%, #F59E0B 50%, #F6851B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
              }}
            >
              MetaMask Card
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Track every spend, auto-categorize with AI, and understand your habits — all from a Chrome extension that syncs in real time.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-2 border-0 bg-[#F6851B] text-base text-white shadow-xl shadow-orange-500/25 hover:bg-[#E2761B]"
            >
              <Link href="/auth/login">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {['500K+ transactions tracked', 'Real-time sync', 'Free forever'].map((stat, i) => (
              <span key={stat} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">·</span>}
                <span>{stat}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: card mockup */}
        <div className="relative mt-14 flex w-full justify-center lg:mt-0 lg:flex-1 lg:justify-end">
          <div className="relative w-full max-w-[360px]">
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl"
              style={{ background: '#F6851B', opacity: 0.18, transform: 'scale(1.1)' }}
            />

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.75, delay: 0.25, ease: 'easeOut' }}
            >
              <motion.div
                animate={shouldFloat ? { y: [0, -10, 0] } : undefined}
                transition={shouldFloat ? { repeat: Infinity, duration: 5, ease: 'easeInOut' } : undefined}
                className="relative"
              >
                {/* MetaMask card */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1a0d00] p-5 text-white shadow-2xl">
                  {/* Card top */}
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-300/60">MetaMask</p>
                      <p className="mt-0.5 text-base font-bold">Card</p>
                    </div>
                    <span className="text-3xl">🦊</span>
                  </div>

                  {/* Balance */}
                  <div className="mb-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-orange-200/40">Available balance</p>
                    <p className="font-mono-alt mt-1 text-3xl font-bold tracking-tight">$2,847.50</p>
                  </div>

                  {/* Address */}
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="font-mono-alt text-[10px] tracking-wider text-orange-200/40">0x71C7…9e2B</p>
                  </div>

                  {/* Transaction list */}
                  <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-300/50">
                      Recent
                    </p>
                    {TRANSACTIONS.map((tx) => (
                      <div key={tx.label} className="flex items-center gap-2.5">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tx.color}/20 text-xs`}>
                          {tx.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-white/90">{tx.label}</p>
                          <p className="text-[10px] text-white/40">{tx.category}</p>
                        </div>
                        <p className="font-mono-alt text-xs font-semibold text-orange-200/80">{tx.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating chips */}
                <motion.div
                  className="absolute -top-5 -right-5 rounded-2xl bg-card px-3.5 py-2.5 shadow-xl ring-1 ring-border/60"
                  initial={{ opacity: 0, scale: 0.75, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.45, ease: 'easeOut' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">This month</p>
                  <p className="font-mono-alt mt-0.5 text-lg font-bold text-foreground">$648.20</p>
                </motion.div>

                <motion.div
                  className="absolute -bottom-5 -left-5 rounded-2xl bg-card px-3.5 py-2.5 shadow-xl ring-1 ring-border/60"
                  initial={{ opacity: 0, scale: 0.75, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.45, ease: 'easeOut' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top category</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">🍕 Food & Dining</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

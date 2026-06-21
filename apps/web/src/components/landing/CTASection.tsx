'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Chrome } from 'lucide-react';
import { FoxMark } from '@/components/brand/FoxMark';

export function CTASection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-28" style={{ background: '#1a0d00' }}>
      {/* Pulsing radial gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(246,133,27,0.18) 0%, transparent 70%)',
        }}
        animate={reduced ? {} : {
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.05, 1],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      />

      {/* Decorative fox — oversized, blurred, background */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <FoxMark
          className="h-[28rem] w-[28rem] opacity-[0.04] blur-sm"
          style={{ filter: 'blur(2px) saturate(0)' }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <span className="mb-4 inline-block font-mono-alt text-xs font-semibold uppercase tracking-[0.2em] text-orange-400/70">
            Ready to start?
          </span>
          <h2 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Know where your
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #F6851B 0%, #F59E0B 60%, #F6851B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
              }}
            >
              crypto goes
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-md text-lg text-orange-100/60">
            Join thousands of MetaMask Card users who finally understand their spending — in real time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              whileHover={reduced ? {} : { scale: 1.04 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                size="lg"
                className="gap-2 border-0 bg-[#F6851B] text-base text-white shadow-xl shadow-orange-500/30 hover:bg-[#E2761B]"
              >
                <Link href="/auth/login">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={reduced ? {} : { scale: 1.04 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-white/15 bg-white/5 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Chrome className="h-4 w-4" />
                  Install Chrome Extension
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Trust signals */}
          <p className="mt-6 text-sm text-orange-200/40">
            No credit card &nbsp;·&nbsp; No private keys &nbsp;·&nbsp; Open beta — free forever
          </p>
        </motion.div>
      </div>
    </section>
  );
}

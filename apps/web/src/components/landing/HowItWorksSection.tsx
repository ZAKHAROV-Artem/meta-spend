'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Step {
  number: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

function ExtensionIllustration() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4285F4]/10 text-lg">
        🧩
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">MetaSpend</p>
        <p className="text-[10px] text-muted-foreground">Chrome Extension</p>
      </div>
      <span className="shrink-0 rounded-md bg-[#4285F4] px-2 py-0.5 text-[10px] font-bold text-white">
        Add
      </span>
    </div>
  );
}

function SignInIllustration() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2.5 text-[10px] font-semibold text-muted-foreground">Sign in to MetaSpend</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
          <span className="text-sm">G</span>
          <p className="text-[10px] font-medium text-foreground">Continue with Google</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
          <span className="text-sm">✉️</span>
          <p className="text-[10px] font-medium text-foreground">Continue with email</p>
        </div>
      </div>
    </div>
  );
}

function SyncIllustration() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground">MetaMask Portfolio</p>
        <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Syncing
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: '10%' }}
          animate={{ width: ['10%', '90%', '10%'] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">Pulling card transactions…</p>
    </div>
  );
}

function InsightsIllustration() {
  const bars = [40, 65, 50, 82, 55, 95, 68];
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground">Weekly spend</p>
        <span className="font-mono-alt text-[10px] font-bold text-foreground">$648</span>
      </div>
      <div className="flex h-10 items-end gap-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-primary/70"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Install the extension',
    description: 'Add the MetaSpend Chrome extension in one click from the Web Store.',
    illustration: <ExtensionIllustration />,
  },
  {
    number: '02',
    title: 'Sign in',
    description: 'Sign in with Google or your email address. No wallet connection needed.',
    illustration: <SignInIllustration />,
  },
  {
    number: '03',
    title: 'Open MetaMask Portfolio',
    description: 'Visit portfolio.metamask.io — the extension detects your card transactions and syncs them automatically.',
    illustration: <SyncIllustration />,
  },
  {
    number: '04',
    title: 'Get insights',
    description: 'See spending trends, categories, and trip breakdowns updated in real time.',
    illustration: <InsightsIllustration />,
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" ref={ref} className="relative overflow-hidden bg-muted/35 py-28">
      {/* Grain texture */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.015]">
        <filter id="grain-hiw">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-hiw)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="mb-3 inline-block font-mono-alt text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Up and running in 60 seconds
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Install, sign in, open MetaMask Portfolio, and your spending data is already there.
          </p>
        </motion.div>

        {/* Desktop: flex row with inline connectors. Mobile/tablet: 2-col grid */}
        <div className="hidden lg:flex lg:items-start lg:gap-0">
          {STEPS.map((step, index) => (
            <>
              {/* Step card */}
              <motion.div
                key={step.number}
                className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                initial={reduced ? false : { opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
              >
                <span className="font-display mb-3 select-none text-5xl font-bold leading-none text-primary/20">
                  {step.number}
                </span>
                <div className="mb-4">{step.illustration}</div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>

              {/* Connector between steps */}
              {index < STEPS.length - 1 && (
                <motion.div
                  key={`connector-${index}`}
                  className="flex w-8 shrink-0 items-start pt-18"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.55 + index * 0.12 }}
                >
                  <motion.div
                    className="h-px w-full origin-left"
                    style={{
                      background:
                        'repeating-linear-gradient(90deg,#F6851B 0,#F6851B 4px,transparent 4px,transparent 10px)',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.35, delay: 0.6 + index * 0.12, ease: 'easeOut' }}
                  />
                </motion.div>
              )}
            </>
          ))}
        </div>

        {/* Mobile / tablet: 2-col grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
            >
              <span className="font-display mb-3 select-none text-5xl font-bold leading-none text-primary/20">
                {step.number}
              </span>
              <div className="mb-4">{step.illustration}</div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

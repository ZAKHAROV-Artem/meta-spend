'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Stat {
  value: string;
  label: string;
  sublabel: string;
}

const STATS: Stat[] = [
  { value: '500K+', label: 'Transactions', sublabel: 'tracked & analyzed' },
  { value: '12', label: 'Smart Categories', sublabel: 'auto-detected by AI' },
  { value: '<1s', label: 'Sync Latency', sublabel: 'real-time updates' },
  { value: '100%', label: 'Private', sublabel: 'no keys, no seed phrases' },
];

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#F6851B] py-14">
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            >
              <span className="font-mono-alt text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {stat.value}
              </span>
              <span className="mt-1.5 text-sm font-semibold text-white/90">{stat.label}</span>
              <span className="mt-0.5 text-xs text-orange-100/70">{stat.sublabel}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

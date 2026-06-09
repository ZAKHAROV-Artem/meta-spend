'use client';

import { motion } from 'motion/react';

interface Feature {
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  featured?: boolean;
}

const FEATURES: Feature[] = [
  {
    emoji: '📊',
    title: 'Transaction History',
    description: 'Complete record of every MetaMask Card spend — searchable, filterable, and exportable.',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
  {
    emoji: '🏷️',
    title: 'Smart Categories',
    description: 'AI auto-categorizes every transaction. Fully customizable to match your spending style.',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  {
    emoji: '📈',
    title: 'Spending Analytics',
    description: 'Charts and trends to understand your habits at a daily, weekly, and monthly level.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    emoji: '⚡',
    title: 'Real-time Sync',
    description: 'Transactions appear the moment you spend — no delays, no manual imports, ever.',
    gradient: 'from-yellow-500/20 to-orange-500/10',
  },
  {
    emoji: '✈️',
    title: 'Trip Tracking',
    description: 'Create trips and automatically bucket all spending by destination. See exactly what Paris cost you.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    featured: true,
  },
  {
    emoji: '💱',
    title: 'Multi-Currency',
    description: 'Spend in any currency. MetaSpend converts and tracks in your preferred home currency seamlessly.',
    gradient: 'from-pink-500/20 to-rose-500/10',
  },
  {
    emoji: '🌙',
    title: 'Dark Mode',
    description: 'Easy on the eyes day or night. Three modes: light, dark, or follow your system preference.',
    gradient: 'from-slate-500/20 to-gray-500/10',
  },
  {
    emoji: '🔐',
    title: 'Secure & Private',
    description: 'Your data stays yours. We never ask for private keys or seed phrases — read-only access only.',
    gradient: 'from-green-500/20 to-emerald-500/10',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-background py-28">
      {/* Subtle SVG grid pattern */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="mb-3 inline-block font-mono-alt text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Features
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            A complete financial layer on top of your MetaMask Card — from single transactions to full trip reports.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/8 ${
                feature.featured ? 'lg:col-span-2' : ''
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
            >
              {/* Gradient background on hover */}
              <div
                className={`pointer-events-none absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative">
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${feature.gradient} border border-border text-2xl`}
                >
                  {feature.emoji}
                </div>

                <div className={feature.featured ? 'lg:flex lg:items-start lg:gap-8' : ''}>
                  <div className={feature.featured ? 'lg:flex-1' : ''}>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>

                  {/* Featured card extra: trip illustration */}
                  {feature.featured && (
                    <div className="mt-5 lg:mt-0 lg:w-52 lg:shrink-0">
                      <div className="rounded-xl border border-border bg-background/60 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Paris Trip · Jun 2025
                        </p>
                        {[
                          { icon: '🏨', label: 'Hotel', amount: '$420' },
                          { icon: '🍷', label: 'Dining', amount: '$186' },
                          { icon: '🚇', label: 'Transport', amount: '$48' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 py-1">
                            <span className="text-sm">{item.icon}</span>
                            <span className="flex-1 text-xs text-muted-foreground">{item.label}</span>
                            <span className="font-mono-alt text-xs font-semibold text-foreground">{item.amount}</span>
                          </div>
                        ))}
                        <div className="mt-2 border-t border-border pt-2 flex justify-between">
                          <span className="text-[10px] text-muted-foreground">Total</span>
                          <span className="font-mono-alt text-xs font-bold text-primary">$654</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

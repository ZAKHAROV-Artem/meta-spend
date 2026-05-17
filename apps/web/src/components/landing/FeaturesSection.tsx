'use client'

import { motion } from 'motion/react'

interface Feature {
  emoji: string
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    emoji: '📊',
    title: 'Transaction History',
    description: 'Complete record of every MetaMask Card spend, searchable and filterable.',
  },
  {
    emoji: '🏷️',
    title: 'Smart Categories',
    description: 'Auto-categorized with AI, fully customizable to match your spending style.',
  },
  {
    emoji: '📈',
    title: 'Spending Analytics',
    description: 'Charts and trends to understand your habits at a daily, weekly, and monthly level.',
  },
  {
    emoji: '🔔',
    title: 'Real-time Sync',
    description: 'Transactions appear as soon as you spend — no delays, no manual imports.',
  },
  {
    emoji: '🌙',
    title: 'Dark Mode',
    description: 'Easy on the eyes, day or night. Follows your system preference automatically.',
  },
  {
    emoji: '🔐',
    title: 'Secure & Private',
    description: 'Your data, your control. We never ask for private keys or seed phrases.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete financial layer on top of your MetaMask Card.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:shadow-primary/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
                {feature.emoji}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

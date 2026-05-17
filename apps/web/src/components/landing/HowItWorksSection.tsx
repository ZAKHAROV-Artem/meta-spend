'use client'

import { Fragment, useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: '1',
    title: 'Install extension',
    description: 'Add the MetaSpend Chrome extension from the Web Store in one click.',
  },
  {
    number: '2',
    title: 'Sign in',
    description: 'Connect your MetaMask wallet or sign in with your email address.',
  },
  {
    number: '3',
    title: 'Auto-sync',
    description: 'Transactions sync automatically from MetaMask Portfolio — no manual imports.',
  },
  {
    number: '4',
    title: 'Get insights',
    description: 'See spending trends, categories, and analytics updated in real time.',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="how-it-works" ref={ref} className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Up and running in under a minute.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 sm:grid sm:grid-cols-2 sm:gap-8 lg:flex lg:flex-row lg:items-start lg:gap-0">
          {STEPS.map((step, index) => (
            <Fragment key={step.number}>
              <motion.div
                className="flex flex-col items-start"
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-base shadow-md shadow-primary/30">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>

              {index < STEPS.length - 1 && (
                <motion.div
                  className="hidden lg:block h-px flex-1 bg-border self-center mt-0 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

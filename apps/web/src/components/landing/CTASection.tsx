'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative bg-[#1a0d00] py-24 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(246,133,27,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Start tracking your MetaMask Card spend
          </motion.h2>

          <motion.p
            className="mt-4 text-lg text-orange-100/70"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of MetaMask Card users getting clarity on their spending.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                size="lg"
                className="gap-2 text-base bg-[#F6851B] hover:bg-[#E2761B] text-white border-0 shadow-xl shadow-primary/40"
              >
                <Link href="/auth/login">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

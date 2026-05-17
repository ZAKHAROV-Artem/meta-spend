'use client';

import { motion, useReducedMotion } from 'motion/react';

export function AuthCard({ children }: { children: React.ReactNode }) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={shouldAnimate ? { opacity: 0, y: 24, scale: 0.97 } : {}}
      animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-6 flex items-center justify-center gap-2">
        {/* MetaMask brand gradient — intentional hardcode */}
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #F6851B, #E2761B)' }}
        >
          🦊
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">MetaSpend</span>
      </div>
      <div className="rounded-2xl border bg-card shadow-lg p-8">{children}</div>
    </motion.div>
  );
}

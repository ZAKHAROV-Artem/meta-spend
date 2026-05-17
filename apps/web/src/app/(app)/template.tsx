'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.div
      className="h-full"
      initial={shouldAnimate ? { opacity: 0, y: 8 } : {}}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 16 } : {}}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

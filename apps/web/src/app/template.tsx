'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0 } : {}}
      animate={shouldAnimate ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated logo */}
        <div className="relative">
          <motion.div
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"
            animate={{
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ['20%', '50%', '20%', '50%', '20%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-xl bg-[var(--background)]"
            animate={{
              rotate: [360, 270, 180, 90, 0],
              borderRadius: ['20%', '50%', '20%', '50%', '20%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gradient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            HS
          </motion.span>
        </div>

        {/* Loading bar */}
        <div className="h-0.5 w-32 overflow-hidden rounded-full bg-[var(--border)]">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: '50%' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

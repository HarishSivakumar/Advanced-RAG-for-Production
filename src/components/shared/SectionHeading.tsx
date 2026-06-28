'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-16',
        align === 'center' && 'text-center',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        {/* Accent line */}
        <div
          className={cn(
            'mb-4 flex items-center gap-3',
            align === 'center' && 'justify-center'
          )}
        >
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
          <span className="text-sm font-medium uppercase tracking-widest text-[var(--color-primary)]">
            {title}
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-[var(--text-muted)] md:text-xl"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ExperienceItem } from '@/types';

interface TimelineItemProps {
  item: ExperienceItem;
  index: number;
}

export function TimelineItem({ item, index }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative pl-8 md:pl-12"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)] to-[var(--border)]" />

      {/* Timeline dot */}
      <div className="absolute left-0 top-2 -translate-x-1/2">
        <div className="relative">
          <div className="h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-[var(--background)]" />
          {item.isCurrent && (
            <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary)]/40" />
          )}
        </div>
      </div>

      {/* Content card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/5">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.role}</h3>
            <p className="text-[var(--color-primary)]">{item.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {item.isCurrent && (
              <span className="rounded-full bg-[var(--color-success)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-success)]">
                Current
              </span>
            )}
            <span className="text-sm text-[var(--text-muted)]">
              {item.startDate} — {item.endDate}
            </span>
          </div>
        </div>

        {/* Location */}
        <p className="mb-4 text-sm text-[var(--text-muted)]">{item.location}</p>

        {/* Highlights */}
        <ul className="mb-4 space-y-2">
          {item.highlights.map((highlight, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + i * 0.05 }}
              className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
              {highlight}
            </motion.li>
          ))}
        </ul>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5">
          {item.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-[var(--color-primary)]/5 px-2 py-1 text-xs font-medium text-[var(--color-primary)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

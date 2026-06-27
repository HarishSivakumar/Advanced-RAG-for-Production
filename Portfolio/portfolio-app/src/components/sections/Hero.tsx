'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Download, Send, FolderOpen } from 'lucide-react';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(
  () => import('@/components/three/ParticleField').then((mod) => ({ default: mod.ParticleField })),
  { ssr: false }
);

const headlineWords = ['Harish', 'Sivakumar'];
const roles = ['Software Engineer', 'Data & AI Engineer', 'Full Stack', 'Cloud Architecture'];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Particle Background */}
      <ParticleField />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

      {/* Grid background */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            Available for opportunities
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {headlineWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-5xl font-bold tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl lg:text-8xl"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-6 flex flex-wrap items-center justify-center gap-2"
        >
          {roles.map((role, i) => (
            <span key={role} className="flex items-center gap-2">
              {i > 0 && (
                <span className="h-1 w-1 rounded-full bg-[var(--color-primary)]" />
              )}
              <span className="text-lg font-medium text-[var(--color-primary)] md:text-xl">
                {role}
              </span>
            </span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg"
        >
          Building production-ready AI systems, scalable data pipelines, and intelligent cloud architecture that solve real business problems.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            onClick={() =>
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-xl hover:shadow-[var(--color-primary)]/30"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <FolderOpen className="h-4 w-4" />
            View Projects
          </motion.button>

          <motion.a
            href="/resume.pdf"
            download
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 px-6 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur-sm transition-all hover:border-[var(--color-primary)]/30 hover:bg-[var(--surface)]"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-4 w-4" />
            Download Resume
          </motion.a>

          <motion.button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text-muted)] transition-all hover:border-[var(--color-primary)]/30 hover:text-[var(--foreground)]"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4" />
            Contact Me
          </motion.button>
        </motion.div>

        {/* Keyboard shortcut hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 text-xs text-[var(--text-muted)]/60"
        >
          Press{' '}
          <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>{' '}
          to navigate
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-5 w-5 text-[var(--text-muted)]/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

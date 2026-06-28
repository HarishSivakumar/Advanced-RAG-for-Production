'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MapPin, Briefcase, Calendar, Zap } from 'lucide-react';

const stats = [
  { label: 'Production Lambdas', value: '60+' },
  { label: 'Data Pipelines', value: '30+' },
  { label: 'RAG Latency', value: '~200ms' },
  { label: 'CGPA', value: '8.99' },
];

const expertise = [
  'RAG & GenAI',
  'Full Stack Development',
  'Cloud Architecture',
  'Data Engineering',
  'Analytics Systems',
  'Serverless',
];

export function About() {
  return (
    <section id="about" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="About"
          subtitle="A passionate engineer who thrives at the intersection of AI, cloud, and full-stack development."
        />

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3"
          >
            <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
              <p className="text-lg">
                I&apos;m a <span className="font-semibold text-[var(--foreground)]">Full Stack Engineer</span> with a passion for building intelligent, scalable, and data-driven software that solves real-world business problems.
              </p>
              <p>
                Currently, I work as a Full Stack Engineer at <span className="font-semibold text-[var(--color-primary)]">ZipTier</span>, where I ship production systems. My day-to-day work involves maintaining 60+ AWS Lambda functions, designing ETL pipelines on Redshift and DynamoDB, and engineering core RAG pipelines.
              </p>
              <p>
                I believe great software is built by balancing performance, simplicity, and user experience. Instead of chasing trends, I focus on creating reliable systems—whether it&apos;s architecting scalable backend services, optimizing cloud infrastructure, or building AI-powered features.
              </p>
            </div>

            {/* Current info */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
                <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                Full Stack Engineer @ ZipTier
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
                <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                Noida, India (Hybrid)
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
                <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                Available May 2026
              </div>
            </div>

            {/* Expertise tags */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-[var(--foreground)]">Core Expertise</p>
              <div className="flex flex-wrap gap-2">
                {expertise.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)]/5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]"
                  >
                    <Zap className="h-3 w-3" />
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
                >
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Quick highlights */}
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h4 className="mb-4 text-sm font-semibold text-[var(--foreground)]">What I Build</h4>
              <ul className="space-y-3">
                {[
                  'Production AI systems with LLMs & RAG',
                  'Cloud-native apps on AWS',
                  'Real-time analytics dashboards',
                  'Scalable full-stack applications',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

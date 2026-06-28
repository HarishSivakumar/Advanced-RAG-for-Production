'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';
import { GithubIcon as Github } from '@/components/icons/BrandIcons';
import { Project } from '@/types';

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/#projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Category badge */}
          <span className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            {project.category}
          </span>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl">
            {project.title}
          </h1>

          <p className="mb-6 text-lg text-[var(--color-primary)]">{project.subtitle}</p>

          <p className="mb-8 text-lg leading-relaxed text-[var(--text-muted)]">
            {project.description}
          </p>

          {/* Links */}
          <div className="mb-12 flex flex-wrap gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-primary)]/30"
              >
                <Github className="h-4 w-4" />
                View Source
              </a>
            )}
            {project.liveDemo && project.liveDemo !== '#' && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </a>
            )}
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-16 overflow-hidden rounded-2xl border border-[var(--border)]"
        >
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <span className="text-3xl font-bold">{project.title.charAt(0)}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{project.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Problem */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">The Problem</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">{project.problem}</p>
        </motion.section>

        {/* Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Architecture</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">{project.architecture}</p>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Key Features</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                  <h3 className="font-semibold text-[var(--foreground)]">{feature.title}</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Back to projects */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-[var(--border)] pt-8 text-center"
        >
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-muted)] transition-all hover:border-[var(--color-primary)]/30 hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            View All Projects
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { GithubIcon as Github } from '@/components/icons/BrandIcons';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 hover:border-[var(--color-primary)]/30 hover:shadow-2xl hover:shadow-[var(--color-primary)]/5 flex flex-col h-full">
        <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10" aria-label={`View ${project.title}`} />
        
        {/* Project Image */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <span className="text-2xl font-bold">{project.title.charAt(0)}</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {project.category}
                </span>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <span className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold text-white">
                View Project →
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                  {project.title}
                </h3>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">{project.subtitle}</p>
              </div>
            </div>

            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-[var(--color-primary)]/5 px-2 py-1 text-xs font-medium text-[var(--color-primary)]"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 5 && (
                <span className="rounded-md bg-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                  +{project.techStack.length - 5}
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 relative z-20">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-3.5 w-3.5" />
                  Source
                </a>
              )}
              {project.liveDemo && project.liveDemo !== '#' && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Demo
                </a>
              )}
            </div>
        </div>
      </div>
    </motion.div>
  );
}

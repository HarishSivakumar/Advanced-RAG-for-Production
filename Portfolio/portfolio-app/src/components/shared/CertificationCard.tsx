'use client';

import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { Certification } from '@/types';

interface CertificationCardProps {
  cert: Certification;
  index: number;
}

const issuerColors: Record<string, string> = {
  'Amazon Web Services': '#FF9900',
  Google: '#4285F4',
  Microsoft: '#00A4EF',
  'Coursera / Stanford': '#0056D2',
};

export function CertificationCard({ cert, index }: CertificationCardProps) {
  const color = issuerColors[cert.issuer] || 'var(--color-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-lg"
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: color }}
      />

      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Award className="h-6 w-6" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] leading-snug">{cert.name}</h3>
          <p className="mt-1 text-sm" style={{ color }}>
            {cert.issuer}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Issued {cert.issueDate}</p>
        </div>
      </div>

      {cert.credentialUrl && cert.credentialUrl !== '#' && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ExternalLink className="h-3 w-3" />
          View Credential
        </a>
      )}
    </motion.div>
  );
}

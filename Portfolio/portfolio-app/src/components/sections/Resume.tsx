'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Download, GraduationCap, Briefcase, Code2, Award } from 'lucide-react';

import { experiences } from '@/constants/experience';
import { certifications } from '@/constants/certifications';
import { skillCategories } from '@/constants/skills';

const resumeSections = [
  {
    id: 'experience',
    icon: Briefcase,
    title: 'Experience',
    items: experiences.map(exp => ({
      title: exp.role,
      subtitle: `${exp.company} • ${exp.startDate} — ${exp.endDate}`,
      details: exp.highlights,
    })),
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Education',
    items: [
      {
        title: "B.Tech in Computer Science and Engineering",
        subtitle: 'Bennett University • Aug 2022 — May 2026',
        details: ['CGPA: 8.99', 'Coursework: Data Structures, Algorithms, Cloud Computing, Database Systems, Artificial Intelligence'],
      },
      {
        title: "Diploma in Cyber Security",
        subtitle: 'Cryptus Cyber Security • 2024 — 2025',
        details: ['CCEH', 'CCNA', 'WAPT', 'CCFI', 'Python'],
      },
    ],
  },
  {
    id: 'skills-summary',
    icon: Code2,
    title: 'Technical Skills',
    items: skillCategories.map(category => ({
      title: category.name,
      subtitle: '',
      details: [category.skills.map(s => s.name).join(', ')],
    })),
  },
  {
    id: 'certs',
    icon: Award,
    title: 'Certifications',
    items: certifications.map(cert => ({
      title: cert.name,
      subtitle: `${cert.issuer} • ${cert.issueDate}`,
      details: [],
    })),
  },
];

export function Resume() {
  return (
    <section id="resume" className="section-padding">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          title="Resume"
          subtitle="A comprehensive overview of my professional background."
        />

        {/* Download button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-xl"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-4 w-4" />
            Download Full Resume (PDF)
          </motion.a>
        </motion.div>

        {/* Interactive Resume */}
        <div className="space-y-6">
          {resumeSections.map((section, si) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: si * 0.1 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-hover)] px-6 py-4">
                <section.icon className="h-5 w-5 text-[var(--color-primary)]" />
                <h3 className="font-semibold text-[var(--foreground)]">{section.title}</h3>
              </div>

              {/* Section content */}
              <div className="divide-y divide-[var(--border)]">
                {section.items.map((item, i) => (
                  <div key={i} className="px-6 py-5">
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="font-medium text-[var(--foreground)]">{item.title}</h4>
                    </div>
                    {item.subtitle && (
                      <p className="mb-2 text-sm text-[var(--color-primary)]">{item.subtitle}</p>
                    )}
                    {item.details.length > 0 && (
                      <ul className="space-y-1">
                        {item.details.map((detail, di) => (
                          <li
                            key={di}
                            className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                          >
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

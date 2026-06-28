'use client';

import { SectionHeading } from '@/components/shared/SectionHeading';
import { CertificationCard } from '@/components/shared/CertificationCard';
import { certifications } from '@/constants/certifications';

export function Certifications() {
  return (
    <section id="certifications" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Certifications"
          subtitle="Professional certifications validating expertise in cloud, data, and AI."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert, i) => (
            <CertificationCard key={cert.id} cert={cert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

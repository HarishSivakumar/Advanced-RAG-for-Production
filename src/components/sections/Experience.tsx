'use client';

import { SectionHeading } from '@/components/shared/SectionHeading';
import { TimelineItem } from '@/components/shared/TimelineItem';
import { experiences } from '@/constants/experience';

export function Experience() {
  return (
    <section id="experience" className="section-padding">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          title="Experience"
          subtitle="My professional journey building production-grade software."
        />

        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <TimelineItem key={exp.id} item={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

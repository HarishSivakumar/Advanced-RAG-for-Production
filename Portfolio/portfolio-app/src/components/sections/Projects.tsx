'use client';

import { SectionHeading } from '@/components/shared/SectionHeading';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { getFeaturedProjects } from '@/constants/projects';

export function Projects() {
  const projects = getFeaturedProjects();

  return (
    <section id="projects" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Projects"
          subtitle="Featured work showcasing full-stack development, AI integration, and cloud architecture."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

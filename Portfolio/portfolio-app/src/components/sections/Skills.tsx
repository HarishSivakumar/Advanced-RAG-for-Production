'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SkillBar } from '@/components/shared/SkillBar';
import { skillCategories } from '@/constants/skills';
import {
  Monitor, Server, Cloud, Database, Brain, BarChart3, Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Monitor, Server, Cloud, Database, Brain, BarChart3, Code2,
};

export function Skills() {
  const [activeCategory, setActiveCategory] = useState(skillCategories[0].id);
  const active = skillCategories.find((c) => c.id === activeCategory) || skillCategories[0];

  return (
    <section id="skills" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Skills"
          subtitle="Technologies and tools I use to bring ideas to life."
        />

        {/* Category Tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {skillCategories.map((category) => {
            const Icon = iconMap[category.icon];
            const isActive = activeCategory === category.id;

            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSkillTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: category.color }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  {category.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
              {/* Category header */}
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${active.color}15` }}
                >
                  {(() => {
                    const Icon = iconMap[active.icon];
                    return Icon ? <Icon className="h-5 w-5" style={{ color: active.color }} /> : null;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{active.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {active.skills.length} technologies
                  </p>
                </div>
              </div>

              {/* Skill bars */}
              <div className="space-y-5">
                {active.skills.map((skill, i) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    proficiency={skill.proficiency}
                    color={active.color}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All skills overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
        >
          {skillCategories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-all duration-300 hover:border-[var(--color-primary)]/20"
              >
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: `${category.color}10` }}
                >
                  {Icon && <Icon className="h-5 w-5" style={{ color: category.color }} />}
                </div>
                <p className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--foreground)]">
                  {category.name}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                  {category.skills.length} skills
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

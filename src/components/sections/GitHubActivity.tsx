'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { AnimatedCard } from '@/components/shared/AnimatedCard';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { GithubIcon as Github } from '@/components/icons/BrandIcons';
import { GitHubRepo } from '@/types';

interface GitHubData {
  user: {
    public_repos: number;
    followers: number;
    following: number;
  } | null;
  repos: GitHubRepo[];
  languages: Record<string, number>;
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#ED8B00',
  'C++': '#00599C',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Shell: '#89E051',
};

export function GitHubActivity() {
  const [data, setData] = useState<GitHubData>({
    user: null,
    repos: [],
    languages: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGitHub() {
      try {
        const res = await fetch('/api/github');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGitHub();
  }, []);

  const totalLanguageBytes = Object.values(data.languages).reduce((a, b) => a + b, 0);

  return (
    <section id="github" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="GitHub"
          subtitle="Open source contributions and side projects."
        />

        {/* Stats */}
        {data.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-md"
          >
            {[
              { label: 'Repositories', value: data.user.public_repos },
              { label: 'Followers', value: data.user.followers },
              { label: 'Following', value: data.user.following },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
              >
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Language breakdown */}
        {totalLanguageBytes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="mx-auto max-w-2xl">
              {/* Language bar */}
              <div className="mb-3 flex h-2.5 overflow-hidden rounded-full">
                {Object.entries(data.languages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([lang, bytes]) => (
                    <motion.div
                      key={lang}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(bytes / totalLanguageBytes) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                      style={{ backgroundColor: languageColors[lang] || '#6B7280' }}
                    />
                  ))}
              </div>

              {/* Language labels */}
              <div className="flex flex-wrap justify-center gap-4">
                {Object.entries(data.languages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([lang, bytes]) => (
                    <div key={lang} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: languageColors[lang] || '#6B7280' }}
                      />
                      <span className="text-xs text-[var(--text-muted)]">
                        {lang} {((bytes / totalLanguageBytes) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Repos grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : data.repos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.repos.slice(0, 6).map((repo, i) => (
              <AnimatedCard key={repo.id} delay={i * 0.08}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Github className="h-5 w-5 text-[var(--text-muted)]" />
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h4 className="mb-1 font-semibold text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                    {repo.name}
                  </h4>
                  <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              languageColors[repo.language] || '#6B7280',
                          }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                    )}
                    {repo.forks_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                    )}
                  </div>
                </a>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <Github className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-[var(--text-muted)]">
              GitHub data will appear once the API is configured.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

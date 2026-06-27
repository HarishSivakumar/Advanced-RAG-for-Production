'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, Code2, Briefcase, Mail, Moon, Sun, X } from 'lucide-react';
import { GithubIcon as Github } from '@/components/icons/BrandIcons';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, []);

  const items: CommandItem[] = [
    { id: 'about', label: 'Go to About', icon: <User className="h-4 w-4" />, action: () => scrollTo('about'), group: 'Navigation', keywords: ['about', 'intro'] },
    { id: 'skills', label: 'Go to Skills', icon: <Code2 className="h-4 w-4" />, action: () => scrollTo('skills'), group: 'Navigation', keywords: ['skills', 'tech'] },
    { id: 'projects', label: 'Go to Projects', icon: <FileText className="h-4 w-4" />, action: () => scrollTo('projects'), group: 'Navigation', keywords: ['projects', 'work'] },
    { id: 'experience', label: 'Go to Experience', icon: <Briefcase className="h-4 w-4" />, action: () => scrollTo('experience'), group: 'Navigation', keywords: ['experience', 'work'] },
    { id: 'contact', label: 'Go to Contact', icon: <Mail className="h-4 w-4" />, action: () => scrollTo('contact'), group: 'Navigation', keywords: ['contact', 'email'] },
    {
      id: 'github',
      label: 'Open GitHub',
      icon: <Github className="h-4 w-4" />,
      action: () => { setOpen(false); window.open('https://github.com/harishsivakumar', '_blank'); },
      group: 'Links',
      keywords: ['github', 'code'],
    },
    {
      id: 'resume',
      label: 'Download Resume',
      icon: <FileText className="h-4 w-4" />,
      action: () => { setOpen(false); window.open('/resume.pdf', '_blank'); },
      group: 'Links',
      keywords: ['resume', 'cv', 'download'],
    },
    {
      id: 'theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); setOpen(false); },
      group: 'Actions',
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groups = [...new Set(items.map((item) => item.group))];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2"
          >
            <Command className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="h-12 w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-6 items-center rounded border border-[var(--border)] px-1.5 text-[10px] font-medium text-[var(--text-muted)]"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No results found.
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group key={group} heading={group} className="mb-2">
                    <div className="mb-1 px-2 pt-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      {group}
                    </div>
                    {items
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.label + ' ' + (item.keywords?.join(' ') || '')}
                          onSelect={item.action}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors data-[selected=true]:bg-[var(--color-primary)]/10 data-[selected=true]:text-[var(--color-primary)]"
                        >
                          {item.icon}
                          {item.label}
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2">
                <span className="text-xs text-[var(--text-muted)]">
                  Navigate with ↑↓ • Select with ↵
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  ⌘K to toggle
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

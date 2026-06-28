'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Send, CheckCircle, AlertCircle, Loader2, Mail, User, MessageSquare } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="mx-auto max-w-2xl px-6">
        <SectionHeading
          title="Contact"
          subtitle="Have a project in mind or want to connect? I'd love to hear from you."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
              >
                <User className="h-4 w-4 text-[var(--text-muted)]" />
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                {...register('name')}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
              >
                <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.email.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
              >
                <MessageSquare className="h-4 w-4 text-[var(--text-muted)]" />
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Tell me about your project or opportunity..."
                {...register('message')}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.message.message}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={{ scale: status === 'idle' ? 1.01 : 1 }}
              whileTap={{ scale: status === 'idle' ? 0.99 : 1 }}
            >
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </motion.span>
                )}
                {status === 'loading' && (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </motion.span>
                )}
                {status === 'success' && (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Message Sent!
                  </motion.span>
                )}
                {status === 'error' && (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Failed — try again
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

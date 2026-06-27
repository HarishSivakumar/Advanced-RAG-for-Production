'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MailOpen, Trash2, Download, Loader2,
  MessageSquare, Eye, Clock, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { ContactMessage, AdminStats } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0,
    weekMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setStats(data.stats || stats);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead } : m))
      );
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Message', 'Date', 'Read'];
    const rows = messages.map((m) => [
      m.name,
      m.email,
      `"${m.message.replace(/"/g, '""')}"`,
      m.createdAt,
      m.isRead ? 'Yes' : 'No',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = messages.find((m) => m.id === selectedId);

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: 'var(--color-primary)' },
            { label: 'Unread', value: stats.unreadMessages, icon: Mail, color: 'var(--color-warning)' },
            { label: 'Today', value: stats.todayMessages, icon: Clock, color: 'var(--color-success)' },
            { label: 'Read', value: stats.totalMessages - stats.unreadMessages, icon: Eye, color: 'var(--color-accent)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <stat.icon className="mb-2 h-5 w-5" style={{ color: stat.color }} />
              <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-[var(--text-muted)]">No messages yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Messages list */}
            <div className="space-y-2 lg:col-span-2">
              {messages.map((msg) => (
                <motion.button
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.isRead) handleMarkRead(msg.id, true);
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedId === msg.id
                      ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-primary)]/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                        )}
                        <span className="truncate font-medium text-[var(--foreground)]">
                          {msg.name}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                        {msg.email}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-[var(--text-muted)]">
                        {msg.message}
                      </p>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-[10px] text-[var(--text-muted)]">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Message detail */}
            <div className="lg:col-span-3">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {selected.name}
                      </h3>
                      <p className="text-sm text-[var(--color-primary)]">{selected.email}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {formatDate(selected.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkRead(selected.id, !selected.isRead)}
                        className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] hover:text-[var(--foreground)]"
                        title={selected.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {selected.isRead ? (
                          <MailOpen className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] hover:text-[var(--color-error)]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
                    {selected.message}
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)]">Select a message to view</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

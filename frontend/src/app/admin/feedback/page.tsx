'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bug, Lightbulb, TrendingUp, Wrench, Search, RefreshCw,
  Trash2, CheckCircle2, Clock, XCircle,
  AlertTriangle, Copy, Inbox, ExternalLink,
  MessageSquareText,
  User, Mail, Calendar, StickyNote, X, Check,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi, type AdminFeedback, type FeedbackStatus, type FeedbackPriority } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

// ─── Meta maps ────────────────────────────────────────────────────────────────

const TYPE_META = {
  bug:         { label: 'Bug',         Icon: Bug,       color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200'    },
  feature:     { label: 'Feature',     Icon: Lightbulb, color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200'  },
  improvement: { label: 'Improvement', Icon: TrendingUp, color: 'text-brand',       bg: 'bg-brand-tint', ring: 'ring-brand/20'   },
  other:       { label: 'Other',       Icon: Wrench,    color: 'text-ink-muted',   bg: 'bg-hairline',   ring: 'ring-hairline'   },
} as const

const STATUS_META: Record<FeedbackStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle2 }> = {
  open:        { label: 'Open',        color: 'text-sky-700',     bg: 'bg-sky-50 ring-sky-200',      Icon: Inbox         },
  in_progress: { label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50 ring-amber-200',  Icon: Clock         },
  resolved:    { label: 'Resolved',    color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200', Icon: CheckCircle2 },
  closed:      { label: 'Closed',      color: 'text-ink-muted',   bg: 'bg-hairline ring-hairline',   Icon: XCircle       },
  duplicate:   { label: 'Duplicate',   color: 'text-violet-700',  bg: 'bg-violet-50 ring-violet-200', Icon: Copy          },
}

const PRIORITY_META: Record<FeedbackPriority, { label: string; color: string; dot: string }> = {
  low:      { label: 'Low',      color: 'text-ink-faint',  dot: 'bg-gray-300'    },
  medium:   { label: 'Medium',   color: 'text-amber-600',  dot: 'bg-amber-400'   },
  high:     { label: 'High',     color: 'text-orange-600', dot: 'bg-orange-400'  },
  critical: { label: 'Critical', color: 'text-red-600',    dot: 'bg-red-500'     },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) }
  catch { return d }
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, Icon, accent, bg }: {
  label: string; value: string | number; sub?: string
  Icon: typeof Bug; accent: string; bg: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className={cn('mt-2 text-3xl font-black tabular-nums', accent)}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-ink-faint">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', bg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
    </div>
  )
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: keyof typeof TYPE_META }) {
  const m = TYPE_META[type] ?? TYPE_META.other
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', m.bg, m.color, m.ring)}>
      <m.Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.open
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', m.bg, m.color)}>
      <m.Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  )
}

// ─── Priority dot ─────────────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: FeedbackPriority }) {
  const m = PRIORITY_META[priority] ?? PRIORITY_META.medium
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', m.color)}>
      <span className={cn('h-2 w-2 rounded-full', m.dot)} /> {m.label}
    </span>
  )
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ item, onClose, onUpdate }: {
  item: AdminFeedback
  onClose: () => void
  onUpdate: (updated: AdminFeedback) => void
}) {
  const [status,    setStatus]    = useState<FeedbackStatus>(item.status)
  const [priority,  setPriority]  = useState<FeedbackPriority>(item.priority)
  const [adminNote, setAdminNote] = useState(item.adminNote ?? '')
  const [saving,    setSaving]    = useState(false)

  async function save() {
    setSaving(true)
    try {
      const updated = await adminApi.feedback.update(item._id, { status, priority, adminNote })
      onUpdate(updated)
      toast.success('Feedback updated')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const typeMeta = TYPE_META[item.type] ?? TYPE_META.other

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 38 }}
      className="fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l border-hairline bg-paper shadow-2xl"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl ring-1', typeMeta.bg, typeMeta.ring)}>
            <typeMeta.Icon className={cn('h-4.5 w-4.5', typeMeta.color)} style={{ height: 18, width: 18 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{item.title}</p>
            <p className="text-[10px] text-ink-faint">{timeAgo(item.createdAt)}</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-hairline hover:text-ink transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* Submitter */}
        <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Submitter</p>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <User className="h-3.5 w-3.5 text-ink-faint" /> {item.name || 'Anonymous'}
          </div>
          {item.email && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Mail className="h-3.5 w-3.5 text-ink-faint" /> {item.email}
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-ink-faint">
            <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleString()}
          </div>
          {item.pageUrl && (
            <a href={item.pageUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-brand hover:underline truncate">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.pageUrl}</span>
            </a>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Description</p>
          <div className="rounded-xl border border-hairline bg-paper p-4 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
            {item.description}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as FeedbackStatus)}
              className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            >
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as FeedbackPriority)}
              className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            >
              {Object.entries(PRIORITY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Admin note */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-1">
            <StickyNote className="h-3 w-3" /> Internal Note
          </label>
          <textarea
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            placeholder="Add an internal note visible only to admins…"
            rows={3}
            className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-hairline bg-paper-elevated px-6 py-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save changes
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_STATUSES: FeedbackStatus[] = ['open','in_progress','resolved','closed','duplicate']
const ALL_TYPES = ['bug','feature','improvement','other']
const ALL_PRIORITIES: FeedbackPriority[] = ['critical','high','medium','low']

export default function AdminFeedbackPage() {
  const [items,    setItems]    = useState<AdminFeedback[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [stats,    setStats]    = useState<{
    total: number; byStatus: Record<string,number>; byType: Record<string,number>; byPriority: Record<string,number>
  } | null>(null)

  // Filters
  const [q,        setQ]        = useState('')
  const [status,   setStatus]   = useState('')
  const [type,     setType]     = useState('')
  const [priority, setPriority] = useState('')
  const [sort,     setSort]     = useState('createdAt')
  const [order,    setOrder]    = useState('desc')

  // Detail
  const [selected, setSelected] = useState<AdminFeedback | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [res, statsRes] = await Promise.all([
        adminApi.feedback.list({ q: q || undefined, status: status || undefined, type: type || undefined, priority: priority || undefined, sort, order, page: p, limit: 15 }),
        p === 1 ? adminApi.feedback.stats() : Promise.resolve(null),
      ])
      setItems(res.items)
      setTotal(res.total)
      setPage(res.page)
      setPages(res.pages)
      if (statsRes) setStats(statsRes)
    } catch {
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }, [q, status, type, priority, sort, order])

  useEffect(() => { load(1) }, [load])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await adminApi.feedback.delete(id)
      setItems(prev => prev.filter(i => i._id !== id))
      setTotal(t => t - 1)
      if (selected?._id === id) setSelected(null)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  function handleUpdate(updated: AdminFeedback) {
    setItems(prev => prev.map(i => i._id === updated._id ? updated : i))
    setSelected(updated)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-hairline bg-paper-elevated px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">Feedback & Reports</h1>
            <p className="mt-0.5 text-xs text-ink-faint">
              Bug reports, feature requests and improvement suggestions from users
            </p>
          </div>
          <button
            onClick={() => load(1)}
            className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total"       value={stats.total}                    Icon={MessageSquareText} accent="text-brand"      bg="bg-brand-tint"  />
            <StatCard label="Open"        value={stats.byStatus.open ?? 0}       sub="needs attention"    Icon={Inbox}             accent="text-sky-600"    bg="bg-sky-50"      />
            <StatCard label="Bug Reports" value={stats.byType.bug ?? 0}          Icon={Bug}               accent="text-red-600"    bg="bg-red-50"      />
            <StatCard label="Critical"    value={stats.byPriority.critical ?? 0} sub="high priority"      Icon={AlertTriangle}     accent="text-red-600"    bg="bg-red-50"      />
          </div>
        )}

        {/* ── Status breakdown mini-row ──────────────────────────────────── */}
        {stats && (
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map(s => {
              const m = STATUS_META[s]
              const count = stats.byStatus[s] ?? 0
              return (
                <button
                  key={s}
                  onClick={() => setStatus(status === s ? '' : s)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ring-1',
                    status === s ? cn(m.bg, m.color) : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-brand ring-transparent',
                  )}
                >
                  <m.Icon className="h-3 w-3" /> {m.label} <span className="font-bold">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search title, description, email…"
              className="h-9 w-full rounded-xl border border-hairline-strong bg-paper pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          <select value={type} onChange={e => setType(e.target.value)}
            className="h-9 rounded-xl border border-hairline-strong bg-paper px-3 text-sm outline-none focus:border-brand">
            <option value="">All types</option>
            {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t as keyof typeof TYPE_META]?.label ?? t}</option>)}
          </select>

          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="h-9 rounded-xl border border-hairline-strong bg-paper px-3 text-sm outline-none focus:border-brand">
            <option value="">All priorities</option>
            {ALL_PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
          </select>

          <select value={`${sort}:${order}`} onChange={e => { const [s,o] = e.target.value.split(':'); setSort(s); setOrder(o) }}
            className="h-9 rounded-xl border border-hairline-strong bg-paper px-3 text-sm outline-none focus:border-brand">
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="priority:desc">Priority (high first)</option>
            <option value="updatedAt:desc">Recently updated</option>
          </select>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
          {loading ? (
            <div className="space-y-px">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-hairline" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 animate-pulse rounded bg-hairline" />
                    <div className="h-2.5 w-72 animate-pulse rounded bg-hairline" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-hairline" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-10 w-10 text-ink-faint/30" />
              <p className="text-sm font-semibold text-ink">No feedback found</p>
              <p className="mt-1 text-xs text-ink-faint">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {items.map(item => {
                const typeMeta = TYPE_META[item.type] ?? TYPE_META.other
                return (
                  <div
                    key={item._id}
                    className={cn(
                      'group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-brand/2 cursor-pointer',
                      selected?._id === item._id && 'bg-brand/5',
                    )}
                    onClick={() => setSelected(item)}
                  >
                    {/* Type icon */}
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1', typeMeta.bg, typeMeta.ring)}>
                      <typeMeta.Icon className={cn('h-4 w-4', typeMeta.color)} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-ink leading-snug group-hover:text-brand transition-colors line-clamp-1">
                          {item.title}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <PriorityDot priority={item.priority} />
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <p className="mt-0.5 text-[12px] text-ink-faint line-clamp-1">{item.description}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-ink-faint">
                        <span>{item.name || 'Anonymous'}</span>
                        {item.email && <span className="truncate max-w-32">{item.email}</span>}
                        <span>{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(item._id) }}
                      disabled={deleting === item._id}
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint/40
                                 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-30"
                    >
                      {deleting === item._id
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
              <p className="text-[11px] text-ink-faint">{total} total · page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => load(page - 1)} disabled={page <= 1}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => load(page + 1)} disabled={page >= pages}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
              onClick={() => setSelected(null)}
            />
            <DetailDrawer item={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

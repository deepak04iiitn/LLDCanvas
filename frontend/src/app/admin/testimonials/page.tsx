'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, CheckCircle2, XCircle, Clock, RefreshCw,
  Trash2, Pin, PinOff, Search, X, Check,
  Quote, User, Mail, StickyNote, MessageSquareQuote,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi, type AdminTestimonial } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={cn('h-3 w-3', n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-ink-faint/20')} />
      ))}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending:  { label: 'Pending',  Icon: Clock,        color: 'text-amber-700',   bg: 'bg-amber-50 ring-amber-200'    },
  approved: { label: 'Approved', Icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200' },
  rejected: { label: 'Rejected', Icon: XCircle,      color: 'text-red-700',     bg: 'bg-red-50 ring-red-200'        },
} as const

function StatusBadge({ status }: { status: AdminTestimonial['status'] }) {
  const m = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', m.bg, m.color)}>
      <m.Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, Icon, accent, bg }: {
  label: string; value: string | number; sub?: string
  Icon: typeof Star; accent: string; bg: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
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

// ─── Detail drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ item, onClose, onUpdate }: {
  item: AdminTestimonial
  onClose: () => void
  onUpdate: (t: AdminTestimonial) => void
}) {
  const [status,    setStatus]    = useState(item.status)
  const [featured,  setFeatured]  = useState(item.featured)
  const [adminNote, setAdminNote] = useState(item.adminNote ?? '')
  const [saving,    setSaving]    = useState(false)

  async function save() {
    setSaving(true)
    try {
      const updated = await adminApi.testimonials.update(item._id, { status, featured, adminNote })
      onUpdate(updated)
      toast.success('Testimonial updated')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 38 }}
      className="fixed right-0 top-0 z-50 flex h-full w-[460px] max-w-full flex-col border-l border-hairline bg-paper shadow-2xl"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
            <Quote className="h-4.5 w-4.5 text-brand" style={{ height: 18, width: 18 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{item.name}</p>
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
          <div className="flex items-center gap-3">
            {item.avatar ? (
              <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-hairline" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand ring-1 ring-brand/20">
                {initials(item.name)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-ink">{item.name}</p>
              {item.role && <p className="text-[11px] text-ink-faint">{item.role}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Mail className="h-3.5 w-3.5 text-ink-faint" /> {item.email}
          </div>
          <StarRow rating={item.rating} />
        </div>

        {/* Content preview */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Testimonial</p>
          <div className="relative rounded-xl border border-hairline bg-paper p-5">
            <Quote className="absolute left-3 top-3 h-6 w-6 text-brand/10" />
            <p className="pl-4 text-sm leading-relaxed text-ink-muted italic">&ldquo;{item.content}&rdquo;</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {(['pending', 'approved', 'rejected'] as const).map(s => {
              const m = STATUS_STYLES[s]
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ring-1 transition-all',
                    status === s ? cn(m.bg, m.color) : 'border-hairline bg-paper text-ink-muted ring-transparent hover:border-brand/20',
                  )}
                >
                  <m.Icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Pin className="h-4 w-4 text-brand" />
            <div>
              <p className="text-sm font-medium text-ink">Featured testimonial</p>
              <p className="text-[11px] text-ink-faint">Pinned to the top of the landing page display</p>
            </div>
          </div>
          <button
            onClick={() => setFeatured(!featured)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              featured ? 'bg-brand' : 'bg-hairline-strong',
            )}
          >
            <span className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              featured ? 'translate-x-5' : 'translate-x-0.5',
            )} />
          </button>
        </div>

        {/* Admin note */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-1">
            <StickyNote className="h-3 w-3" /> Internal Note
          </label>
          <textarea
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            placeholder="Add an internal note…"
            rows={3}
            className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-hairline bg-paper-elevated px-6 py-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save changes
        </button>
        <button onClick={onClose} className="rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors">
          Close
        </button>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTestimonialsPage() {
  const [items,    setItems]    = useState<AdminTestimonial[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [stats,    setStats]    = useState<{ total: number; byStatus: Record<string,number>; avgRating: number } | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<AdminTestimonial | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [res, statsRes] = await Promise.all([
        adminApi.testimonials.list({ status: statusFilter || undefined, page: p, limit: 12 }),
        p === 1 ? adminApi.testimonials.stats() : Promise.resolve(null),
      ])
      setItems(res.items)
      setTotal(res.total)
      setPage(res.page)
      setPages(res.pages)
      if (statsRes) setStats(statsRes)
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load(1) }, [load])

  async function quickApprove(id: string, status: 'approved' | 'rejected') {
    try {
      const updated = await adminApi.testimonials.update(id, { status })
      setItems(prev => prev.map(i => i._id === id ? updated : i))
      toast.success(status === 'approved' ? 'Approved!' : 'Rejected')
    } catch {
      toast.error('Failed')
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await adminApi.testimonials.delete(id)
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

  function handleUpdate(updated: AdminTestimonial) {
    setItems(prev => prev.map(i => i._id === updated._id ? updated : i))
    setSelected(updated)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-hairline bg-paper-elevated px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">Testimonials</h1>
            <p className="mt-0.5 text-xs text-ink-faint">Review and approve user testimonials for the landing page</p>
          </div>
          <button onClick={() => load(1)} className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total"    value={stats.total}                    Icon={MessageSquareQuote} accent="text-brand"      bg="bg-brand-tint"   />
            <StatCard label="Pending"  value={stats.byStatus.pending ?? 0}   sub="awaiting review"     Icon={Clock}              accent="text-amber-600"  bg="bg-amber-50"     />
            <StatCard label="Approved" value={stats.byStatus.approved ?? 0}  sub="live on landing"     Icon={CheckCircle2}       accent="text-emerald-600" bg="bg-emerald-50"  />
            <StatCard label="Avg. Rating" value={stats.avgRating ? stats.avgRating.toFixed(1) : '—'} sub="out of 5" Icon={Star} accent="text-amber-500"  bg="bg-amber-50"     />
          </div>
        )}

        {/* Status filter pills */}
        <div className="flex gap-2">
          {[
            { value: '',         label: 'All' },
            { value: 'pending',  label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-[11px] font-medium transition-all',
                statusFilter === opt.value
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-brand',
              )}
            >
              {opt.label}
              {stats && opt.value && (
                <span className="ml-1 font-bold">{stats.byStatus[opt.value] ?? 0}</span>
              )}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-hairline" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Quote className="mb-3 h-10 w-10 text-ink-faint/30" />
            <p className="text-sm font-semibold text-ink">No testimonials found</p>
            <p className="mt-1 text-xs text-ink-faint">Adjust the filter or wait for users to submit</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md',
                  selected?._id === item._id
                    ? 'border-brand/40 bg-brand/5'
                    : item.status === 'approved'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : item.status === 'rejected'
                        ? 'border-red-100 bg-red-50/20 opacity-70'
                        : 'border-hairline bg-white',
                )}
                onClick={() => setSelected(item)}
              >
                {/* Featured pin */}
                {item.featured && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5">
                    <Pin className="h-2.5 w-2.5 text-brand" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand">Featured</span>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-hairline" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand ring-1 ring-brand/20">
                      {initials(item.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-ink">{item.name}</p>
                    {item.role && <p className="truncate text-[10px] text-ink-faint">{item.role}</p>}
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {/* Stars */}
                <StarRow rating={item.rating} />

                {/* Content */}
                <p className="flex-1 text-[12px] leading-relaxed text-ink-muted line-clamp-3">
                  &ldquo;{item.content}&rdquo;
                </p>

                {/* Footer actions */}
                <div className="flex items-center justify-between border-t border-hairline pt-3">
                  <p className="text-[10px] text-ink-faint">{timeAgo(item.createdAt)}</p>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {item.status !== 'approved' && (
                      <button
                        onClick={e => { e.stopPropagation(); quickApprove(item._id, 'approved') }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Approve"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        onClick={e => { e.stopPropagation(); quickApprove(item._id, 'rejected') }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(item._id) }}
                      disabled={deleting === item._id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint/40 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
                      title="Delete"
                    >
                      {deleting === item._id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
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

      {/* Detail drawer */}
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

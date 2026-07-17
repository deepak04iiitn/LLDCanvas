'use client'

import { useEffect, useState, useCallback } from 'react'
import { Layers, Search, ToggleLeft, ToggleRight, BookmarkCheck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { adminApi, type AdminRevisionNote } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50  text-amber-700  border-amber-200',
  advanced:     'bg-red-50    text-red-700    border-red-200',
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

export default function AdminRevisionPage() {
  const [notes,       setNotes]       = useState<AdminRevisionNote[]>([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState<string | null>(null)
  const [q,           setQ]           = useState('')
  const [draftQ,      setDraftQ]      = useState('')
  const [category,    setCategory]    = useState('')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await adminApi.revision.list({ page: p, limit: 20, q, category })
      setNotes(data.notes)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setLoading(false) }
  }, [q, category])

  useEffect(() => { load(1) }, [load])

  async function handleToggle(id: string) {
    setToggling(id)
    try {
      const res = await adminApi.revision.toggle(id)
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isActive: res.isActive } : n))
    } catch { /* no-op */ }
    finally { setToggling(null) }
  }

  function search() { setQ(draftQ) }

  const active   = notes.filter(n => n.isActive).length
  const inactive = notes.filter(n => !n.isActive).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Revision Notes</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Manage quick revision notes and toggle visibility</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
            <p className="text-lg font-bold text-brand">{total}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Total</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-emerald-600">{active}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Active</p>
          </div>
          <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
            <p className="text-lg font-bold text-ink-faint">{inactive}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Inactive</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search notes…"
            value={draftQ}
            onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <input
          type="text"
          placeholder="Filter by category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm outline-none focus:border-brand w-40"
        />
        <button
          onClick={search}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-hairline/40">
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">#</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Title</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Category</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Difficulty</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Revised by</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Bookmarked</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Added</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-hairline">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : notes.map((n, i) => (
              <tr key={n.id} className={cn('border-b border-hairline transition hover:bg-hairline/30', !n.isActive && 'opacity-50')}>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-ink">{n.title}</p>
                    {n.tags.length > 0 && (
                      <p className="text-[10px] text-ink-faint mt-0.5">{n.tags.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted capitalize">{n.category}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                    DIFFICULTY_COLORS[n.difficulty] ?? 'bg-hairline text-ink-faint border-hairline',
                  )}>
                    {n.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold text-ink">
                    <RotateCcw size={10} className="text-violet-500" /> {n.revised}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold text-ink">
                    <BookmarkCheck size={10} className="text-amber-500" /> {n.bookmarked}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-faint">
                  {n.createdAt ? format(parseISO(n.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(n.id)}
                    disabled={toggling === n.id}
                    className="flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50"
                  >
                    {n.isActive
                      ? <><ToggleRight size={14} className="text-emerald-500" /> Active</>
                      : <><ToggleLeft  size={14} className="text-ink-faint"   /> Inactive</>
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && notes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Layers className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No revision notes found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-faint">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline transition hover:bg-hairline disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-ink">Page {page} of {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline transition hover:bg-hairline disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

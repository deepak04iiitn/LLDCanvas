'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Bookmark, CheckCircle2, BookOpen, BarChart3, X, Layers } from 'lucide-react'
import { RevisionNoteSummary, RevisionStats } from '@/types'
import { api } from '@/lib/api'
import { NoteDrawer } from '@/components/revision/NoteDrawer'
import { AppShell } from '@/components/dashboard/AppShell'
import { cn } from '@/lib/utils'

// ── constants ─────────────────────────────────────────────────────────────────

const DIFF_ORDER = { basic: 0, intermediate: 1, advanced: 2 }

const DIFF_META = {
  basic:        { label: 'Basic',        dot: 'bg-emerald-400', color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-200' },
  intermediate: { label: 'Intermediate', dot: 'bg-amber-400',   color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-200'   },
  advanced:     { label: 'Advanced',     dot: 'bg-red-400',     color: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-200'     },
}

// ── sub-components ────────────────────────────────────────────────────────────

function DiffBadge({ d }: { d: 'basic' | 'intermediate' | 'advanced' }) {
  const m = DIFF_META[d]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-mono font-bold uppercase tracking-wider ring-1 px-2 py-0.5 text-[9px]',
      m.bg, m.color, m.ring,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

function NoteCard({
  note,
  onClick,
  onBookmarkToggle,
}: {
  note: RevisionNoteSummary
  onClick: () => void
  onBookmarkToggle: (slug: string, bookmarked: boolean) => void
}) {
  const [bookmarked, setBookmarked] = useState(note.bookmarked)
  const [toggling, setToggling]     = useState(false)

  async function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      const { bookmarked: next } = await api.revision.toggleBookmark(note.slug)
      setBookmarked(next)
      onBookmarkToggle(note.slug, next)
    } finally {
      setToggling(false)
    }
  }

  const isRevised = note.myStatus === 'revised'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border bg-paper-elevated p-5 cursor-pointer',
        'transition-all duration-200 hover:-translate-y-0.5',
        'hover:border-hairline-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        isRevised
          ? 'border-brand/20 shadow-[0_0_0_1px_rgba(var(--color-brand-rgb),0.08)]'
          : 'border-hairline shadow-[0_1px_6px_rgba(0,0,0,0.04)]',
      )}
    >
      {/* Revised accent stripe */}
      {isRevised && (
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-brand" />
      )}

      {/* Top: difficulty + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <DiffBadge d={note.difficulty} />
        <div className="flex items-center gap-1.5">
          {isRevised && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand">
              <CheckCircle2 className="h-3 w-3" /> Revised
            </span>
          )}
          <button
            onClick={handleBookmark}
            className={cn(
              'rounded-md p-1 transition-colors',
              bookmarked
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-ink-faint opacity-0 group-hover:opacity-100 hover:text-amber-500',
            )}
          >
            <Bookmark size={13} className={bookmarked ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Title + summary */}
      <div>
        <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {note.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
          {note.summary}
        </p>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {note.tags.slice(0, 4).map(t => (
            <span key={t} className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
              {t}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="font-mono text-[10px] text-ink-faint">+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <span className="rounded-md bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
          {note.category}
        </span>
        <span className="text-xs font-medium text-ink-muted transition-colors group-hover:text-ink">
          Read →
        </span>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper-elevated px-4 py-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-mono text-xl font-black text-ink tabular-nums leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] text-ink-faint">{label}</p>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-hairline bg-paper-elevated" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl border border-hairline bg-paper-elevated" />
        ))}
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function RevisionPage() {
  const [notes, setNotes]           = useState<RevisionNoteSummary[]>([])
  const [stats, setStats]           = useState<RevisionStats | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading]       = useState(true)

  // filters
  const [query, setQuery]           = useState('')
  const [activeCategory, setCategory] = useState<string | null>(null)
  const [activeDiff, setDiff]       = useState<string | null>(null)
  const [bookmarkedOnly, setBookOnly] = useState(false)

  // drawer
  const [openSlug, setOpenSlug]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.revision.list(),
      api.revision.myStats(),
      api.revision.categories(),
    ]).then(([{ notes: n }, { stats: s }, { categories: c }]) => {
      setNotes(n)
      setStats(s)
      setCategories(c)
    }).finally(() => setLoading(false))
  }, [])

  function handleRevised(slug: string) {
    setNotes(ns => ns.map(n => n.slug === slug ? { ...n, myStatus: 'revised' } : n))
    setStats(s => s ? { ...s, revised: s.revised + 1 } : s)
  }

  function handleBookmarkToggle(slug: string, bm: boolean) {
    setNotes(ns => ns.map(n => n.slug === slug ? { ...n, bookmarked: bm } : n))
    setStats(s => s ? { ...s, bookmarked: s.bookmarked + (bm ? 1 : -1) } : s)
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return notes
      .filter(n => {
        if (q && !n.title.toLowerCase().includes(q) &&
            !n.summary.toLowerCase().includes(q) &&
            !n.tags.some(t => t.toLowerCase().includes(q))) return false
        if (activeCategory && n.category !== activeCategory) return false
        if (activeDiff && n.difficulty !== activeDiff) return false
        if (bookmarkedOnly && !n.bookmarked) return false
        return true
      })
      .sort((a, b) => {
        const cat = a.category.localeCompare(b.category)
        if (cat !== 0) return cat
        const diff = DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
        if (diff !== 0) return diff
        return a.order - b.order
      })
  }, [notes, query, activeCategory, activeDiff, bookmarkedOnly])

  const grouped = useMemo(() => {
    const map = new Map<string, RevisionNoteSummary[]>()
    for (const n of filtered) {
      if (!map.has(n.category)) map.set(n.category, [])
      map.get(n.category)!.push(n)
    }
    return [...map.entries()]
  }, [filtered])

  const progressPct = stats ? Math.round((stats.revised / Math.max(stats.total, 1)) * 100) : 0
  const hasFilters  = !!(query || activeCategory || activeDiff || bookmarkedOnly)

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* ── Masthead ─────────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-hairline px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Study
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-ink sm:text-[2.75rem]">
              Quick Revision Notes
            </h1>
            {!loading && stats && (
              <p className="mt-4 text-[15px] text-ink-muted">
                <span className="font-mono font-semibold text-ink">{stats.revised}</span> of{' '}
                <span className="font-mono font-semibold text-ink">{stats.total}</span> revised
                {stats.bookmarked > 0 && (
                  <> · <span className="font-mono font-semibold text-ink">{stats.bookmarked}</span> bookmarked</>
                )}
                {progressPct > 0 && (
                  <> · <span className="font-mono font-semibold text-brand">{progressPct}% complete</span></>
                )}
              </p>
            )}
          </div>
        </header>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-4xl space-y-8">

            {loading ? <Skeleton /> : (
              <>
                {/* Stats row */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Total Notes"  value={stats.total}      icon={BookOpen}     accent="bg-brand-tint text-brand" />
                    <StatCard label="Revised"       value={stats.revised}    icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
                    <StatCard label="Bookmarked"    value={stats.bookmarked} icon={Bookmark}     accent="bg-amber-50 text-amber-600" />
                    <StatCard label="Progress"      value={`${progressPct}%`} icon={BarChart3}   accent="bg-violet-50 text-violet-600" />
                  </div>
                )}

                {/* Progress bar */}
                {stats && stats.total > 0 && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-ink-faint">Revision progress</span>
                      <span className="font-mono text-[11px] text-ink-faint">{stats.revised}/{stats.total}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-hairline">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Filter bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-paper-elevated p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                  {/* Search + difficulty + bookmark */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                      <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search concepts, tags…"
                        className="w-full rounded-xl border border-hairline bg-paper py-2 pl-8 pr-8 text-sm text-ink outline-none
                                   placeholder:text-ink-faint focus:border-brand transition-colors"
                      />
                      {query && (
                        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      {(['basic', 'intermediate', 'advanced'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDiff(activeDiff === d ? null : d)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full font-mono font-bold uppercase tracking-wider ring-1 px-2 py-1 text-[9px] transition-all',
                            activeDiff === d
                              ? `${DIFF_META[d].bg} ${DIFF_META[d].color} ${DIFF_META[d].ring}`
                              : 'bg-paper text-ink-faint ring-hairline hover:ring-hairline-strong',
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', DIFF_META[d].dot)} />
                          {DIFF_META[d].label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setBookOnly(v => !v)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                        bookmarkedOnly
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-hairline bg-paper text-ink-faint hover:border-hairline-strong hover:text-ink',
                      )}
                    >
                      <Bookmark size={12} className={bookmarkedOnly ? 'fill-current' : ''} />
                      Bookmarks
                    </button>
                  </div>

                  {/* Category chips */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-hairline pt-3">
                      <button
                        onClick={() => setCategory(null)}
                        className={cn(
                          'rounded-full border px-3 py-1 font-mono text-[10px] font-medium transition-all',
                          !activeCategory
                            ? 'border-brand bg-brand-tint text-brand'
                            : 'border-hairline bg-paper text-ink-faint hover:border-hairline-strong hover:text-ink',
                        )}
                      >
                        All
                      </button>
                      {categories.map(c => (
                        <button
                          key={c}
                          onClick={() => setCategory(activeCategory === c ? null : c)}
                          className={cn(
                            'rounded-full border px-3 py-1 font-mono text-[10px] font-medium transition-all',
                            activeCategory === c
                              ? 'border-brand bg-brand-tint text-brand'
                              : 'border-hairline bg-paper text-ink-faint hover:border-hairline-strong hover:text-ink',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results meta */}
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] text-ink-faint">
                    Showing {filtered.length} of {notes.length} notes
                  </p>
                  {hasFilters && (
                    <button
                      onClick={() => { setQuery(''); setCategory(null); setDiff(null); setBookOnly(false) }}
                      className="font-mono text-[11px] text-brand hover:underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Grouped grid */}
                {grouped.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Layers className="mb-3 h-8 w-8 text-ink-faint/40" strokeWidth={1.5} />
                    <p className="text-sm text-ink-faint">No notes match your filters.</p>
                    {hasFilters && (
                      <button
                        onClick={() => { setQuery(''); setCategory(null); setDiff(null); setBookOnly(false) }}
                        className="mt-2 text-xs text-brand hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10">
                    {grouped.map(([category, catNotes]) => (
                      <section key={category}>
                        <div className="mb-4 flex items-center gap-4">
                          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
                            {category}
                          </h2>
                          <div className="flex-1 h-px bg-hairline" />
                          <span className="font-mono text-[10px] text-ink-faint">{catNotes.length}</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {catNotes.map(note => (
                            <NoteCard
                              key={note.slug}
                              note={note}
                              onClick={() => setOpenSlug(note.slug)}
                              onBookmarkToggle={handleBookmarkToggle}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <NoteDrawer
        slug={openSlug}
        onClose={() => setOpenSlug(null)}
        onRevised={handleRevised}
        onBookmarkToggle={handleBookmarkToggle}
      />
    </AppShell>
  )
}

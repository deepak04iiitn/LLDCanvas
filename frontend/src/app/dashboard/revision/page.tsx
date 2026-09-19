'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import {
  Search,
  Bookmark,
  CheckCircle2,
  X,
  Layers,
  Lock,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { RevisionNoteSummary, RevisionStats } from '@/types'
import { api } from '@/lib/api'
import { NoteDrawer } from '@/components/revision/NoteDrawer'
import { AppShell } from '@/components/dashboard/AppShell'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'
import { toast } from 'sonner'

const DIFF_ORDER = { basic: 0, intermediate: 1, advanced: 2 }

const DIFF_META = {
  basic:        { label: 'Basic',        color: 'text-emerald-700', bar: 'bg-emerald-500' },
  intermediate: { label: 'Intermediate', color: 'text-amber-700',   bar: 'bg-amber-500' },
  advanced:     { label: 'Advanced',     color: 'text-red-700',     bar: 'bg-red-500' },
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-hairline" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-sm font-semibold tabular-nums text-ink">{value}%</span>
      </div>
    </div>
  )
}

function NoteRow({
  note,
  index,
  onClick,
  onBookmarkToggle,
  canBookmark = true,
}: {
  note: RevisionNoteSummary
  index: number
  onClick: () => void
  onBookmarkToggle: (slug: string, bookmarked: boolean) => void
  canBookmark?: boolean
}) {
  const [bookmarked, setBookmarked] = useState(note.bookmarked)
  const [toggling, setToggling] = useState(false)
  const isRevised = note.myStatus === 'revised'
  const dm = DIFF_META[note.difficulty]

  async function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    if (!canBookmark) {
      toast.error('Bookmarks require a Pro plan', { description: 'Upgrade to save your favourites.' })
      return
    }
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

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.2) }}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group flex w-full cursor-pointer gap-4 rounded-xl border border-transparent px-4 py-4 text-left transition-all sm:gap-5 sm:px-5',
        'hover:border-hairline hover:bg-paper-elevated',
        isRevised && 'bg-brand-tint/25',
      )}
    >
      <span className="hidden w-7 shrink-0 pt-1 font-mono text-[11px] tabular-nums text-ink-faint sm:block">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.12em]', dm.color)}>
            {dm.label}
          </span>
          {isRevised && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
              <CheckCircle2 className="h-3 w-3" /> Revised
            </span>
          )}
          {bookmarked && (
            <Bookmark className="h-3 w-3 fill-amber-400 text-amber-400" />
          )}
        </div>

        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand sm:text-base">
          {note.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {note.summary}
        </p>

        {note.tags.length > 0 && (
          <p className="mt-2.5 font-mono text-[10px] text-ink-faint">
            {note.tags.slice(0, 4).join(' · ')}
            {note.tags.length > 4 && ` · +${note.tags.length - 4}`}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch py-0.5">
        {canBookmark ? (
          <button
            type="button"
            onClick={handleBookmark}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              bookmarked
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-ink-faint opacity-0 hover:bg-hairline hover:text-amber-500 group-hover:opacity-100',
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} />
          </button>
        ) : (
          <span />
        )}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-faint transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-paper">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl px-4 py-5">
          <div className="hidden h-4 w-7 animate-pulse rounded bg-hairline sm:block" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-24 animate-pulse rounded bg-hairline" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-hairline" />
            <div className="h-3.5 w-full max-w-md animate-pulse rounded bg-hairline/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RevisionPage() {
  const { isFree } = usePlan()
  const [notes, setNotes] = useState<RevisionNoteSummary[]>([])
  const [stats, setStats] = useState<RevisionStats | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [activeCategory, setCategory] = useState<string | null>(null)
  const [activeDiff, setDiff] = useState<string | null>(null)
  const [bookmarkedOnly, setBookOnly] = useState(false)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!catOpen) return
    function handleOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [catOpen])

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
    setNotes(ns => ns.map(n => (n.slug === slug ? { ...n, myStatus: 'revised' } : n)))
    setStats(s => (s ? { ...s, revised: s.revised + 1 } : s))
  }

  function handleBookmarkToggle(slug: string, bm: boolean) {
    setNotes(ns => ns.map(n => (n.slug === slug ? { ...n, bookmarked: bm } : n)))
    setStats(s => (s ? { ...s, bookmarked: s.bookmarked + (bm ? 1 : -1) } : s))
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
  const hasFilters = !!(query || activeCategory || activeDiff || bookmarkedOnly)

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const n of notes) map.set(n.category, (map.get(n.category) ?? 0) + 1)
    return map
  }, [notes])

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* Compact masthead */}
        <header className="shrink-0 border-b border-hairline px-6 py-5 sm:px-10 sm:py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-ink sm:text-[2rem]">
                  Quick Revision
                </h1>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  Study
                </span>
              </div>
              {!loading && stats && (
                <p className="mt-2 font-mono text-[12px] text-ink-faint">
                  <span className="font-semibold text-ink">{stats.revised}</span>/{stats.total} revised
                  <span className="mx-1.5 text-hairline-strong">·</span>
                  <span className="font-semibold text-ink">{stats.bookmarked}</span> bookmarked
                  <span className="mx-1.5 text-hairline-strong">·</span>
                  <span className="font-semibold text-ink">{stats.total}</span> notes
                </p>
              )}
            </div>

            {!loading && stats && (
              <div className="hidden items-center gap-5 sm:flex">
                <div className="w-36">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Progress</span>
                    <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                      {stats.revised}/{stats.total}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-hairline">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <ProgressRing value={progressPct} />
              </div>
            )}
          </div>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-10">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">

            {/* Left filter rail */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="space-y-6">
                <div>
                  <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Find
                  </p>
                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search notes…"
                      className="w-full border-b border-hairline bg-transparent py-2 pl-5 pr-6 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Difficulty
                  </p>
                  <nav className="flex gap-1 overflow-x-auto border-b border-hairline pb-px lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-b-0 lg:border-l lg:border-hairline lg:pb-0">
                    <button
                      type="button"
                      onClick={() => setDiff(null)}
                      className={cn(
                        'relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors lg:pl-4',
                        !activeDiff ? 'font-medium text-ink' : 'text-ink-faint hover:text-ink-muted',
                      )}
                    >
                      {!activeDiff && (
                        <motion.span
                          layoutId="revDiffRail"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-brand lg:inset-y-1.5 lg:left-0 lg:right-auto lg:bottom-auto lg:w-0.5"
                        />
                      )}
                      <span className="flex-1">All</span>
                    </button>
                    {(['basic', 'intermediate', 'advanced'] as const).map(d => {
                      const active = activeDiff === d
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiff(active ? null : d)}
                          className={cn(
                            'relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-left text-sm capitalize transition-colors lg:pl-4',
                            active ? 'font-medium text-ink' : 'text-ink-faint hover:text-ink-muted',
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="revDiffRail"
                              className="absolute inset-x-0 bottom-0 h-0.5 bg-brand lg:inset-y-1.5 lg:left-0 lg:right-auto lg:bottom-auto lg:w-0.5"
                            />
                          )}
                          <span className={cn('flex-1', active && DIFF_META[d].color)}>
                            {DIFF_META[d].label}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {categories.length > 0 && (
                  <div>
                    <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                      Category
                    </p>
                    <div className="relative" ref={catRef}>
                      <button
                        type="button"
                        onClick={() => setCatOpen(v => !v)}
                        className={cn(
                          'flex w-full items-center justify-between border-b py-2 text-left text-sm transition-colors',
                          activeCategory
                            ? 'border-brand text-brand'
                            : 'border-hairline text-ink-muted hover:text-ink',
                        )}
                      >
                        <span className="truncate">{activeCategory || 'All categories'}</span>
                        {activeCategory ? (
                          <X
                            className="h-3.5 w-3.5 shrink-0"
                            onClick={e => {
                              e.stopPropagation()
                              setCategory(null)
                            }}
                          />
                        ) : (
                          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', catOpen && 'rotate-180')} />
                        )}
                      </button>

                      {catOpen && (
                        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-56 overflow-y-auto rounded-lg border border-hairline bg-paper p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => { setCategory(null); setCatOpen(false) }}
                            className={cn(
                              'flex w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                              !activeCategory ? 'bg-brand-tint font-medium text-brand' : 'text-ink-muted hover:bg-hairline/50',
                            )}
                          >
                            All categories
                          </button>
                          {categories.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => { setCategory(c); setCatOpen(false) }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                                activeCategory === c ? 'bg-brand-tint font-medium text-brand' : 'text-ink-muted hover:bg-hairline/50',
                              )}
                            >
                              {c}
                              <span className="font-mono text-[10px] text-ink-faint">
                                {categoryCounts.get(c) ?? 0}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  {isFree && (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink"
                    >
                      <Lock className="h-3 w-3 text-amber-400" />
                      Bookmarks · Pro
                    </Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Notes list */}
            <section className="min-w-0">
              {loading ? (
                <Skeleton />
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-hairline pb-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                      {filtered.length} note{filtered.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      {!isFree && (
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted select-none">
                          <input
                            type="checkbox"
                            checked={bookmarkedOnly}
                            onChange={e => setBookOnly(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-hairline-strong accent-brand"
                          />
                          <span className="inline-flex items-center gap-1.5">
                            <Bookmark className={cn('h-3.5 w-3.5', bookmarkedOnly && 'fill-amber-400 text-amber-500')} />
                            Bookmarks only
                          </span>
                        </label>
                      )}
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={() => { setQuery(''); setCategory(null); setDiff(null); setBookOnly(false) }}
                          className="font-mono text-[11px] text-ink-faint transition-colors hover:text-ink"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  </div>

                  {grouped.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Layers className="mb-3 h-8 w-8 text-ink-faint/40" strokeWidth={1.5} />
                      <p className="font-serif text-xl text-ink">No matches</p>
                      <p className="mt-2 text-sm text-ink-faint">Try another topic, difficulty, or search.</p>
                    </div>
                  ) : (
                    grouped.map(([category, catNotes]) => (
                      <div key={category}>
                        <div className="mb-2 flex items-baseline gap-3 px-1 sm:px-0">
                          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                            {category}
                          </h2>
                          <span className="font-mono text-[10px] tabular-nums text-ink-faint/60">
                            {catNotes.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {catNotes.map((note, i) => (
                            <NoteRow
                              key={note.slug}
                              note={note}
                              index={i}
                              onClick={() => setOpenSlug(note.slug)}
                              onBookmarkToggle={handleBookmarkToggle}
                              canBookmark={!isFree}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <NoteDrawer
        slug={openSlug}
        onClose={() => setOpenSlug(null)}
        onRevised={handleRevised}
        onBookmarkToggle={handleBookmarkToggle}
        canBookmark={!isFree}
      />
    </AppShell>
  )
}

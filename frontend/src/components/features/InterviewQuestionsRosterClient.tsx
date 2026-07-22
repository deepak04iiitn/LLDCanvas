'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ArrowUpRight, ChevronUp, ChevronDown,
  ChevronsUpDown, ChevronLeft, ChevronRight, ListFilter, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIFF_META, type PublicProblemSummary } from '@/lib/public-api'
import { Reveal } from '@/components/features/Reveal'

type Diff    = 'all' | 'easy' | 'medium' | 'hard'
type SortKey = 'index' | 'difficulty' | 'category'
type SortDir = 'asc' | 'desc'

const DIFF_ORDER  = { easy: 0, medium: 1, hard: 2 }
const DIFF_STRIPE = { easy: 'bg-emerald-400', medium: 'bg-amber-400', hard: 'bg-red-400' }
const DIFF_TEXT   = { easy: 'text-emerald-600', medium: 'text-amber-600', hard: 'text-red-500' }

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ─── Marquee ticker ───────────────────────────────────────────────────────────

function Ticker({ titles }: { titles: string[] }) {
  const doubled = [...titles, ...titles]
  return (
    <div className="overflow-hidden py-2 select-none">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: titles.length * 2.5, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="font-mono text-[11px] text-ink-faint/50">
            {t} <span className="text-brand/30">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / 1000, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return <>{count}</>
}

// ─── Category dropdown ────────────────────────────────────────────────────────

function CategoryDropdown({
  categories,
  categoryCounts,
  value,
  onChange,
}: {
  categories: string[]
  categoryCounts: Record<string, number>
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen]   = useState(false)
  const [search, setSrch] = useState('')
  const ref               = useRef<HTMLDivElement>(null)

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(
    () => categories.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  )

  const label = value || 'All Categories'

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-all',
          open || value
            ? 'border-brand bg-brand/5 text-brand'
            : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/30 hover:text-ink',
        )}
      >
        <ListFilter size={13} className="shrink-0" />
        <span className="max-w-40 truncate">{label}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onChange('') }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onChange('') } }}
            className="ml-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand/15 text-brand hover:bg-brand/25"
          >
            <X size={9} />
          </span>
        )}
        {!value && (
          <ChevronDown
            size={13}
            className={cn('shrink-0 transition-transform', open && 'rotate-180')}
          />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-xl border border-hairline bg-white shadow-xl shadow-ink/8"
          >
            {/* Search inside dropdown */}
            <div className="border-b border-hairline p-2">
              <div className="relative">
                <Search size={12} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSrch(e.target.value)}
                  placeholder="Search categories…"
                  className="h-8 w-full rounded-lg border border-hairline bg-paper-elevated pl-7 pr-3 font-mono text-[12px] outline-none transition focus:border-brand"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto py-1">
              {/* All option */}
              <button
                onClick={() => { onChange(''); setOpen(false); setSrch('') }}
                className={cn(
                  'flex w-full items-center justify-between px-3.5 py-2 text-left font-mono text-[12px] transition-colors',
                  !value ? 'bg-brand/8 font-bold text-brand' : 'text-ink-muted hover:bg-paper-elevated',
                )}
              >
                <span>All Categories</span>
                <span className="font-mono text-[10px] text-ink-faint">{categories.reduce((s, c) => s + (categoryCounts[c] ?? 0), 0)}</span>
              </button>

              {filtered.length === 0 && (
                <p className="py-4 text-center font-mono text-[11px] text-ink-faint">No match</p>
              )}

              {filtered.map(c => (
                <button
                  key={c}
                  onClick={() => { onChange(c); setOpen(false); setSrch('') }}
                  className={cn(
                    'flex w-full items-center justify-between px-3.5 py-2 text-left font-mono text-[12px] transition-colors',
                    value === c ? 'bg-brand/8 font-bold text-brand' : 'text-ink hover:bg-paper-elevated',
                  )}
                >
                  <span>{c}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{categoryCounts[c] ?? 0}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
}: {
  total: number
  page: number
  pageSize: number
  onPage: (p: number) => void
  onPageSize: (s: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)

  // Build page number pills (show up to 5)
  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-paper-elevated/50 px-5 py-3">
      {/* Left: count info */}
      <span className="font-mono text-[11px] text-ink-faint">
        {from}–{to} of {total} problems
      </span>

      {/* Center: page pills */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline bg-paper text-ink-faint transition-all hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={13} />
        </button>

        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="px-1 font-mono text-[11px] text-ink-faint">…</span>
            : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={cn(
                  'flex h-7 min-w-7 items-center justify-center rounded-md border px-2 font-mono text-[11px] transition-all',
                  page === p
                    ? 'border-brand bg-brand font-bold text-brand-foreground'
                    : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-brand',
                )}
              >
                {p}
              </button>
            )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline bg-paper text-ink-faint transition-all hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Right: page size selector */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-ink-faint">Rows</span>
        <div className="flex gap-1">
          {PAGE_SIZE_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { onPageSize(s); onPage(1) }}
              className={cn(
                'h-7 rounded-md border px-2.5 font-mono text-[10px] font-medium transition-all',
                pageSize === s
                  ? 'border-brand bg-brand text-brand-foreground'
                  : 'border-hairline bg-paper text-ink-muted hover:border-brand/30',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Sort icon helper ─────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown size={11} className="text-ink-faint/40" />
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-brand" />
    : <ChevronDown size={11} className="text-brand" />
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InterviewQuestionsRosterClient({ problems }: { problems: PublicProblemSummary[] }) {
  const [q,        setQ]       = useState('')
  const [diff,     setDiff]    = useState<Diff>('all')
  const [category, setCat]     = useState('')
  const [sortKey,  setSort]    = useState<SortKey>('index')
  const [sortDir,  setSDir]    = useState<SortDir>('asc')
  const [page,     setPage]    = useState(1)
  const [pageSize, setPageSz]  = useState(20)

  const counts = useMemo(() => ({
    easy:   problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard:   problems.filter(p => p.difficulty === 'hard').length,
  }), [problems])

  const categories = useMemo(
    () => [...new Set(problems.map(p => p.category))].sort(),
    [problems],
  )

  const categoryCounts = useMemo(() =>
    Object.fromEntries(categories.map(c => [c, problems.filter(p => p.category === c).length])),
    [categories, problems],
  )

  // Reset page whenever filters change
  useEffect(() => { setPage(1) }, [q, diff, category, sortKey, sortDir, pageSize])

  const filtered = useMemo(() => {
    let list = problems.filter(p => {
      if (diff !== 'all' && p.difficulty !== diff) return false
      if (category && p.category !== category) return false
      if (q.trim() && !p.title.toLowerCase().includes(q.trim().toLowerCase())) return false
      return true
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'difficulty') cmp = DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [problems, diff, category, q, sortKey, sortDir])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  )

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(key); setSDir('asc') }
  }

  const hasFilters = diff !== 'all' || category || q.trim()

  const clearAll = useCallback(() => {
    setQ(''); setDiff('all'); setCat(''); setPage(1)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-0 sm:px-8 sm:pt-14">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">

            {/* Left */}
            <div>
              <Reveal>
                <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                  <span className="text-gold">¶04</span> — Practice Problems
                </p>
                <div className="flex items-end gap-4">
                  <p className="font-mono text-[clamp(4rem,10vw,7rem)] font-black leading-none tracking-tight text-brand tabular-nums">
                    <CountUp target={problems.length} />
                  </p>
                  <div className="mb-3">
                    <p className="font-serif text-xl font-medium leading-tight text-ink">
                      curated LLD<br />interview problems
                    </p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                  Every question that comes up in real Low-Level Design interviews -
                  Parking Lot to Uber, ATM to distributed rate limiters - with difficulty,
                  real-world context, and the companies known to ask it.
                </p>
              </Reveal>

              {/* Scoreboard stat row */}
              <Reveal delay={0.1}>
                <div className="mt-8 flex gap-0 overflow-hidden rounded-xl border border-hairline">
                  {[
                    { label: 'Easy',   count: counts.easy,   cls: 'text-emerald-600', bg: 'bg-emerald-50/60', d: 'easy'   as Diff },
                    { label: 'Medium', count: counts.medium, cls: 'text-amber-600',   bg: 'bg-amber-50/60',   d: 'medium' as Diff },
                    { label: 'Hard',   count: counts.hard,   cls: 'text-red-500',     bg: 'bg-red-50/60',     d: 'hard'   as Diff },
                  ].map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setDiff(cur => cur === s.d ? 'all' : s.d)}
                      className={cn(
                        'flex-1 px-5 py-4 text-center transition-all hover:brightness-95',
                        i > 0 && 'border-l border-hairline',
                        diff === s.d ? s.bg : 'bg-paper-elevated/50',
                      )}
                    >
                      <p className={cn('font-mono text-2xl font-black tabular-nums', s.cls)}>{s.count}</p>
                      <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-faint">{s.label}</p>
                    </button>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right: vertical index preview */}
            <Reveal delay={0.15} className="hidden lg:flex lg:flex-col lg:gap-2 lg:pb-2 lg:w-52">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint/40">Problem index</p>
              <div className="flex flex-col gap-1.5 overflow-hidden" style={{ maxHeight: 240 }}>
                {problems.slice(0, 14).map(p => (
                  <div key={p.slug} className="flex items-center gap-2">
                    <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DIFF_STRIPE[p.difficulty])} />
                    <span className="truncate font-mono text-[10px] text-ink-faint/60">{p.title}</span>
                  </div>
                ))}
                <div className="h-8 bg-linear-to-b from-transparent to-paper pointer-events-none" />
              </div>
            </Reveal>
          </div>

          {/* Marquee ticker */}
          <div className="mt-8 border-t border-hairline">
            <Ticker titles={problems.map(p => p.title)} />
          </div>
        </div>
      </section>

      {/* ═══ FILTERS + TABLE ════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">

        {/* Filter bar */}
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  <X size={12} />
                </button>
              )}
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search problems…"
                className="h-9 w-full rounded-lg border border-hairline-strong bg-paper pl-8 pr-7
                           font-mono text-sm outline-none transition
                           focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </div>

            {/* Category dropdown */}
            <CategoryDropdown
              categories={categories}
              categoryCounts={categoryCounts}
              value={category}
              onChange={setCat}
            />

            {/* Difficulty quick-pills */}
            <div className="flex items-center gap-1 rounded-lg border border-hairline bg-paper p-1">
              {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={cn(
                    'rounded-md px-3 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                    diff === d
                      ? 'bg-brand text-brand-foreground shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Clear all */}
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={clearAll}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 h-9 font-mono text-[11px] text-ink-muted hover:border-brand/30 hover:text-brand transition-colors"
              >
                <X size={11} /> Clear
              </motion.button>
            )}
          </div>
        </Reveal>

        {/* Table */}
        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-2xl border border-hairline">

            {/* Header row */}
            <div
              className="grid items-center border-b border-hairline bg-paper-elevated px-0 py-3"
              style={{ gridTemplateColumns: '4px 3rem 1fr 11rem 8rem' }}
            >
              <div />
              <span className="pl-4 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint">#</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint">Problem</span>
              <button
                onClick={() => toggleSort('category')}
                className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint hover:text-ink transition-colors"
              >
                Category <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} />
              </button>
              <button
                onClick={() => toggleSort('difficulty')}
                className="flex items-center gap-1 pr-5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint hover:text-ink transition-colors"
              >
                Level <SortIcon col="difficulty" sortKey={sortKey} sortDir={sortDir} />
              </button>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <Search size={24} className="text-ink-faint/30" />
                <p className="font-mono text-sm text-ink-faint">No problems match your filters.</p>
                <button onClick={clearAll} className="font-mono text-[12px] text-brand hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                <AnimatePresence mode="popLayout">
                  {paginated.map((p, i) => {
                    const globalIdx = problems.indexOf(p) + 1
                    return (
                      <motion.div
                        key={p.slug}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.2) }}
                      >
                        <Link
                          href={`/features/interview-questions/${p.slug}`}
                          className="group grid items-center transition-colors hover:bg-brand/3"
                          style={{ gridTemplateColumns: '4px 3rem 1fr 11rem 8rem' }}
                        >
                          {/* Difficulty stripe */}
                          <div className={cn('w-1 rounded-none self-stretch', DIFF_STRIPE[p.difficulty])} />

                          {/* Index */}
                          <span className="pl-4 font-mono text-[11px] text-ink-faint/40 tabular-nums">
                            {String(globalIdx).padStart(2, '0')}
                          </span>

                          {/* Title + companies */}
                          <div className="flex flex-col gap-0.5 py-4 pr-4">
                            <span className="text-[14px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                              {p.title}
                            </span>
                            {p.companies.length > 0 && (
                              <span className="font-mono text-[10px] text-ink-faint/55">
                                {p.companies.slice(0, 4).join(' · ')}
                              </span>
                            )}
                          </div>

                          {/* Category */}
                          <span className="hidden truncate pr-4 font-mono text-[11px] text-ink-faint sm:block">
                            {p.category}
                          </span>

                          {/* Level */}
                          <div className="flex items-center pr-5">
                            <span className={cn('font-mono text-[11px] font-bold', DIFF_TEXT[p.difficulty])}>
                              {DIFF_META[p.difficulty].label}
                            </span>
                            <ArrowUpRight
                              size={13}
                              className="ml-auto opacity-0 text-brand transition-opacity group-hover:opacity-100"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <Pagination
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSz}
              />
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}

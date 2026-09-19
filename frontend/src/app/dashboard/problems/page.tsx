'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Lock,
  ChevronDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { ProblemSummary } from '@/types'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const
type Diff = (typeof DIFFICULTIES)[number]

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-700', bar: 'bg-emerald-500', soft: 'bg-emerald-50' },
  medium: { label: 'Medium', color: 'text-amber-700',   bar: 'bg-amber-500',   soft: 'bg-amber-50' },
  hard:   { label: 'Hard',   color: 'text-red-700',     bar: 'bg-red-500',     soft: 'bg-red-50' },
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-semibold tabular-nums leading-none text-ink">
          {value}%
        </span>
      </div>
    </div>
  )
}

function ProblemRow({
  problem,
  index,
}: {
  problem: ProblemSummary
  index: number
}) {
  const isSolved = problem.myStatus === 'submitted'
  const isInProgress = problem.myStatus === 'in_progress'
  const dm = DIFF_META[problem.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.24) }}
    >
      <Link
        href={`/dashboard/problems/${problem.slug}`}
        className={cn(
          'group relative flex gap-4 overflow-hidden rounded-xl border border-transparent px-4 py-4 transition-all duration-200 sm:gap-5 sm:px-5',
          'hover:border-hairline hover:bg-paper-elevated',
          isSolved && 'bg-brand-tint/30',
          isInProgress && 'bg-amber-50/40',
        )}
      >
        <span className="hidden w-8 shrink-0 pt-1 font-mono text-[11px] tabular-nums text-ink-faint sm:block">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.12em]', dm.color)}>
              {dm.label}
            </span>
            <span className="text-ink-faint/40">·</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {problem.category}
            </span>
            {isSolved && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
                <CheckCircle2 className="h-3 w-3" /> Solved
              </span>
            )}
            {isInProgress && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                <Clock className="h-3 w-3" /> In progress
              </span>
            )}
          </div>

          <h3 className="font-serif text-[1.2rem] leading-snug tracking-tight text-ink transition-colors group-hover:text-brand sm:text-[1.35rem]">
            {problem.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 max-w-xl text-[13px] leading-relaxed text-ink-muted">
            {problem.description}
          </p>

          {problem.companies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {problem.companies.slice(0, 3).map(c => (
                <span
                  key={c}
                  className="font-mono text-[10px] text-ink-faint transition-colors group-hover:text-ink-muted"
                >
                  {c}
                </span>
              )).reduce<React.ReactNode[]>((acc, el, i) => {
                if (i > 0) acc.push(
                  <span key={`dot-${i}`} className="font-mono text-[10px] text-ink-faint/40">/</span>,
                )
                acc.push(el)
                return acc
              }, [])}
              {problem.companies.length > 3 && (
                <span className="font-mono text-[10px] text-ink-faint">
                  +{problem.companies.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch py-0.5">
          <span className="font-mono text-[10px] tabular-nums text-ink-faint">
            {problem.submissionCount}
            <span className="ml-1 hidden text-ink-faint/70 sm:inline">
              sol{problem.submissionCount !== 1 ? 's' : ''}
            </span>
          </span>
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-faint transition-all',
              'group-hover:border-brand group-hover:bg-brand group-hover:text-paper',
              isSolved && 'border-brand/30 text-brand',
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function LockedProblemRow({
  problem,
  index,
}: {
  problem: ProblemSummary
  index: number
}) {
  const dm = DIFF_META[problem.difficulty]

  return (
    <div className="relative flex gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-5 sm:px-5">
      <span className="hidden w-8 shrink-0 pt-1 font-mono text-[11px] tabular-nums text-ink-faint/40 sm:block">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1 opacity-40">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.12em]', dm.color)}>
            {dm.label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {problem.category}
          </span>
        </div>
        <h3 className="font-serif text-[1.2rem] leading-snug text-ink sm:text-[1.35rem]">
          {problem.title}
        </h3>
        <p className="mt-1.5 line-clamp-1 text-[13px] text-ink-muted">{problem.description}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-paper/75 backdrop-blur-[1.5px]">
        <div className="flex items-center gap-3 border border-hairline bg-paper px-4 py-2.5 shadow-sm">
          <Lock className="h-3.5 w-3.5 text-ink-faint" />
          <span className="text-xs text-ink-muted">Locked on your plan</span>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
          >
            Upgrade <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl px-4 py-5">
          <div className="hidden h-4 w-8 animate-pulse rounded bg-hairline sm:block" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-28 animate-pulse rounded bg-hairline" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-hairline" />
            <div className="h-3.5 w-full max-w-md animate-pulse rounded bg-hairline/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProblemsPage() {
  const { isFree, isUltimate } = usePlan()
  const [allProblems, setAllProblems] = useState<ProblemSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [diff, setDiff] = useState<Diff>('all')
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
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
    api.problems.categories().then(r => setCategories(r.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.problems.list({})
      .then(r => setAllProblems(r.problems))
      .catch(() => toast.error('Could not load problems'))
      .finally(() => setLoading(false))
  }, [])

  const problems = useMemo(() => {
    let list = allProblems
    if (diff !== 'all') list = list.filter(p => p.difficulty === diff)
    if (category) list = list.filter(p => p.category === category)
    if (q.trim()) list = list.filter(p => p.title.toLowerCase().includes(q.toLowerCase()))
    return list
  }, [allProblems, diff, category, q])

  const total = allProblems.length
  const solved = allProblems.filter(p => p.myStatus === 'submitted').length
  const inProg = allProblems.filter(p => p.myStatus === 'in_progress').length
  const easyDone = allProblems.filter(p => p.difficulty === 'easy' && p.myStatus === 'submitted').length
  const mediumDone = allProblems.filter(p => p.difficulty === 'medium' && p.myStatus === 'submitted').length
  const hardDone = allProblems.filter(p => p.difficulty === 'hard' && p.myStatus === 'submitted').length
  const community = allProblems.reduce((a, p) => a + p.submissionCount, 0)
  const completion = total ? Math.round((solved / total) * 100) : 0

  const counts: Record<Diff, number> = {
    all: allProblems.length,
    easy: allProblems.filter(p => p.difficulty === 'easy').length,
    medium: allProblems.filter(p => p.difficulty === 'medium').length,
    hard: allProblems.filter(p => p.difficulty === 'hard').length,
  }

  const diffBars = [
    { key: 'easy' as const, done: easyDone, total: counts.easy },
    { key: 'medium' as const, done: mediumDone, total: counts.medium },
    { key: 'hard' as const, done: hardDone, total: counts.hard },
  ]

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* Masthead */}
        <header className="shrink-0 border-b border-hairline px-6 py-5 sm:px-10 sm:py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-ink sm:text-[2rem]">
                  Practice Problems
                </h1>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  Library
                </span>
              </div>
              {!loading && (
                <p className="mt-2 font-mono text-[12px] text-ink-faint">
                  <span className="font-semibold text-ink">{total}</span> problems
                  <span className="mx-1.5 text-hairline-strong">·</span>
                  <span className="font-semibold text-ink">{solved}</span> solved
                  {inProg > 0 && (
                    <>
                      <span className="mx-1.5 text-hairline-strong">·</span>
                      <span className="font-semibold text-ink">{inProg}</span> in progress
                    </>
                  )}
                  <span className="mx-1.5 text-hairline-strong">·</span>
                  <span className="font-semibold text-ink">{community.toLocaleString()}</span> solutions
                </p>
              )}
            </div>

            {!loading && (
              <div className="hidden items-center gap-5 sm:flex">
                <div className="flex items-center gap-4">
                  {diffBars.map(({ key, done, total: t }) => {
                    const pct = t ? Math.round((done / t) * 100) : 0
                    const m = DIFF_META[key]
                    return (
                      <div key={key} className="w-28">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-wider', m.color)}>
                            {m.label}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                            {done}/{t}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-hairline">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', m.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <ProgressRing value={completion} size={56} />
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
                    Difficulty
                  </p>
                  <nav className="flex gap-1 overflow-x-auto border-b border-hairline pb-px lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-b-0 lg:border-l lg:border-hairline lg:pb-0">
                    {DIFFICULTIES.map(d => {
                      const isLocked =
                        (isFree && (d === 'medium' || d === 'hard')) ||
                        (!isUltimate && d === 'hard')
                      const active = diff === d
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={isLocked}
                          onClick={() => !isLocked && setDiff(d)}
                          className={cn(
                            'relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-left text-sm capitalize transition-colors lg:pl-4',
                            isLocked && 'cursor-not-allowed text-ink-faint/35',
                            !isLocked && active && 'font-medium text-ink',
                            !isLocked && !active && 'text-ink-faint hover:text-ink-muted',
                          )}
                        >
                          {active && !isLocked && (
                            <motion.span
                              layoutId="problemsDiffRail"
                              className="absolute inset-x-0 bottom-0 h-0.5 bg-brand lg:inset-y-1.5 lg:left-0 lg:right-auto lg:bottom-auto lg:w-0.5"
                            />
                          )}
                          <span className="flex-1">{d}</span>
                          {isLocked ? (
                            <Lock className="h-3 w-3 text-amber-400" />
                          ) : (
                            <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                              {counts[d]}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Find
                  </p>
                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={q}
                      onChange={e => setQ(e.target.value)}
                      placeholder="Search problems…"
                      className="w-full border-b border-hairline bg-transparent py-2 pl-5 pr-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="relative" ref={catRef}>
                      <button
                        type="button"
                        onClick={() => setCatOpen(v => !v)}
                        className={cn(
                          'flex w-full items-center justify-between border-b py-2 text-left text-sm transition-colors',
                          category ? 'border-brand text-brand' : 'border-hairline text-ink-muted hover:text-ink',
                        )}
                      >
                        <span className="truncate">{category || 'All categories'}</span>
                        {category ? (
                          <X
                            className="h-3.5 w-3.5 shrink-0"
                            onClick={e => {
                              e.stopPropagation()
                              setCategory('')
                            }}
                          />
                        ) : (
                          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', catOpen && 'rotate-180')} />
                        )}
                      </button>

                      <AnimatePresence>
                        {catOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-56 overflow-y-auto rounded-lg border border-hairline bg-paper p-1 shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => { setCategory(''); setCatOpen(false) }}
                              className={cn(
                                'flex w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                                !category ? 'bg-brand-tint font-medium text-brand' : 'text-ink-muted hover:bg-hairline/50',
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
                                  category === c ? 'bg-brand-tint font-medium text-brand' : 'text-ink-muted hover:bg-hairline/50',
                                )}
                              >
                                {c}
                                <span className="font-mono text-[10px] text-ink-faint">
                                  {allProblems.filter(p => p.category === c).length}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {!isUltimate && (
                  <p className="text-[12px] leading-relaxed text-ink-faint">
                    {isFree ? (
                      <>
                        Free unlocks 10 Easy problems.{' '}
                        <Link href="/pricing" className="text-ink underline-offset-2 hover:underline">
                          See plans
                        </Link>
                      </>
                    ) : (
                      <>
                        Ultimate unlocks all Medium & Hard.{' '}
                        <Link href="/pricing" className="text-ink underline-offset-2 hover:underline">
                          Upgrade
                        </Link>
                      </>
                    )}
                  </p>
                )}
              </div>
            </aside>

            {/* Problem list */}
            <section className="min-w-0">
              {loading ? (
                <Skeleton />
              ) : problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="font-serif text-2xl text-ink">No matches</p>
                  <p className="mt-2 max-w-xs text-sm text-ink-faint">
                    Try another difficulty, category, or search term.
                  </p>
                  {(diff !== 'all' || category || q) && (
                    <button
                      type="button"
                      onClick={() => { setDiff('all'); setCategory(''); setQ('') }}
                      className="mt-5 text-sm font-medium text-brand hover:text-brand-hover"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-hairline pb-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                      {problems.length} problem{problems.length !== 1 ? 's' : ''}
                    </p>
                    {(category || q || diff !== 'all') && (
                      <button
                        type="button"
                        onClick={() => { setDiff('all'); setCategory(''); setQ('') }}
                        className="font-mono text-[11px] text-ink-faint transition-colors hover:text-ink"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {problems.map((p, i) =>
                      p.locked
                        ? <LockedProblemRow key={p._id} problem={p} index={i} />
                        : <ProblemRow key={p._id} problem={p} index={i} />,
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

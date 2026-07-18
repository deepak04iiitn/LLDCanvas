'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Search, BookOpen, CheckCircle2, Clock, ChevronRight,
  RefreshCw, Target, TrendingUp, Zap, Lock, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { ProblemSummary } from '@/types'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const
type Diff = (typeof DIFFICULTIES)[number]

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-200', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  hard:   { label: 'Hard',   color: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-200',     dot: 'bg-red-400'     },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty, size = 'sm' }: { difficulty: 'easy' | 'medium' | 'hard'; size?: 'xs' | 'sm' }) {
  const m = DIFF_META[difficulty]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-mono font-bold uppercase tracking-wider ring-1',
      m.bg, m.color, m.ring,
      size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

function StatusChip({ status }: { status: ProblemSummary['myStatus'] }) {
  if (!status) return null
  if (status === 'submitted') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand">
      <CheckCircle2 className="h-3 w-3" /> Solved
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-600">
      <Clock className="h-3 w-3" /> In progress
    </span>
  )
}

// ─── Problem card ─────────────────────────────────────────────────────────────

function ProblemCard({ problem }: { problem: ProblemSummary }) {
  const isSolved = problem.myStatus === 'submitted'
  const isInProgress = problem.myStatus === 'in_progress'

  return (
    <Link
      href={`/dashboard/problems/${problem.slug}`}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border bg-paper-elevated p-5',
        'transition-all duration-200 hover:-translate-y-0.5',
        'hover:border-hairline-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        isSolved
          ? 'border-brand/20 shadow-[0_0_0_1px_rgba(var(--color-brand-rgb),0.08)]'
          : 'border-hairline shadow-[0_1px_6px_rgba(0,0,0,0.04)]',
      )}
    >
      {/* Solved accent stripe */}
      {isSolved && (
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-brand" />
      )}

      {/* Top row: difficulty + status */}
      <div className="flex items-start justify-between gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <StatusChip status={problem.myStatus} />
      </div>

      {/* Title */}
      <div>
        <h3 className={cn(
          'text-[15px] font-semibold leading-snug transition-colors group-hover:text-brand',
          isSolved ? 'text-ink' : 'text-ink',
        )}>
          {problem.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
          {problem.description}
        </p>
      </div>

      {/* Companies */}
      {problem.companies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {problem.companies.slice(0, 3).map(c => (
            <span key={c} className="rounded-md border border-hairline bg-paper px-1.5 py-0.5
                                     font-mono text-[10px] text-ink-faint">
              {c}
            </span>
          ))}
          {problem.companies.length > 3 && (
            <span className="font-mono text-[10px] text-ink-faint">+{problem.companies.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: category + submission count + CTA */}
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            {problem.category}
          </span>
          <span className="font-mono text-[10px] text-ink-faint">
            ↑ {problem.submissionCount} solution{problem.submissionCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={cn(
          'flex items-center gap-1 text-xs font-medium transition-colors',
          isSolved ? 'text-brand' : isInProgress ? 'text-amber-600' : 'text-ink-muted group-hover:text-ink',
        )}>
          {isSolved ? 'View' : isInProgress ? 'Resume' : 'Start'}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper-elevated px-4 py-3.5
                    shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', accent)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-mono text-xl font-black text-ink tabular-nums leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] text-ink-faint">{label}</p>
      </div>
    </div>
  )
}

// ─── Locked Problem Card ──────────────────────────────────────────────────────

function LockedProblemCard({ problem }: { problem: ProblemSummary }) {
  const m = DIFF_META[problem.difficulty as keyof typeof DIFF_META]
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-hairline bg-paper-elevated/60 p-5 opacity-70 select-none">
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-paper/60 backdrop-blur-[2px]">
        <Lock className="mb-1.5 h-5 w-5 text-ink-muted" />
        <p className="text-xs font-medium text-ink-muted">Pro required</p>
        <Link href="/pricing" className="mt-2 flex items-center gap-1 rounded-lg bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors">
          Upgrade <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex items-start justify-between gap-2">
        {m && <DifficultyBadge difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'} />}
      </div>
      <h3 className="text-[15px] font-semibold leading-snug text-ink blur-[3px]">{problem.title}</h3>
      <p className="text-xs text-ink-faint line-clamp-2 blur-[2px]">{problem.description}</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-hairline" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-hairline/70" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  const { isFree } = usePlan()
  const [problems,   setProblems]   = useState<ProblemSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading,    setLoading]    = useState(true)
  const [diff,       setDiff]       = useState<Diff>('all')
  const [category,   setCategory]   = useState('')
  const [q,          setQ]          = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    api.problems.categories().then(r => setCategories(r.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.problems.list({
      difficulty: diff === 'all' ? undefined : diff,
      category:   category || undefined,
    })
      .then(r => setProblems(r.problems))
      .catch(() => toast.error('Could not load problems'))
      .finally(() => setLoading(false))
  }, [diff, category])

  function handleSearch(v: string) {
    setQ(v)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      api.problems.list({ q: v || undefined, difficulty: diff === 'all' ? undefined : diff, category: category || undefined })
        .then(r => setProblems(r.problems))
        .catch(() => {})
    }, 300)
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return problems
    return problems.filter(p => p.title.toLowerCase().includes(q.toLowerCase()))
  }, [problems, q])

  // Stats
  const total     = problems.length
  const solved    = problems.filter(p => p.myStatus === 'submitted').length
  const inProg    = problems.filter(p => p.myStatus === 'in_progress').length
  const easy      = problems.filter(p => p.difficulty === 'easy'   && p.myStatus === 'submitted').length
  const medium    = problems.filter(p => p.difficulty === 'medium' && p.myStatus === 'submitted').length
  const hard      = problems.filter(p => p.difficulty === 'hard'   && p.myStatus === 'submitted').length

  const counts: Record<Diff, number> = {
    all:    problems.length,
    easy:   problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard:   problems.filter(p => p.difficulty === 'hard').length,
  }

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-7 px-5 py-8 sm:px-8">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-medium text-ink">Practice Problems</h1>
              <p className="mt-1 text-sm text-ink-faint">
                Famous LLD interview questions — pick one, design your solution on the canvas.
              </p>
            </div>
          </div>

          {loading ? <Skeleton /> : (<>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total problems" value={total}    icon={BookOpen}    accent="bg-hairline text-ink-muted" />
              <StatCard label="Solved"         value={solved}   icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
              <StatCard label="In progress"    value={inProg}   icon={Clock}       accent="bg-amber-50 text-amber-600" />
              <StatCard label="Completion"     value={total ? `${Math.round(solved/total*100)}%` : '0%'}
                        icon={Target}      accent="bg-brand-tint text-brand" />
            </div>

            {/* Difficulty breakdown */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline
                            bg-paper-elevated px-5 py-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                Solved
              </span>
              {(['easy', 'medium', 'hard'] as const).map(d => {
                const total = problems.filter(p => p.difficulty === d).length
                const done  = d === 'easy' ? easy : d === 'medium' ? medium : hard
                const m = DIFF_META[d]
                return (
                  <div key={d} className="flex items-center gap-2">
                    <span className={cn('font-mono text-sm font-bold tabular-nums', m.color)}>
                      {done}/{total}
                    </span>
                    <span className={cn('font-mono text-[10px]', m.color)}>{m.label}</span>
                  </div>
                )
              })}
              <div className="ml-auto flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-ink-faint" />
                <span className="font-mono text-[11px] text-ink-faint">
                  {problems.reduce((a, p) => a + p.submissionCount, 0).toLocaleString()} total community solutions
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <input
                  value={q} onChange={e => handleSearch(e.target.value)}
                  placeholder="Search problems…"
                  className="h-9 w-full rounded-xl border border-hairline-strong bg-paper pl-9 pr-3
                             text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </div>

              {/* Difficulty pills */}
              <div className="flex gap-1 rounded-xl border border-hairline bg-paper p-1">
                {DIFFICULTIES.map(d => {
                  const isLocked = isFree && d === 'hard'
                  return (
                    <button key={d} onClick={() => !isLocked && setDiff(d)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                        isLocked ? 'cursor-not-allowed opacity-50' : '',
                        diff === d ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {d !== 'all' && <span className={cn('h-1.5 w-1.5 rounded-full', DIFF_META[d as keyof typeof DIFF_META].dot)} />}
                      {d}
                      {isLocked && <Lock className="h-3 w-3 text-amber-400" />}
                      {!isLocked && <span className={cn(
                        'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold',
                        diff === d ? 'bg-white/20 text-white' : 'bg-hairline text-ink-faint',
                      )}>
                        {counts[d]}
                      </span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all',
                    !category
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40 hover:text-ink',
                  )}
                >
                  All categories
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c ? '' : c)}
                    className={cn(
                      'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all',
                      category === c
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40 hover:text-ink',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Free plan notice for hard problems */}
            {isFree && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Free plan:</span> Easy & Medium problems are available. Hard problems require Pro or Ultimate.
                </p>
                <Link href="/pricing" className="ml-auto shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
                  Upgrade
                </Link>
              </div>
            )}

            {/* Problem grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline
                              bg-paper-elevated py-20 text-center">
                <Zap className="mb-3 h-8 w-8 text-ink-faint/40" />
                <p className="text-sm text-ink-faint">No problems match your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(p =>
                  isFree && p.difficulty === 'hard'
                    ? <LockedProblemCard key={p._id} problem={p} />
                    : <ProblemCard key={p._id} problem={p} />
                )}
              </div>
            )}

          </>)}
        </div>
      </div>
    </AppShell>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Meta ───────────────────────────────────────────────────────────────────────
const DIFF_META: Record<string, { dot: string; text: string; label: string }> = {
  easy:   { dot: 'bg-brand',     text: 'text-brand',     label: 'Easy'   },
  medium: { dot: 'bg-amber-400', text: 'text-amber-600', label: 'Medium' },
  hard:   { dot: 'bg-red-400',   text: 'text-red-500',   label: 'Hard'   },
}

const LANG_SHORT: Record<string, string> = {
  'python-3.14':     'Python',
  'openjdk-25':      'Java',
  'g++-15':          'C++',
  'gcc-15':          'C',
  'rust-1.93':       'Rust',
  'go-1.26':         'Go',
  'typescript-deno': 'TypeScript',
}

type Diff = 'all' | 'easy' | 'medium' | 'hard'

// ── Row ────────────────────────────────────────────────────────────────────────
function ChallengeRow({
  challenge,
  index,
}: {
  challenge: DebuggerChallenge
  index: number
}) {
  const id   = challenge.slug || challenge._id || challenge.id || ''
  const diff = (challenge.difficulty ?? 'easy').toLowerCase()
  const meta = DIFF_META[diff] ?? DIFF_META.easy
  const langs = (challenge.variants ?? [])
    .map(v => LANG_SHORT[v.language] ?? v.language)
    .slice(0, 4)

  return (
    <Link
      href={`/learn/debugger/${id}`}
      className="group flex items-center gap-5 border-b border-hairline px-6 py-4 transition-colors hover:bg-brand-tint/10 last:border-b-0"
    >
      {/* Ordinal */}
      <span className="w-6 shrink-0 select-none font-mono text-[11px] text-ink-faint">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Difficulty dot */}
      <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} title={meta.label} />

      {/* Title + description */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight text-ink transition-colors group-hover:text-brand">
          {challenge.title}
        </p>
        {challenge.description && (
          <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-ink-faint">
            {challenge.description}
          </p>
        )}
      </div>

      {/* Bug type chip */}
      {challenge.bugType && (
        <span className="hidden shrink-0 rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink-faint sm:inline-flex">
          {challenge.bugType.replace(/-/g, ' ')}
        </span>
      )}

      {/* Language chips */}
      {langs.length > 0 && (
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          {langs.map(l => (
            <span
              key={l}
              className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[9px] text-ink-faint"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Difficulty label */}
      <span className={cn('hidden w-12 shrink-0 text-right font-mono text-[10px] sm:block', meta.text)}>
        {meta.label}
      </span>

      {/* Arrow */}
      <ArrowRight
        size={14}
        className="shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </Link>
  )
}

// ── Skeleton row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-5 border-b border-hairline px-6 py-4 last:border-b-0">
      <div className="h-3 w-6 animate-pulse rounded bg-hairline" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-hairline" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-52 animate-pulse rounded bg-hairline" />
        <div className="h-2.5 w-80 animate-pulse rounded bg-hairline" />
      </div>
      <div className="hidden h-3 w-16 animate-pulse rounded bg-hairline sm:block" />
      <div className="h-3 w-10 animate-pulse rounded bg-hairline" />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function DebuggerProblemList() {
  const [challenges, setChallenges] = useState<DebuggerChallenge[]>([])
  const [loading,    setLoading]    = useState(true)
  const [diff,       setDiff]       = useState<Diff>('all')

  useEffect(() => {
    let cancelled = false
    learnApi.debugger.list()
      .then(d => { if (!cancelled) setChallenges(d.challenges ?? []) })
      .catch(e => toast.error(e instanceof Error ? e.message : 'Failed to load challenges'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const counts = useMemo(() => ({
    all:    challenges.length,
    easy:   challenges.filter(c => c.difficulty?.toLowerCase() === 'easy').length,
    medium: challenges.filter(c => c.difficulty?.toLowerCase() === 'medium').length,
    hard:   challenges.filter(c => c.difficulty?.toLowerCase() === 'hard').length,
  }), [challenges])

  const filtered = diff === 'all'
    ? challenges
    : challenges.filter(c => c.difficulty?.toLowerCase() === diff)

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-hairline bg-paper/90 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/learn/debugger"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} />
            Code Bug Lab
          </Link>
          <Link
            href="/learn/debugger/history"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
          >
            <History size={13} />
            My History
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8">

        {/* ── Page title + stats ────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Problems
          </p>
          <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-ink">
            Bug Library
          </h1>
          {!loading && (
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <span className="text-[13px] text-ink-muted">{counts.all} challenges</span>
              <div className="flex items-center gap-4">
                {(['easy', 'medium', 'hard'] as const).map(d => counts[d] > 0 && (
                  <span key={d} className="flex items-center gap-1.5 text-[12px]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', DIFF_META[d].dot)} />
                    <span className={cn('font-mono', DIFF_META[d].text)}>
                      {counts[d]} {DIFF_META[d].label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Filter tabs ───────────────────────────────────────────────── */}
        <div className="-mx-6 mb-6 flex items-center gap-1 border-b border-hairline px-6 pb-0">
          {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => {
            const label =
              d === 'all'    ? `All (${counts.all})`       :
              d === 'easy'   ? `Easy (${counts.easy})`     :
              d === 'medium' ? `Medium (${counts.medium})` :
                               `Hard (${counts.hard})`
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={cn(
                  '-mb-px mr-4 border-b-2 pb-3 px-1 text-[13px] font-medium transition-colors',
                  diff === d
                    ? 'border-brand text-brand'
                    : 'border-transparent text-ink-faint hover:text-ink',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── List ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
            {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-ink-muted">
              {challenges.length === 0
                ? 'No challenges yet.'
                : 'No challenges match this filter.'}
            </p>
            {diff !== 'all' && (
              <button
                type="button"
                onClick={() => setDiff('all')}
                className="mt-2 text-[13px] text-brand hover:underline"
              >
                Show all
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
            {filtered.map((c, i) => (
              <ChallengeRow
                key={c.slug || c._id || c.id}
                challenge={c}
                index={i}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Meta ──────────────────────────────────────────────────────────────────────

type Diff = 'all' | 'easy' | 'medium' | 'hard'

const DIFF_DOT: Record<string, string> = {
  easy:   'bg-emerald-400',
  medium: 'bg-amber-400',
  hard:   'bg-rose-500',
}
const DIFF_TEXT: Record<string, string> = {
  easy:   'text-emerald-600',
  medium: 'text-amber-600',
  hard:   'text-rose-600',
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

function getDailyChallenge(challenges: DebuggerChallenge[]): DebuggerChallenge | null {
  if (!challenges.length) return null
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
  return challenges[dayOfYear % challenges.length]
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="rounded-2xl border border-hairline overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div key={i} className={cn('flex items-center gap-5 px-6 py-4', i < 7 && 'border-b border-hairline')}>
          <div className="w-5 h-2.5 rounded bg-hairline animate-pulse shrink-0" />
          <div className="h-2 w-2 rounded-full bg-hairline animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-52 rounded bg-hairline animate-pulse" />
            <div className="h-2.5 w-40 rounded bg-hairline animate-pulse" />
          </div>
          <div className="h-2.5 w-10 rounded bg-hairline animate-pulse hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

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

  const daily   = getDailyChallenge(challenges)
  const dailyId = daily ? (daily.slug || daily._id || daily.id) : null

  const filtered = (diff === 'all' ? challenges : challenges.filter(
    c => c.difficulty?.toLowerCase() === diff,
  )).filter(c => (c.slug || c._id || c.id) !== dailyId)

  const showDaily = !!daily && (
    diff === 'all' || (daily.difficulty ?? 'easy').toLowerCase() === diff
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-paper">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 sticky top-0 z-20 border-b border-hairline bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 pt-3.5 pb-0">

          {/* Breadcrumb + stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <Link href="/dashboard/learn/debugger" className="hover:text-ink transition-colors">
                Code Bug Lab
              </Link>
              <span>/</span>
              <span className="text-ink-muted">Problems</span>
            </div>

            {!loading && challenges.length > 0 && (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-ink-faint">{counts.all} total</span>
                {counts.easy   > 0 && <span className="text-emerald-600">{counts.easy} easy</span>}
                {counts.medium > 0 && <span className="text-amber-600">{counts.medium} medium</span>}
                {counts.hard   > 0 && <span className="text-rose-600">{counts.hard} hard</span>}
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {!loading && challenges.length > 0 && (
            <div className="flex items-center gap-0">
              {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiff(d)}
                  className={cn(
                    'px-4 py-2.5 text-[12px] font-medium capitalize border-b-2 transition-all',
                    diff === d
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink-faint hover:text-ink-muted',
                  )}
                >
                  {d}
                  {d !== 'all' && counts[d] > 0 && (
                    <span className="ml-1 font-mono text-[10px] font-normal opacity-50">
                      ({counts[d]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">

          {loading && <SkeletonRows />}

          {!loading && challenges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-2">
              <p className="text-[15px] font-medium text-ink">No challenges yet</p>
              <p className="text-[13px] text-ink-muted">Challenges will appear here once published.</p>
            </div>
          )}

          {!loading && challenges.length > 0 && !showDaily && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <p className="text-[14px] font-medium text-ink">No {diff} challenges</p>
              <button
                onClick={() => setDiff('all')}
                className="text-[13px] text-ink-faint hover:text-ink transition-colors hover:underline underline-offset-2"
              >
                Show all
              </button>
            </div>
          )}

          {!loading && challenges.length > 0 && (showDaily || filtered.length > 0) && (
            <>
              {/* Today's pick */}
              {showDaily && daily && (() => {
                const id   = daily.slug || daily._id || daily.id || ''
                const d    = (daily.difficulty ?? 'easy').toLowerCase()
                const langs = (daily.variants ?? [])
                  .map(v => LANG_SHORT[v.language] ?? v.language).slice(0, 3)
                return (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame size={11} className="text-amber-500 shrink-0" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                        Today's pick
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-ink-faint">
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/learn/debugger/${id}`}
                      className="group block rounded-2xl border border-hairline bg-paper-elevated px-6 py-5 hover:border-ink/20 hover:bg-paper transition-all"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className={cn('h-2 w-2 rounded-full shrink-0', DIFF_DOT[d] ?? 'bg-ink/20')} />
                            <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.1em]', DIFF_TEXT[d] ?? 'text-ink-faint')}>
                              {daily.difficulty ?? 'Easy'}
                            </span>
                            {daily.bugType && (
                              <span className="font-mono text-[10px] text-ink-faint border border-hairline rounded-full px-2 py-0.5 uppercase tracking-wide">
                                {daily.bugType.replace(/-/g, ' ')}
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-[20px] font-medium text-ink leading-snug mb-2 group-hover:text-brand transition-colors">
                            {daily.title}
                          </h3>
                          {daily.description && (
                            <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 max-w-2xl">
                              {daily.description}
                            </p>
                          )}
                          {langs.length > 0 && (
                            <div className="flex gap-1.5 mt-3">
                              {langs.map(l => (
                                <span key={l} className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-1.5 py-0.5">
                                  {l}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-ink text-paper group-hover:bg-ink/80 transition-colors mt-0.5">
                          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })()}

              {/* Problem list */}
              {filtered.length > 0 && (
                <>
                  {showDaily && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-3">
                      All challenges
                    </p>
                  )}
                  <div className="rounded-2xl border border-hairline overflow-hidden">
                    {filtered.map((c, i) => {
                      const id   = c.slug || c._id || c.id || ''
                      const d    = (c.difficulty ?? 'easy').toLowerCase()
                      const last = i === filtered.length - 1
                      const langs = (c.variants ?? [])
                        .map(v => LANG_SHORT[v.language] ?? v.language).slice(0, 3)
                      return (
                        <Link
                          key={id}
                          href={`/dashboard/learn/debugger/${id}`}
                          className={cn(
                            'group flex items-center gap-5 px-6 py-4 transition-colors hover:bg-paper-elevated',
                            !last && 'border-b border-hairline',
                          )}
                        >
                          <span className="font-mono text-[11px] text-ink-faint shrink-0 w-5 text-right select-none">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DIFF_DOT[d] ?? 'bg-ink/20')} />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-[14px] font-medium text-ink leading-snug truncate group-hover:text-brand transition-colors">
                              {c.title}
                            </p>
                            {c.bugType && (
                              <p className="mt-0.5 font-mono text-[10px] text-ink-faint truncate">
                                {c.bugType.replace(/-/g, ' ').toUpperCase()}
                                {langs.length > 0 && ` · ${langs.join(' · ')}`}
                              </p>
                            )}
                          </div>
                          <span className={cn('font-mono text-[11px] capitalize shrink-0 hidden sm:block w-12 text-right', DIFF_TEXT[d] ?? 'text-ink-faint')}>
                            {c.difficulty ?? 'easy'}
                          </span>
                          <ArrowRight size={14} className="text-ink-faint shrink-0 group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, History, Loader2, Bug, Search } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

const LANG_LABELS: Record<string, string> = {
  'python-3.14':     'Python',
  'openjdk-25':      'Java',
  'g++-15':          'C++',
  'gcc-15':          'C',
  'rust-1.93':       'Rust',
  'go-1.26':         'Go',
  'typescript-deno': 'TypeScript',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50   text-amber-700',
  hard:   'bg-red-50     text-red-600',
}

export function DebuggerList() {
  const [challenges, setChallenges] = useState<DebuggerChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [mode, setMode] = useState<'code' | 'design'>('code')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.debugger.list()
        if (!cancelled) setChallenges(data.challenges ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load challenges')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = filter === 'all'
    ? challenges
    : challenges.filter(c => c.difficulty === filter)

  return (
    <CategoryShell
      title="Debug Lab"
      subtitle="Fix code bugs or hunt structural design violations in UML"
      backHref="/dashboard/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Mode switcher — border-b tab style */}
        <div className="mb-6 flex items-end justify-between border-b border-hairline">
          <div className="flex gap-0">
            <button
              type="button"
              onClick={() => setMode('code')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold transition border-b-2 -mb-px',
                mode === 'code'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              <Bug size={13} />
              Code Bugs
            </button>
            <Link
              href="/dashboard/learn/debugger/design"
              onClick={() => setMode('design')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold transition border-b-2 -mb-px',
                mode === 'design'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              <Search size={13} />
              Design Bugs
            </Link>
          </div>
          <Link
            href="/dashboard/learn/debugger/history"
            className="mb-2 flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-brand transition-colors"
          >
            <History size={13} />
            History
          </Link>
        </div>

        {/* Difficulty filter — pill buttons */}
        <div className="mb-6 flex gap-1.5">
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={cn(
                'rounded-full border px-3 py-1 text-[12px] font-medium capitalize transition',
                filter === d
                  ? 'bg-brand text-white border-brand'
                  : 'border-hairline text-ink-muted hover:border-brand/40 hover:text-brand',
              )}
            >
              {d === 'all'
                ? `All (${challenges.length})`
                : `${d.charAt(0).toUpperCase() + d.slice(1)} (${challenges.filter(c => c.difficulty === d).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bug size={28} className="text-ink-faint" />
            <p className="text-[14px] text-ink-muted">
              {challenges.length === 0
                ? 'No challenges yet.'
                : 'No challenges match this filter.'}
            </p>
            {challenges.length === 0 && (
              <p className="text-[12px] text-ink-faint">
                Seed with <code className="font-mono">seed-debugger.ts</code> to get started.
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(c => {
              const id = c.slug || c._id || c.id || ''
              return (
                <li key={id}>
                  <Link
                    href={`/dashboard/learn/debugger/${id}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30 hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Bug size={13} className="text-ink-faint shrink-0" />
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                          DIFFICULTY_COLORS[c.difficulty],
                        )}>
                          {c.difficulty}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                          {c.bugType}
                        </span>
                      </div>
                      <h2 className="font-serif text-lg font-medium text-ink group-hover:text-brand transition-colors">
                        {c.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">
                        {c.description}
                      </p>
                      {/* Language pills */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {(c.variants ?? []).map(v => (
                          <span
                            key={v.language}
                            className="rounded px-1.5 py-0.5 text-[10px] bg-paper border border-hairline text-ink-faint font-mono"
                          >
                            {LANG_LABELS[v.language] ?? v.language}
                          </span>
                        ))}
                        {(c.variants ?? []).length > 0 && (
                          <span className="text-[11px] text-ink-faint">
                            {(c.variants ?? []).length} language{(c.variants ?? []).length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="mt-2 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </CategoryShell>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, History, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

const BUG_TYPE_ICONS: Record<string, string> = {
  'off-by-one':      '🔢',
  'logic':           '🧠',
  'edge-case':       '⚡',
  'operator':        '➕',
  'missing-return':  '↩️',
  'type-error':      '💥',
  'null-check':      '❓',
  'wrong-algorithm': '🔄',
  'boundary':        '🚧',
  'infinite-loop':   '♾️',
}

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
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Mode switcher */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex rounded-xl border border-hairline bg-paper-elevated p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode('code')}
              className={cn(
                'rounded-lg px-4 py-2 text-[13px] font-semibold transition',
                mode === 'code'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              🐛 Code Bugs
            </button>
            <Link
              href="/learn/debugger/design"
              className={cn(
                'rounded-lg px-4 py-2 text-[13px] font-semibold transition',
                mode === 'design'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
              )}
            >
              🔍 Design Bugs
            </Link>
          </div>
          <Link
            href="/learn/debugger/history"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] text-ink-muted border border-hairline hover:border-brand/30 hover:text-brand transition-colors"
          >
            <History size={13} />
            History
          </Link>
        </div>

        {/* Info callout for code bugs */}
        <div className="mb-5 rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
          <p className="text-[12px] font-semibold text-amber-700 mb-1 uppercase tracking-wide">
            Code Bug Hunt
          </p>
          <p className="text-[13px] text-ink leading-relaxed">
            Each challenge has intentionally broken code. Run it, read the output, fix the bug.
            Switch to <strong>Design Bugs</strong> to practice spotting structural violations in UML diagrams — 
            the kind interviewers specifically test.
          </p>
        </div>

        {/* Difficulty filter */}
        <div className="mb-6 flex gap-1.5">
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12px] font-semibold capitalize transition',
                filter === d
                  ? 'bg-brand text-white'
                  : 'text-ink-muted hover:bg-brand-tint hover:text-brand',
              )}
            >
              {d === 'all' ? `All (${challenges.length})` : `${d.charAt(0).toUpperCase() + d.slice(1)} (${challenges.filter(c => c.difficulty === d).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[14px] text-ink-muted py-12">
            No challenges yet. Seed with{' '}
            <code className="font-mono text-[12px]">seed-debugger.ts</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map(c => {
              const id = c.slug || c._id || c.id || ''
              const bugIcon = BUG_TYPE_ICONS[c.bugType] ?? '🐛'
              return (
                <li key={id}>
                  <Link
                    href={`/learn/debugger/${id}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30 hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-base">{bugIcon}</span>
                        <span className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
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
                        <span className="text-[11px] text-ink-faint">
                          {(c.variants ?? []).length} language{(c.variants ?? []).length !== 1 ? 's' : ''}
                        </span>
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


'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DetectiveScenario } from '@/lib/learn-api'

const MODE_LABELS: Record<string, string> = {
  identify: 'Identify Pattern',
  detect:   'Detect Pattern',
  explain:  'Explain Pattern',
  suggest:  'Suggest Pattern',
  compare:  'Compare Patterns',
}

const MODE_COLORS: Record<string, string> = {
  identify: 'text-blue-600',
  detect:   'text-violet-600',
  explain:  'text-amber-600',
  suggest:  'text-emerald-600',
  compare:  'text-brand',
}

export function DetectiveList() {
  const [scenarios, setScenarios] = useState<DetectiveScenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.detective.list()
        if (!cancelled) setScenarios(data.scenarios ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load scenarios')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CategoryShell
      title="Pattern Detective"
      subtitle="Identify, detect, and explain patterns in scenarios"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Header row with history link */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-ink-muted leading-relaxed max-w-lg">
              Three modes: <strong>identify</strong> a pattern from UML, <strong>suggest</strong> a pattern for a prose problem,
              or <strong>compare</strong> two patterns and explain the tradeoff.
            </p>
          </div>
          <Link
            href="/learn/detective/history"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] text-ink-muted border border-hairline hover:border-brand/30 hover:text-brand transition-colors whitespace-nowrap"
          >
            <History size={13} />
            My History
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : scenarios.length === 0 ? (
          <p className="text-center text-[14px] text-ink-muted">
            No scenarios yet. Seed with{' '}
            <code className="font-mono text-[12px]">seed-learn-modes.ts</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {scenarios.map(s => {
              const id = s.slug || s._id || s.id || ''
              return (
                <li key={id}>
                  <Link
                    href={`/learn/detective/${id}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[10px] uppercase tracking-wide ${MODE_COLORS[s.mode] ?? 'text-ink-faint'}`}>
                          {MODE_LABELS[s.mode] ?? s.mode}
                        </span>
                        <span className="font-mono text-[10px] text-ink-faint">· {s.difficulty}</span>
                      </div>
                      <h2 className="font-serif text-lg font-medium text-ink group-hover:text-brand">
                        {s.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">
                        {s.stem}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="mt-1 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100"
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

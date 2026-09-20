'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DetectiveScenario } from '@/lib/learn-api'

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
                      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        {s.mode} · {s.difficulty}
                      </p>
                      <h2 className="mt-1 font-serif text-lg font-medium text-ink group-hover:text-brand">
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

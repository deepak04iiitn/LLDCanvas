'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type RoguelikeRun } from '@/lib/learn-api'

export function RoguelikeRunView() {
  const params = useParams()
  const runId = String(params.runId ?? '')
  const [run, setRun] = useState<RoguelikeRun | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!runId) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.roguelike.get(runId)
        if (!cancelled) setRun(data.run)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load run')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [runId])

  return (
    <CategoryShell
      title="Roguelike run"
      subtitle={run ? `Level ${run.level} · ${run.status}` : 'Loading…'}
      backHref="/learn/roguelike"
      backLabel="Roguelike"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !run ? (
          <p className="text-center text-[14px] text-ink-muted">Run not found.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  Level
                </p>
                <p className="font-serif text-2xl font-medium text-ink">{run.level}</p>
              </div>
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  Score
                </p>
                <p className="font-serif text-2xl font-medium text-ink">{run.score}</p>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Modifiers
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {(run.modifiers ?? []).map(m => (
                  <li
                    key={m}
                    className="rounded-md border border-hairline bg-paper-elevated px-2.5 py-1 text-[12px] text-ink-muted"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Current prompt
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">
                {run.currentPrompt}
              </p>
            </div>
          </div>
        )}
      </div>
    </CategoryShell>
  )
}

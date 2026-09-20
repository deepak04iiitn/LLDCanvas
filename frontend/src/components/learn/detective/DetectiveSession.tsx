'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

type ScenarioPayload = {
  id?: string
  slug: string
  title: string
  mode: string
  difficulty: string
  stem: string
  choices: string[]
  explanation?: string
  answer?: string
}

export function DetectiveSession() {
  const params = useParams()
  const id = String(params.id ?? '')
  const [scenario, setScenario] = useState<ScenarioPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.detective.start(id)
        if (!cancelled) setScenario(data.scenario)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to start scenario')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const correct = choice != null && choice === scenario?.answer

  return (
    <CategoryShell
      title={scenario?.title ?? 'Pattern Detective'}
      subtitle={
        scenario
          ? `${scenario.mode} · ${scenario.difficulty}`
          : 'Loading scenario…'
      }
      backHref="/learn/detective"
      backLabel="Scenarios"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !scenario ? (
          <p className="text-center text-[14px] text-ink-muted">
            Scenario not found.
          </p>
        ) : (
          <div className="space-y-6">
            <p className="text-[15px] leading-relaxed text-ink">{scenario.stem}</p>
            <ul className="space-y-2">
              {scenario.choices.map(c => (
                <li key={c}>
                  <button
                    type="button"
                    disabled={revealed}
                    onClick={() => setChoice(c)}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2.5 text-left text-[13px] capitalize transition-colors',
                      choice === c
                        ? 'border-brand/40 bg-brand-tint text-ink'
                        : 'border-hairline bg-paper-elevated text-ink-muted hover:border-brand/25',
                    )}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
            {!revealed ? (
              <button
                type="button"
                disabled={!choice}
                onClick={() => setRevealed(true)}
                className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50"
              >
                Check answer
              </button>
            ) : (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
                <p
                  className={cn(
                    'text-[14px] font-medium',
                    correct ? 'text-emerald-700' : 'text-red-700',
                  )}
                >
                  {correct ? 'Correct' : `Not quite — expected “${scenario.answer}”`}
                </p>
                {scenario.explanation && (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {scenario.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </CategoryShell>
  )
}

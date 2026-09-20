'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

interface EvolutionStage {
  id?: string
  title?: string
  requirement?: string
  description?: string
}

export default function EvolutionAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkpoint, setCheckpoint] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        setPack(res.pack)
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load attempt')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const stages = useMemo((): EvolutionStage[] => {
    const raw =
      pack?.payload?.stages ??
      pack?.payload?.checkpoints ??
      pack?.payload?.versions
    if (Array.isArray(raw) && raw.length > 0) {
      return raw as EvolutionStage[]
    }
    return [
      {
        id: 's1',
        title: 'Baseline',
        requirement: 'Start from the given snapshot and understand the current design.',
      },
      {
        id: 's2',
        title: 'Stage 2 (stub)',
        requirement: 'Checkpoint UI — full evolution submit comes in a later phase.',
      },
    ]
  }, [pack?.payload])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    )
  }

  if (!pack) {
    return (
      <CategoryShell title="Not found" backHref="/design-studio/evolution" backLabel="Evolution">
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  return (
    <CategoryShell
      title={pack.title}
      subtitle={pack.description}
      backHref="/design-studio/evolution"
      backLabel="Evolution"
    >
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <p className="text-[13px] text-ink-muted">
          Advance through stages as checkpoints. Diagram editing and stage submit are stubbed
          for this MVP.
        </p>

        <ol className="space-y-3">
          {stages.map((stage, i) => {
            const done = i < checkpoint
            const active = i === checkpoint
            return (
              <li
                key={stage.id ?? i}
                className={cn(
                  'rounded-xl border p-4',
                  active
                    ? 'border-brand/35 bg-brand-tint/50'
                    : 'border-hairline bg-paper-elevated',
                )}
              >
                <div className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        active ? 'text-brand' : 'text-ink-faint',
                      )}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[15px] font-medium text-ink">
                      {stage.title ?? `Stage ${i + 1}`}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                      {stage.requirement ?? stage.description ?? 'No requirement text.'}
                    </p>
                    {active && (
                      <button
                        type="button"
                        onClick={() => {
                          setCheckpoint(c => Math.min(c + 1, stages.length))
                          toast.success(
                            i + 1 >= stages.length
                              ? 'All checkpoints marked (stub)'
                              : `Checkpoint ${i + 1} saved (stub)`,
                          )
                        }}
                        className="mt-3 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white"
                      >
                        {i + 1 >= stages.length ? 'Complete track' : 'Mark checkpoint'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        {checkpoint >= stages.length && (
          <p className="rounded-xl border border-emerald-200 bg-paper-elevated px-4 py-3 text-[13px] text-ink">
            Track complete (local stub). Server-side stage submit will land later.
          </p>
        )}
      </div>
    </CategoryShell>
  )
}

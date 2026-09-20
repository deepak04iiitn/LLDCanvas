'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DiagramChallengeAttempt } from '@/components/studio/challenges/DiagramChallengeAttempt'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'

export default function ChangeAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [diagram, setDiagram] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        setPack(res.pack)
        setDiagram(res.attempt?.diagramData ?? res.pack?.diagramSnapshot ?? {})
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

  const onSubmit = useCallback(
    (diagramData: unknown) => studioApi.submitChange(attemptId, diagramData),
    [attemptId],
  )

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
      <CategoryShell title="Not found" backHref="/design-studio/change" backLabel="Change One">
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  return (
    <DiagramChallengeAttempt
      title="Change One Thing"
      listHref="/design-studio/change"
      listLabel="Change One"
      pack={pack}
      initialDiagram={diagram}
      onSubmit={onSubmit}
    />
  )
}

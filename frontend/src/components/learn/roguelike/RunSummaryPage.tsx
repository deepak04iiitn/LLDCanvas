'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi } from '@/lib/learn-api'
import type { FullRun, RoguelikeScenario } from '@/lib/learn-api'
import { RunSummary } from './RunSummary'

export function RunSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const runId = String(params.runId ?? '')
  const [run, setRun] = useState<FullRun | null>(null)
  const [scenario, setScenario] = useState<RoguelikeScenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!runId) return
    let cancelled = false
    ;(async () => {
      try {
        const { run: fullRun } = await learnApi.roguelikeV2.getRun(runId)
        if (cancelled) return
        setRun(fullRun)
        const { scenario: sc } = await learnApi.roguelikeV2.getScenario(fullRun.scenarioSlug)
        if (!cancelled) setScenario(sc)
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load run summary')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [runId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    )
  }

  if (!run || !scenario) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <p className="text-[14px] text-ink-muted">Run not found.</p>
      </div>
    )
  }

  return (
    <RunSummary
      run={run}
      scenario={scenario}
      onPlayAgain={() => router.push('/dashboard/learn/roguelike')}
      onBrowse={() => router.push('/dashboard/learn/roguelike')}
    />
  )
}

'use client'

import { useEffect, useState } from 'react'
import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'
import type { StudioPackSummary } from '@/lib/studio-api'
import { annotateChallengeAccess } from '@/lib/challenge-access'
import { usePlan } from '@/hooks/usePlan'
import { getAuthToken } from '@/lib/auth-token'

export default function DesignBugProblemsPage() {
  const { plan } = usePlan()
  const [packs, setPacks] = useState<StudioPackSummary[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
      const token = getAuthToken()
      try {
        const r = await fetch(`${base}/learn/debuglab/design`, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!r.ok) {
          if (!cancelled) setPacks([])
          return
        }
        const data = await r.json()
        const list = Array.isArray(data?.challenges) ? data.challenges
          : Array.isArray(data?.bugs) ? data.bugs
          : Array.isArray(data) ? data : []
        const mapped: StudioPackSummary[] = list.map((c: {
          _id?: string
          slug?: string
          title?: string
          difficulty?: string
          description?: string
          locked?: boolean
          requiredPlan?: 'free' | 'pro' | 'ultimate'
        }) => ({
          _id: c._id,
          id: c._id,
          type: 'design_bug',
          slug: c.slug || String(c._id),
          title: c.title ?? 'Untitled',
          difficulty: c.difficulty ?? 'medium',
          description: c.description ?? '',
          tags: [],
          locked: c.locked,
          requiredPlan: c.requiredPlan,
        }))
        if (!cancelled) {
          setPacks(annotateChallengeAccess('debug-lab', plan ?? 'free', mapped))
        }
      } catch {
        if (!cancelled) setPacks([])
      }
    })()
    return () => { cancelled = true }
  }, [plan])

  if (packs === null) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-faint">
        Loading design bugs…
      </div>
    )
  }

  return (
    <ProblemLibrary
      featureTitle="Design Bug Hunt"
      featureSubtitle="Spot structural violations in UML designs"
      packType="design_bug"
      attemptBasePath="/learn/debugger/design"
      overviewHref="/dashboard/learn/debugger/design"
      overviewLabel="Design Bug Hunt"
      packsLoader={async () => packs}
      instructionKey="learn-design-bug"
    />
  )
}

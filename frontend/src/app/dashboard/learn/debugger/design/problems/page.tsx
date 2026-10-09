'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'
import type { StudioPackSummary } from '@/lib/studio-api'

async function loadDesignBugs(): Promise<StudioPackSummary[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/debuglab/design`, { credentials: 'include' })
  if (!r.ok) return []
  const data = await r.json()
  const list = Array.isArray(data?.challenges) ? data.challenges
    : Array.isArray(data?.bugs) ? data.bugs
    : Array.isArray(data) ? data : []
  return list.map((c: any) => ({
    _id: c._id,
    id: c._id,
    type: 'design_bug',
    slug: c._id,
    title: c.title ?? 'Untitled',
    difficulty: c.difficulty ?? 'medium',
    description: c.description ?? '',
    tags: [],
  }))
}

export default function DesignBugProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Design Bug Hunt"
      featureSubtitle="Spot structural violations in UML designs"
      packType="design_bug"
      attemptBasePath="/learn/debugger/design"
      overviewHref="/dashboard/learn/debugger/design"
      overviewLabel="Design Bug Hunt"
      packsLoader={loadDesignBugs}
      instructionKey="learn-design-bug"
    />
  )
}

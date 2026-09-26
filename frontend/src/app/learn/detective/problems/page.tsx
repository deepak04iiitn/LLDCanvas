'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'
import type { StudioPackSummary } from '@/lib/studio-api'

async function loadDetectiveScenarios(): Promise<StudioPackSummary[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/detective`, { credentials: 'include' })
  if (!r.ok) return []
  const data = await r.json()
  const list = Array.isArray(data?.scenarios) ? data.scenarios
    : Array.isArray(data?.challenges) ? data.challenges
    : Array.isArray(data) ? data : []
  return list.map((c: any) => ({
    _id: c._id,
    id: c._id,
    type: 'detective',
    slug: c._id ?? c.slug,
    title: c.title ?? 'Untitled',
    difficulty: c.difficulty ?? 'medium',
    description: c.description ?? c.scenario ?? '',
    tags: c.patternTags ?? c.tags ?? [],
  }))
}

export default function DetectiveProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Pattern Detective"
      featureSubtitle="Identify design patterns hidden in real LLD implementations"
      packType="detective"
      attemptBasePath="/learn/detective"
      overviewHref="/learn/detective"
      overviewLabel="Pattern Detective"
      packsLoader={loadDetectiveScenarios}
    />
  )
}

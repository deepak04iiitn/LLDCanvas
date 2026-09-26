'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'
import type { StudioPackSummary } from '@/lib/studio-api'

async function loadDebuggerProblems(): Promise<StudioPackSummary[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/debugger`, { credentials: 'include' })
  if (!r.ok) return []
  const data = await r.json()
  const list = Array.isArray(data) ? data : (data.challenges ?? data.problems ?? [])
  return list.map((c: any) => ({
    _id: c._id,
    id: c._id,
    type: 'code_debugger',
    slug: c._id,
    title: c.title ?? 'Untitled',
    difficulty: c.difficulty ?? 'medium',
    description: c.description ?? '',
    tags: c.tags ?? (c.patternTags ? c.patternTags : []),
  }))
}

export default function DebuggerLabProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Code Bug Lab"
      featureSubtitle="Hunt bugs in real LLD implementations"
      packType="code_debugger"
      attemptBasePath="/learn/debugger"
      overviewHref="/learn/debugger"
      overviewLabel="Code Bug Lab"
      packsLoader={loadDebuggerProblems}
    />
  )
}

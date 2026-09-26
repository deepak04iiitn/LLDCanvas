'use client'

import { useParams } from 'next/navigation'
import { RunPlayer } from './RunPlayer'

export function RoguelikeRunView() {
  const params = useParams()
  const runId = String(params.runId ?? '')
  return <RunPlayer runId={runId} />
}

'use client'

import { useParams } from 'next/navigation'
import { RunPlayer } from './RunPlayer'

export function RoguelikeRunView() {
  const params = useParams()
  const runId = String(params.runId ?? '')
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <RunPlayer runId={runId} />
    </div>
  )
}

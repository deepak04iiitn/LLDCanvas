'use client'

import { useCallback, useState } from 'react'
import type { AnalysisReport, DiagramInput } from '@/lib/design-analysis'
import type { AnalysisCache } from '@/hooks/useBackgroundAnalysis'
import { AnalyzeStaging } from './AnalyzeStaging'
import { AnalyzeRunning } from './AnalyzeRunning'
import { AnalyzeReport } from './AnalyzeReport'

type Phase = 'idle' | 'running' | 'report'

export function AnalyzeExperience({
  diagram,
  cache,
  ready,
  analyzeNow,
  onFocusElement,
  onRequestCanvas,
}: {
  diagram: DiagramInput
  cache: AnalysisCache | null
  ready: boolean
  analyzeNow: (d?: DiagramInput) => AnalysisReport
  onFocusElement?: (elementId: string) => void
  onRequestCanvas?: () => void
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [runRevision, setRunRevision] = useState<string | null>(null)

  const typeCount = (diagram.nodes ?? []).filter(n => {
    const t = (n as { data?: { nodeType?: string } })?.data?.nodeType
    return t && t !== 'note'
  }).length
  const edgeCount = (diagram.edges ?? []).length

  const startAnalyze = useCallback(() => {
    // Prefer fresh run so report matches click-time diagram
    const r = analyzeNow(diagram)
    setRunRevision(r.revisionId)
    setReport(r)
    setPhase('running')
  }, [analyzeNow, diagram])

  const finishRunning = useCallback(() => {
    setPhase('report')
  }, [])

  // Stale when background cache moved to a newer revision than the open report
  const diagramChangedAfterReport =
    !!report && !!runRevision && !!cache && cache.revisionId !== runRevision

  if (phase === 'running') {
    return <AnalyzeRunning onDone={finishRunning} />
  }

  if (phase === 'report' && report) {
    return (
      <AnalyzeReport
        report={report}
        stale={diagramChangedAfterReport}
        onBack={() => setPhase('idle')}
        onReanalyze={startAnalyze}
        onFocusElement={id => {
          onFocusElement?.(id)
          onRequestCanvas?.()
        }}
        onEditCanvas={onRequestCanvas}
      />
    )
  }

  return (
    <AnalyzeStaging
      typeCount={typeCount}
      edgeCount={edgeCount}
      ready={ready}
      lastReport={cache?.report ?? null}
      onAnalyze={startAnalyze}
    />
  )
}

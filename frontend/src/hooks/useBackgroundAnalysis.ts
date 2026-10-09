'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  analyzeDiagramDesign,
  type AnalysisReport,
  type DiagramInput,
} from '@/lib/design-analysis'

export interface AnalysisCache {
  revisionId: string
  report: AnalysisReport
  fingerprint: string
  updatedAt: number
}

function fingerprint(diagram: DiagramInput): string {
  const n = (diagram.nodes ?? [])
    .map(x => {
      const o = x as { id?: string; data?: { name?: string; methods?: unknown[]; attributes?: unknown[] } }
      return `${o.id}:${o.data?.name}:${o.data?.methods?.length ?? 0}:${o.data?.attributes?.length ?? 0}`
    })
    .join(',')
  const e = (diagram.edges ?? [])
    .map(x => {
      const o = x as { id?: string; source?: string; target?: string; data?: { relationshipType?: string } }
      return `${o.id}:${o.source}->${o.target}:${o.data?.relationshipType ?? ''}`
    })
    .join(',')
  return `${n}|${e}`
}

/**
 * Silent background analysis — never opens UI.
 */
export function useBackgroundAnalysis(diagram: DiagramInput | null | undefined) {
  const [cache, setCache] = useState<AnalysisCache | null>(null)
  const [ready, setReady] = useState(false)
  const fpRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!diagram) return
    const fp = fingerprint(diagram)
    if (fp === fpRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const revisionId = `rev-${Date.now().toString(36)}`
      fpRef.current = fp
      const run = () => {
        try {
          const report = analyzeDiagramDesign(diagram, { revisionId })
          setCache({ revisionId, report, fingerprint: fp, updatedAt: Date.now() })
          setReady(true)
        } catch {
          /* keep previous */
        }
      }
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => run(), { timeout: 800 })
      } else {
        run()
      }
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [diagram])

  const analyzeNow = useCallback(
    (diagramOverride?: DiagramInput): AnalysisReport => {
      const d = diagramOverride ?? diagram
      if (!d) {
        return analyzeDiagramDesign({ nodes: [], edges: [] }, { revisionId: 'rev-empty' })
      }
      const fp = fingerprint(d)
      const revisionId = `rev-${Date.now().toString(36)}`
      fpRef.current = fp
      const report = analyzeDiagramDesign(d, { revisionId })
      setCache({ revisionId, report, fingerprint: fp, updatedAt: Date.now() })
      setReady(true)
      return report
    },
    [diagram],
  )

  const isStale = useCallback(
    (reportRevisionId: string) => {
      if (!diagram) return false
      const fp = fingerprint(diagram)
      return fp !== fpRef.current || (cache != null && cache.revisionId !== reportRevisionId && cache.fingerprint !== fp)
    },
    [diagram, cache],
  )

  return { cache, ready, analyzeNow, isStale, fingerprintOf: fingerprint }
}

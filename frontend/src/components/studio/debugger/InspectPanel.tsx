'use client'

import { useMemo } from 'react'
import {
  analyzeDiagram,
  getNodeAnalysis,
  type DiagramLike,
} from '@/lib/graph/analyzeDiagram'
import { cn } from '@/lib/utils'

export interface InspectPanelProps {
  diagram: { nodes: unknown[]; edges: unknown[] }
  selectedId: string | null
  className?: string
}

function resolveNodeId(diagram: DiagramLike, selectedId: string | null): string | null {
  if (!selectedId) return null
  const byElement = diagram.nodes.find(
    n => String(n.elementId ?? n.data?.elementId ?? n.id) === selectedId,
  )
  if (byElement) return String(byElement.id)
  if (diagram.nodes.some(n => String(n.id) === selectedId)) return selectedId
  return selectedId
}

export function InspectPanel({ diagram, selectedId, className }: InspectPanelProps) {
  const diagramLike = useMemo<DiagramLike>(
    () => ({
      nodes: diagram.nodes as DiagramLike['nodes'],
      edges: diagram.edges as DiagramLike['edges'],
    }),
    [diagram],
  )

  const nodeId = resolveNodeId(diagramLike, selectedId)
  const analysis = useMemo(
    () => (nodeId ? getNodeAnalysis(diagramLike, nodeId) : null),
    [diagramLike, nodeId],
  )
  const full = useMemo(() => analyzeDiagram(diagramLike), [diagramLike])

  if (!selectedId || !analysis) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center p-6 text-center', className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Inspect
        </p>
        <p className="mt-2 font-serif text-lg text-ink">Select an element</p>
        <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
          Click a class or relationship to investigate responsibilities and dependencies.
        </p>
        <p className="mt-4 font-mono text-[10px] text-ink-faint">
          {full.nodeCount}n · {full.edgeCount}e · {full.cycles.length} cycle(s)
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto p-4', className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Inspect
      </p>
      <h3 className="mt-1 font-serif text-xl font-medium text-ink">{analysis.name}</h3>
      <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
        {analysis.nodeType} · in {analysis.inDegree} · out {analysis.outDegree}
      </p>

      <section className="mt-5">
        <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Responsibilities
        </h4>
        {(analysis.responsibilities.length ?? 0) === 0 ? (
          <p className="text-[13px] text-ink-muted">No methods listed.</p>
        ) : (
          <ul className="space-y-1">
            {analysis.responsibilities.map(r => (
              <li
                key={r}
                className="rounded-md border border-hairline bg-paper px-2.5 py-1.5 font-mono text-[11px] text-ink-muted"
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Dependencies
        </h4>
        <ul className="space-y-1">
          {(analysis.outbound ?? []).map(d => (
            <li key={`${d.toId}-${d.type}`} className="text-[12px] text-ink-muted">
              → <span className="font-medium text-ink">{d.toName}</span>
              <span className="font-mono text-[10px] text-ink-faint"> · {d.type}</span>
            </li>
          ))}
          {(analysis.outbound?.length ?? 0) === 0 && (
            <li className="text-[12px] text-ink-faint">None</li>
          )}
        </ul>
      </section>

      <section className="mt-5">
        <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Used by
        </h4>
        <ul className="space-y-1">
          {(analysis.inbound ?? []).map(d => (
            <li key={`${d.fromId}-${d.type}`} className="text-[12px] text-ink-muted">
              ← <span className="font-medium text-ink">{d.fromName}</span>
              <span className="font-mono text-[10px] text-ink-faint"> · {d.type}</span>
            </li>
          ))}
          {(analysis.inbound?.length ?? 0) === 0 && (
            <li className="text-[12px] text-ink-faint">None</li>
          )}
        </ul>
      </section>

      {(analysis.concerns?.length ?? 0) > 0 && (
        <section className="mt-5">
          <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-700/80">
            Heuristic concerns
          </h4>
          <ul className="space-y-1">
            {analysis.concerns.map(c => (
              <li key={c} className="text-[12px] text-amber-800">
                ⚠ {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

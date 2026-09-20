'use client'

import type { NodeAnalysis } from '@/lib/graph/analyzeDiagram'
import { cn } from '@/lib/utils'

export interface MicroscopePanelProps {
  selectedNode: { id: string; name?: string } | null
  analysis: NodeAnalysis | null
  className?: string
}

export function MicroscopePanel({
  selectedNode,
  analysis,
  className,
}: MicroscopePanelProps) {
  if (!selectedNode) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center p-6 text-center', className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Microscope
        </p>
        <p className="mt-2 font-serif text-lg text-ink">Select a class</p>
        <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
          Click a type on the canvas to inspect responsibilities, dependencies, and concerns.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto p-4', className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Microscope
      </p>
      <h3 className="mt-1 font-serif text-xl font-medium text-ink">
        {analysis?.name ?? selectedNode.name ?? selectedNode.id}
      </h3>
      <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
        {analysis?.nodeType ?? 'class'} · in {analysis?.inDegree ?? 0} · out{' '}
        {analysis?.outDegree ?? 0}
      </p>

      <section className="mt-5">
        <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Responsibilities
        </h4>
        {(analysis?.responsibilities.length ?? 0) === 0 ? (
          <p className="text-[13px] text-ink-muted">No methods or notes yet.</p>
        ) : (
          <ul className="space-y-1">
            {analysis!.responsibilities.map(r => (
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

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            Inbound
          </h4>
          <ul className="space-y-1">
            {(analysis?.inbound ?? []).map(d => (
              <li key={`${d.fromId}-${d.type}`} className="text-[12px] text-ink-muted">
                <span className="font-medium text-ink">{d.fromName}</span>
                <span className="font-mono text-[10px] text-ink-faint"> · {d.type}</span>
              </li>
            ))}
            {(analysis?.inbound.length ?? 0) === 0 && (
              <li className="text-[12px] text-ink-faint">None</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            Outbound
          </h4>
          <ul className="space-y-1">
            {(analysis?.outbound ?? []).map(d => (
              <li key={`${d.toId}-${d.type}`} className="text-[12px] text-ink-muted">
                <span className="font-medium text-ink">{d.toName}</span>
                <span className="font-mono text-[10px] text-ink-faint"> · {d.type}</span>
              </li>
            ))}
            {(analysis?.outbound.length ?? 0) === 0 && (
              <li className="text-[12px] text-ink-faint">None</li>
            )}
          </ul>
        </div>
      </section>

      <section className="mt-5">
        <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Concerns
        </h4>
        {(analysis?.concerns.length ?? 0) === 0 ? (
          <p className="text-[13px] text-emerald-700">No strong heuristic concerns.</p>
        ) : (
          <ul className="space-y-1.5">
            {analysis!.concerns.map(c => (
              <li
                key={c}
                className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] text-amber-800"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

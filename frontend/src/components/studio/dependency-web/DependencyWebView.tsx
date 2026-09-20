'use client'

import type { DependencyGraph } from '@/lib/graph/toDependencyGraph'
import { cn } from '@/lib/utils'

export interface DependencyWebViewProps {
  graph: DependencyGraph | null
  className?: string
  onIsolate?: (nodeId: string) => void
}

export function DependencyWebView({
  graph,
  className,
  onIsolate,
}: DependencyWebViewProps) {
  if (!graph || graph.nodes.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center p-6 text-center', className)}>
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Dependency Web
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Add classes and relationships to see the coupling graph.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col overflow-hidden', className)}>
      <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Dependency Web
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            {graph.nodes.length} nodes · {graph.links.length} links
            {graph.cycles.length > 0 && (
              <span className="ml-2 text-amber-600">
                · {graph.cycles.length} cycle(s)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-1.5">
          {graph.nodes.map(n => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onIsolate?.(n.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                  n.inCycle
                    ? 'border-amber-200 bg-amber-50/80'
                    : n.isHub
                      ? 'border-brand/20 bg-brand-tint/40'
                      : 'border-hairline bg-paper-elevated hover:border-brand/25',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[12px] font-semibold text-ink">
                    {n.label}
                  </p>
                  <p className="font-mono text-[10px] text-ink-faint">
                    {n.nodeType} · ↓{n.inDegree} ↑{n.outDegree}
                    {n.isHub ? ' · hub' : ''}
                    {n.inCycle ? ' · cycle' : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-brand">Isolate</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

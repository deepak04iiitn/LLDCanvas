'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'

type MethodLike = string | { name?: string; [key: string]: unknown }

function methodName(m: MethodLike): string {
  return typeof m === 'string' ? m : String(m.name ?? 'method')
}

export interface ExtractClassPanelProps {
  diagram: DebuggerDiagram
  selectedElementId: string | null
  onApply: (next: DebuggerDiagram) => void
  onCancel: () => void
  className?: string
}

export function ExtractClassPanel({
  diagram,
  selectedElementId,
  onApply,
  onCancel,
  className,
}: ExtractClassPanelProps) {
  const source = useMemo(() => {
    const nodes = (diagram.nodes ?? []) as {
      id?: string
      position?: { x: number; y: number }
      data?: { elementId?: string; name?: string; methods?: MethodLike[]; [key: string]: unknown }
    }[]
    return nodes.find(
      n =>
        String(n.data?.elementId ?? n.id) === selectedElementId ||
        String(n.id) === selectedElementId,
    )
  }, [diagram, selectedElementId])

  const methods = (source?.data?.methods ?? []) as MethodLike[]
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [newName, setNewName] = useState('NewService')

  if (!selectedElementId || !source) {
    return (
      <div className={cn('border-l border-hairline bg-paper p-4 text-[13px] text-ink-muted', className)}>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Extract Class
        </p>
        <p className="mt-2">Select a class on the right canvas, then pick methods to extract.</p>
      </div>
    )
  }

  const toggle = (i: number) => {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const apply = () => {
    if (picked.size === 0) return
    const nodes = [...((diagram.nodes ?? []) as Record<string, unknown>[])]
    const edges = [...((diagram.edges ?? []) as Record<string, unknown>[])]
    const srcIdx = nodes.findIndex(
      n =>
        String((n as { data?: { elementId?: string }; id?: string }).data?.elementId ?? (n as { id?: string }).id) ===
          String(source.data?.elementId ?? source.id),
    )
    if (srcIdx < 0) return

    const src = nodes[srcIdx] as {
      id: string
      position?: { x: number; y: number }
      data: { methods?: MethodLike[]; name?: string; elementId?: string; [key: string]: unknown }
    }
    const keep: MethodLike[] = []
    const move: MethodLike[] = []
    methods.forEach((m, i) => {
      if (picked.has(i)) move.push(m)
      else keep.push(m)
    })

    const newId = `n-extract-${Date.now().toString(36)}`
    const newEid = `el-extract-${Date.now().toString(36)}`
    const pos = src.position ?? { x: 200, y: 120 }

    nodes[srcIdx] = {
      ...src,
      data: { ...src.data, methods: keep },
    }
    nodes.push({
      id: newId,
      position: { x: pos.x + 220, y: pos.y + 40 },
      data: {
        elementId: newEid,
        name: newName.trim() || 'NewService',
        nodeType: 'class',
        methods: move,
        attributes: [],
      },
    })
    edges.push({
      id: `e-extract-${Date.now().toString(36)}`,
      source: src.id,
      target: newId,
      data: {
        elementId: `ed-extract-${Date.now().toString(36)}`,
        relationshipType: 'dependency',
      },
    })

    onApply({ nodes, edges })
    setPicked(new Set())
  }

  return (
    <div className={cn('flex w-full flex-col border-l border-hairline bg-paper sm:w-72', className)}>
      <div className="border-b border-hairline px-3 py-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Extract Class
        </p>
        <p className="mt-0.5 font-serif text-sm text-ink">
          From {String(source.data?.name ?? source.id)}
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {methods.length === 0 ? (
          <p className="text-[12px] text-ink-muted">This class has no methods to extract.</p>
        ) : (
          methods.map((m, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2 text-[12px] text-ink">
              <input
                type="checkbox"
                checked={picked.has(i)}
                onChange={() => toggle(i)}
                className="rounded border-hairline"
              />
              <span className="font-mono">+ {methodName(m)}()</span>
            </label>
          ))
        )}
      </div>
      <div className="space-y-2 border-t border-hairline px-3 py-3">
        <label className="block text-[11px] text-ink-muted">
          New class name
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-paper-elevated px-2 py-1.5 text-[13px] text-ink"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-hairline px-2 py-1.5 text-[12px] text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={picked.size === 0}
            onClick={apply}
            className="flex-1 rounded-md bg-brand px-2 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
          >
            Extract
          </button>
        </div>
      </div>
    </div>
  )
}

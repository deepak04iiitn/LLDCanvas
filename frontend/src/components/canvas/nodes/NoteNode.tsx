'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UMLNodeData } from '@/types'
import { cn } from '@/lib/utils'

// A few attachment points per side (the pin is tiny, so fewer than the class
// node) so a connection can land somewhere other than the dead center. The
// 50% point keeps the plain 'top'/'right'/'bottom'/'left' id for backward
// compatibility with previously-saved diagrams.
type Side = 'top' | 'right' | 'bottom' | 'left'
const SIDE_POSITION: Record<Side, Position> = {
  top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left,
}
const SIDE_OFFSETS = [30, 50, 70] as const

function sideHandleStyle(side: Side, pct: number): CSSProperties {
  return side === 'top' || side === 'bottom' ? { left: `${pct}%` } : { top: `${pct}%` }
}

const SIDES = (['top', 'right', 'bottom', 'left'] as Side[]).flatMap(side =>
  SIDE_OFFSETS.map(pct => ({
    id: pct === 50 ? side : `${side}@${pct}`,
    position: SIDE_POSITION[side],
    style: sideHandleStyle(side, pct),
  })),
)

const HANDLE_CLS =
  '!h-2 !w-2 !rounded-full !border !border-white !bg-indigo-400 ' +
  '!opacity-0 !transition-opacity group-hover:!opacity-100'

export function NoteNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as UMLNodeData
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setNodes, setEdges } = useReactFlow()

  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState((data.noteText as string | undefined) ?? '')

  useEffect(() => {
    setDraft((data.noteText as string | undefined) ?? '')
  }, [data.noteText])

  useEffect(() => {
    if (data.isEditing) {
      setEditing(true)
      setNodes(nds =>
        nds.map(n => n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n),
      )
      setTimeout(() => textareaRef.current?.focus(), 60)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isEditing])

  const updateData = useCallback(
    (updates: Partial<UMLNodeData>) =>
      setNodes(nds =>
        nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n),
      ),
    [id, setNodes],
  )

  function commit() {
    updateData({ noteText: draft })
    setEditing(false)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') { setDraft(data.noteText ?? ''); setEditing(false) }
    e.stopPropagation()
  }

  function deleteNode() {
    setNodes(nds => nds.filter(n => n.id !== id))
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
  }

  function openEdit() {
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {/* ── group: CSS-only hover — no state change, so dragging stays smooth ── */}
        <div className="group relative" style={{ width: 20, height: 20 }}>

          {/* Handles */}
          {SIDES.map(({ id: hId, position, style }) => (
            <Handle key={hId} id={hId} type="source" position={position} style={style} className={HANDLE_CLS} />
          ))}

          {/* ── Floating card — pure CSS show/hide via group-hover + editing override ── */}
          <div
            className={cn(
              // Position: centred above the pin
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
              'w-48 rounded-lg border bg-white shadow-md',
              'transition-all duration-150 origin-bottom',
              // Show on CSS hover OR when editing (editing needs pointer-events)
              editing
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto',
              selected ? 'border-indigo-300' : 'border-gray-200',
            )}
            // Prevent the card's own hover from bubbling weirdly
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-1 border-b border-gray-100 px-2.5 py-1.5">
              <span className="font-mono text-[9px] font-bold text-gray-400 select-none">{'// note'}</span>
            </div>

            {/* Body */}
            <div className="px-2.5 py-2" onDoubleClick={openEdit}>
              {editing ? (
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={onKeyDown}
                  rows={3}
                  placeholder="Write a note…"
                  className="w-full resize-none bg-transparent text-[11px] leading-relaxed
                             text-gray-700 outline-none placeholder:text-gray-300"
                />
              ) : (
                <p className={cn(
                  'text-[11px] leading-relaxed whitespace-pre-wrap',
                  draft ? 'text-gray-700' : 'italic text-gray-300',
                )}>
                  {draft || 'Double-click to add…'}
                </p>
              )}
            </div>

            {/* Tail */}
            <div className={cn(
              'absolute left-1/2 -translate-x-1/2 -bottom-[5px]',
              'h-2.5 w-2.5 rotate-45 bg-white border-r border-b',
              selected ? 'border-indigo-300' : 'border-gray-200',
            )} />
          </div>

          {/* ── Pin ─────────────────────────────────────────────────────────── */}
          <div
            onDoubleClick={openEdit}
            className={cn(
              'h-5 w-5 rounded-full border flex items-center justify-center',
              'cursor-default select-none transition-colors duration-150',
              'shadow-sm',
              selected
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 bg-white group-hover:border-gray-400 group-hover:bg-gray-50',
            )}
          >
            <span className="font-mono text-[8px] font-bold leading-none text-gray-400">{'/'}</span>
          </div>

        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-36">
        <ContextMenuItem
          onClick={deleteNode}
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete note
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

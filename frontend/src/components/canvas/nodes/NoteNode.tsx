'use client'

import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from 'react'
import { Handle, Position, useReactFlow, useUpdateNodeInternals, type NodeProps } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UMLNodeData } from '@/types'
import { cn } from '@/lib/utils'

const HANDLE_CLS =
  '!h-3 !w-3 !rounded-full !border-2 !border-white !bg-amber-400 ' +
  '!opacity-0 !transition-opacity group-hover:!opacity-100'

export function NoteNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as UMLNodeData
  const nodeRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const { setNodes, setEdges } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState((data.noteText as string | undefined) ?? '')

  // Auto-resize observer
  useEffect(() => {
    const observer = new ResizeObserver(() => updateNodeInternals(id))
    if (nodeRef.current) observer.observe(nodeRef.current)
    return () => observer.disconnect()
  }, [id, updateNodeInternals])

  // Sync draft
  useEffect(() => { setDraft((data.noteText as string | undefined) ?? '') }, [data.noteText])

  // Auto-focus on insert
  useEffect(() => {
    if (data.isEditing) {
      setEditing(true)
      setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n))
      setTimeout(() => textareaRef.current?.focus(), 40)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isEditing])

  const updateData = useCallback(
    (updates: Partial<UMLNodeData>) =>
      setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n)),
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

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={nodeRef}
          onDoubleClick={() => { setEditing(true); setTimeout(() => textareaRef.current?.focus(), 0) }}
          className={cn(
            'group relative min-w-[160px] max-w-[280px] rounded-sm',
            'bg-amber-50 border transition-shadow dark:bg-amber-950/40',
            selected
              ? 'border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
              : 'border-amber-300 dark:border-amber-700',
          )}
        >
          {/* Handles */}
          <Handle type="source" position={Position.Top}    className={HANDLE_CLS} />
          <Handle type="source" position={Position.Right}  className={HANDLE_CLS} />
          <Handle type="source" position={Position.Bottom} className={HANDLE_CLS} />
          <Handle type="source" position={Position.Left}   className={HANDLE_CLS} />

          {/* Folded corner */}
          <div className="absolute top-0 right-0 h-5 w-5 overflow-hidden rounded-sm">
            <div
              className="absolute top-0 right-0 h-5 w-5 bg-amber-200 dark:bg-amber-800/60"
              style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            />
            <div
              className="absolute top-0 right-0 h-5 w-5 bg-white dark:bg-[#1E1E1E]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />
          </div>

          {/* Note content */}
          <div className="p-3 pr-6">
            {editing ? (
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
                rows={3}
                className="w-full resize-none rounded bg-amber-50/80 text-[12px] text-gray-700
                           outline-none ring-1 ring-amber-400 leading-relaxed
                           dark:bg-amber-950/60 dark:text-gray-200"
              />
            ) : (
              <p className={cn(
                'whitespace-pre-wrap text-[12px] leading-relaxed text-gray-700 dark:text-gray-300',
                !data.noteText && 'italic text-gray-400 dark:text-gray-600',
              )}>
                {data.noteText || 'Double-click to edit…'}
              </p>
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-40">
        <ContextMenuItem
          onClick={deleteNode}
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700
                     dark:focus:bg-red-950/40"
        >
          <Trash2 className="h-4 w-4" />
          Delete Note
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

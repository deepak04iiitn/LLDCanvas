'use client'

import { Undo2, Scissors, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RefactorToolbarProps {
  extractMode: boolean
  onToggleExtract: () => void
  onUndo: () => void
  canUndo: boolean
  onAddClass: () => void
  onAddInterface: () => void
  onDeleteSelected?: () => void
  canDelete?: boolean
  disabled?: boolean
  className?: string
}

export function RefactorToolbar({
  extractMode,
  onToggleExtract,
  onUndo,
  canUndo,
  onAddClass,
  onAddInterface,
  onDeleteSelected,
  canDelete,
  disabled,
  className,
}: RefactorToolbarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-wrap items-center gap-2 border-b border-hairline bg-paper px-3 py-2',
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAddClass}
        className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40 disabled:opacity-50"
      >
        <Plus size={12} /> Class
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onAddInterface}
        className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40 disabled:opacity-50"
      >
        <Plus size={12} /> Interface
      </button>
      <button
        type="button"
        disabled={disabled || !canDelete}
        onClick={onDeleteSelected}
        className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40 disabled:opacity-50"
      >
        <Trash2 size={12} /> Delete
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggleExtract}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] font-medium',
          extractMode
            ? 'border-brand bg-brand text-white'
            : 'border-hairline text-ink hover:bg-hairline/40',
          disabled && 'opacity-50',
        )}
      >
        <Scissors size={12} /> Extract Class
      </button>
      <button
        type="button"
        disabled={disabled || !canUndo}
        onClick={onUndo}
        className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40 disabled:opacity-50"
      >
        <Undo2 size={12} /> Undo
      </button>
      <span className="ml-auto font-mono text-[10px] text-ink-faint">
        Stop to drop a bend · Del removes · double-click rename
      </span>
    </div>
  )
}

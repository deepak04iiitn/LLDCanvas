'use client'

import { Trash2, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  count: number
  onClear: () => void
  onDelete: () => void
  loading?: boolean
  label?: string
  className?: string
}

export function BulkActionBar({
  count,
  onClear,
  onDelete,
  loading = false,
  label = 'selected',
  className,
}: BulkActionBarProps) {
  if (count === 0) return null

  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-brand/20 bg-brand-tint px-3 py-2 shadow-sm sm:gap-3 sm:px-3.5 sm:py-2.5',
        className,
      )}
    >
      <span className="text-[12px] font-medium text-brand sm:text-[13px]">
        {count} {label}
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-muted transition hover:bg-paper-elevated hover:text-ink disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
      </div>
    </div>
  )
}

interface SelectAllCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  disabled?: boolean
  title?: string
}

export function SelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled,
  title,
}: SelectAllCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={el => {
        if (el) el.indeterminate = indeterminate && !checked
      }}
      onChange={onChange}
      disabled={disabled}
      title={title}
      onClick={e => e.stopPropagation()}
      className="h-3.5 w-3.5 cursor-pointer rounded border-hairline-strong accent-brand disabled:opacity-40"
    />
  )
}

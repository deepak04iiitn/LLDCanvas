'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { IssueTypeTooltip } from '@/components/studio/debugger/IssueTypeTooltip'

export const DEBUGGER_CATEGORIES = [
  'Tight Coupling',
  'SRP Violation',
  'DIP Violation',
  'Incorrect Inheritance',
  'Circular Dependency',
  'God Object',
  'Unnecessary Abstraction',
  'Pattern Misuse',
  'Poor Encapsulation',
  'OCP Violation',
  'Other',
] as const

export interface MarkIssueFormProps {
  elementId: string | null
  elementLabel?: string
  disabled?: boolean
  initialCategory?: string
  initialWhy?: string
  onSave: (payload: { elementId: string; category: string; why: string }) => void
  className?: string
}

export function MarkIssueForm({
  elementId,
  elementLabel,
  disabled,
  initialCategory,
  initialWhy,
  onSave,
  className,
}: MarkIssueFormProps) {
  const [category, setCategory] = useState(initialCategory ?? 'DIP Violation')
  const [why, setWhy] = useState(initialWhy ?? '')

  if (!elementId) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center p-6 text-center', className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Mark Issue
        </p>
        <p className="mt-2 font-serif text-lg text-ink">Select a suspect</p>
        <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
          Click the class or edge you think is wrong, then classify and explain.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto p-4', className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Mark Issue
      </p>
      <p className="mt-1 font-serif text-lg text-ink">{elementLabel ?? elementId}</p>
      <p className="font-mono text-[10px] text-ink-faint">{elementId}</p>

      <fieldset className="mt-4 space-y-1.5" disabled={disabled}>
        <legend className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          What do you think is wrong?
        </legend>
        {DEBUGGER_CATEGORIES.map(c => (
          <IssueTypeTooltip key={c} issueType={c}>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors',
                category === c
                  ? 'border-brand/40 bg-brand-tint text-ink'
                  : 'border-transparent hover:bg-hairline/40 text-ink-muted',
              )}
            >
              <input
                type="radio"
                name="dbg-cat"
                className="accent-brand"
                checked={category === c}
                onChange={() => setCategory(c)}
              />
              {c}
            </label>
          </IssueTypeTooltip>
        ))}
      </fieldset>

      <label className="mt-4 block">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Explain why
        </span>
        <textarea
          value={why}
          onChange={e => setWhy(e.target.value)}
          disabled={disabled}
          rows={5}
          placeholder="e.g. Payment depends on concrete providers, so adding Apple Pay forces editing Payment."
          className="mt-1.5 w-full resize-none rounded-md border border-hairline bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
        />
      </label>

      <button
        type="button"
        disabled={disabled || !why.trim()}
        onClick={() => onSave({ elementId, category, why: why.trim() })}
        className="mt-4 rounded-md bg-brand px-3 py-2 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        Save mark
      </button>
    </div>
  )
}

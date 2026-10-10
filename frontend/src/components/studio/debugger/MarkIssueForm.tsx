'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

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

/** One-line hint shown on the category card */
const CATEGORY_HINTS: Record<string, string> = {
  'Tight Coupling':          'Direct dependency on a concrete class',
  'SRP Violation':           'Class has multiple reasons to change',
  'DIP Violation':           'High-level depends on low-level module',
  'Incorrect Inheritance':   'Inherits for reuse, not a true is-a',
  'Circular Dependency':     'Two classes depend on each other',
  'God Object':              'One class knows & does too much',
  'Unnecessary Abstraction': 'Interface adds no real flexibility',
  'Pattern Misuse':          'Design pattern applied incorrectly',
  'Poor Encapsulation':      'Internal state is exposed publicly',
  'OCP Violation':           'New behavior requires editing existing code',
  'Other':                   'A structural smell not listed above',
}

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
  const [category, setCategory] = useState(initialCategory ?? '')
  const [why, setWhy] = useState(initialWhy ?? '')

  /* ── Empty state — no element selected ─────────────────────────────────── */
  if (!elementId) {
    return (
      <div className={cn('flex h-full flex-col px-5 py-6', className)}>
        {/* Steps */}
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-5">
          How it works
        </p>
        <ol className="space-y-5">
          {[
            {
              n: '1',
              title: 'Click a class or arrow',
              body: 'Tap any element in the diagram to select it. Its name will appear here.',
            },
            {
              n: '2',
              title: 'Pick the problem type',
              body: 'Choose the design smell category that best describes the issue you spotted.',
            },
            {
              n: '3',
              title: 'Explain your reasoning',
              body: 'Write one or two sentences. This is what gets scored — be specific.',
            },
          ].map(step => (
            <li key={step.n} className="flex gap-3.5">
              <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full border border-hairline flex items-center justify-center">
                <span className="font-mono text-[10px] font-medium text-ink-faint">{step.n}</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink leading-snug">{step.title}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Hint chip */}
        <div className="mt-auto pt-8">
          <div className="rounded-xl border border-dashed border-hairline-strong bg-paper-elevated px-4 py-4 text-center">
            <p className="font-mono text-[10px] text-ink-faint leading-relaxed">
              ← Click any element in the diagram<br />to start marking
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Element selected — show form ─────────────────────────────────────── */
  const canSave = Boolean(category && why.trim() && !disabled)

  return (
    <div className={cn('flex flex-col px-5 py-5 gap-5', className)}>

      {/* Selected element badge */}
      <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-1">
          Selected element
        </p>
        <p className="font-serif text-[16px] font-medium text-ink leading-snug">
          {elementLabel ?? elementId}
        </p>
        <p className="font-mono text-[10px] text-ink-faint mt-0.5">{elementId}</p>
      </div>

      {/* Step 2 — Category */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className={cn(
            'h-5 w-5 rounded-full border flex items-center justify-center transition-colors',
            category ? 'border-ink bg-ink' : 'border-hairline-strong',
          )}>
            {category
              ? <CheckCircle2 size={12} className="text-paper" strokeWidth={2.5} />
              : <span className="font-mono text-[9px] text-ink-faint">2</span>
            }
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            What looks wrong?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {DEBUGGER_CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => setCategory(c)}
              className={cn(
                'w-full text-left rounded-lg border px-3 py-2.5 transition-all',
                category === c
                  ? 'border-ink bg-ink/[0.04] text-ink shadow-sm'
                  : 'border-hairline hover:border-ink/25 hover:bg-paper-elevated text-ink-muted hover:text-ink',
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {category === c
                    ? <CheckCircle2 size={13} className="text-ink" />
                    : <Circle size={13} className="text-ink-faint/50" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium leading-snug">{c}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5 leading-snug">{CATEGORY_HINTS[c]}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — Explain */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className={cn(
            'h-5 w-5 rounded-full border flex items-center justify-center transition-colors',
            why.trim() ? 'border-ink bg-ink' : 'border-hairline-strong',
          )}>
            {why.trim()
              ? <CheckCircle2 size={12} className="text-paper" strokeWidth={2.5} />
              : <span className="font-mono text-[9px] text-ink-faint">3</span>
            }
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Explain your reasoning
          </p>
        </div>

        <textarea
          value={why}
          onChange={e => setWhy(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder={
            category
              ? `Why is "${category}" a problem here? Be specific — mention which class or method makes this a ${category.toLowerCase()}.`
              : 'First pick a category above, then explain what you noticed…'
          }
          className="w-full resize-none rounded-xl border border-hairline bg-paper-elevated px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint/60 outline-none focus:border-ink/40 transition-colors leading-relaxed"
        />
        {why.trim() && (
          <p className="mt-1 text-right font-mono text-[10px] text-ink-faint">
            {why.trim().split(/\s+/).length} words
          </p>
        )}
      </div>

      {/* Save button */}
      <button
        type="button"
        disabled={!canSave}
        onClick={() => onSave({ elementId, category, why: why.trim() })}
        className={cn(
          'w-full rounded-xl py-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-all',
          canSave
            ? 'bg-ink text-paper hover:bg-ink/85 shadow-sm'
            : 'bg-paper-elevated text-ink-faint cursor-not-allowed',
        )}
      >
        {canSave ? '✓ Save mark' : 'Complete steps above to save'}
      </button>
    </div>
  )
}

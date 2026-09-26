'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hint {
  title: string
  body: string
  icon: string
  principle: string
}

// ─── Static heuristic analyzer ────────────────────────────────────────────────

function analyzeForHints(briefing: string, requirements: string[]): Hint[] {
  const hints: Hint[] = []
  const lower = (briefing + ' ' + requirements.join(' ')).toLowerCase()

  if (lower.includes('responsibilit') || (lower.includes('process') && lower.includes('manage'))) {
    hints.push({
      title: 'Check Responsibilities',
      body: 'Look for a class that seems to be doing multiple things. Classes should have one clear job.',
      icon: '🎯',
      principle: 'Single Responsibility',
    })
  }
  if (lower.includes('direct') || lower.includes('concrete') || lower.includes('hard-code')) {
    hints.push({
      title: 'Check Dependencies',
      body: 'Look for classes that directly instantiate other concrete classes. Consider what abstractions could replace those dependencies.',
      icon: '🔗',
      principle: 'Dependency Inversion',
    })
  }
  if (lower.includes('extend') || (lower.includes('add') && lower.includes('feature'))) {
    hints.push({
      title: 'Plan for Extension',
      body: 'Some functionality might be easier to extend if it lives behind an interface rather than in a class directly.',
      icon: '📈',
      principle: 'Open/Closed',
    })
  }
  if (hints.length === 0) {
    hints.push({
      title: 'Start with the God Class',
      body: 'Look for the largest class in the design. If it has many attributes and methods, it might be doing too much.',
      icon: '👁',
      principle: 'Cohesion',
    })
  }
  return hints.slice(0, 2)
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface GuidedStartPanelProps {
  briefing: string
  requirements: string[]
  constraints?: string[]
  diagramSummary?: string
  /** Pass true after first submission to show the "Hide hints" toggle */
  submitted?: boolean
  className?: string
}

export function GuidedStartPanel({
  briefing,
  requirements,
  submitted = false,
  className,
}: GuidedStartPanelProps) {
  const [open, setOpen] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const hints = analyzeForHints(briefing, requirements)

  if (dismissed) return null

  return (
    <div
      className={cn(
        'shrink-0 border-b border-amber-200/60 bg-amber-50/40 text-[13px]',
        className,
      )}
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left sm:px-6"
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          💡 Where to start
        </span>
        {open ? (
          <ChevronUp size={14} className="text-amber-500" />
        ) : (
          <ChevronDown size={14} className="text-amber-500" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {hints.map(hint => (
              <div
                key={hint.title}
                className="rounded-lg border border-amber-200/80 bg-white/70 px-4 py-3 shadow-sm"
              >
                {/* Icon + title */}
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[18px] leading-none">{hint.icon}</span>
                  <span className="font-medium text-ink">{hint.title}</span>
                </div>

                {/* Body */}
                <p className="text-[12px] leading-relaxed text-ink-muted">{hint.body}</p>

                {/* Principle badge */}
                <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  {hint.principle}
                </span>
              </div>
            ))}
          </div>

          {/* Shown only after first submit */}
          {submitted && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="mt-3 text-[12px] text-ink-faint transition-colors hover:text-ink-muted"
            >
              Hide hints ↑
            </button>
          )}
        </div>
      )}
    </div>
  )
}

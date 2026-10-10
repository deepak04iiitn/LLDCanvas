'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'debugger_walkthrough_seen'

const STEPS = [
  {
    number: 1,
    icon: '🔍',
    title: 'Inspect the Design',
    body: 'Use the Inspect tool (click the magnifier in the toolbar) to click any class in the diagram. The side panel shows its dependencies, attributes, and relationships — use this to understand what each class knows about.',
    tip: 'Start by reading the diagram top-to-bottom before marking anything.',
  },
  {
    number: 2,
    icon: '🚩',
    title: 'Find Issues',
    body: 'If a class has too many dependencies, handles multiple unrelated responsibilities, or depends on concrete implementations instead of abstractions — switch to the Mark Issue tool and click the suspect class to flag it.',
    tip: "Look for classes with 4+ outgoing dependencies or names like \"Manager\", \"Handler\", \"Processor\" — they're often doing too much.",
  },
  {
    number: 3,
    icon: '🩺',
    title: 'Diagnose & Fix',
    body: "After marking suspects, classify each issue type (e.g. Tight Coupling, SRP Violation) and write a short explanation of why it's a problem. Good diagnosis shows interviewers you understand the principle, not just the symptom.",
    tip: 'Hover over each issue type label to see a description and interview context before selecting.',
  },
]

export interface DebuggerWalkthroughProps {
  onDismiss: () => void
}

export function DebuggerWalkthrough({ onDismiss }: DebuggerWalkthroughProps) {
  const [step, setStep] = useState(0)

  // Mark as seen immediately so repeated re-renders don't re-show
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore — storage may be unavailable
    }
  }, [])

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-hairline bg-paper shadow-2xl">
        {/* Skip */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-faint hover:text-ink transition-colors"
          aria-label="Skip walkthrough"
        >
          <X size={12} />
          Skip
        </button>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {STEPS.map((s, i) => (
            <button
              key={s.number}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Go to step ${s.number}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === step ? 'w-6 bg-brand' : 'w-1.5 bg-hairline hover:bg-ink-faint',
              )}
            />
          ))}
        </div>

        <div className="px-8 pb-8 pt-5">
          {/* Step label */}
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Step {current.number} of {STEPS.length}
          </p>

          {/* Icon + title */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{current.icon}</span>
            <h2 className="font-serif text-xl font-medium text-ink">{current.title}</h2>
          </div>

          {/* Body */}
          <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{current.body}</p>

          {/* Tip */}
          <div className="mt-4 rounded-lg bg-brand-tint/50 px-3.5 py-3 text-[12px] leading-relaxed text-brand">
            <span className="font-semibold">Tip: </span>
            {current.tip}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              className="rounded-md px-3 py-1.5 text-[13px] text-ink-muted hover:text-ink disabled:opacity-0 transition-colors"
            >
              ← Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-md bg-brand px-5 py-2 text-[13px] font-medium text-brand-foreground hover:bg-brand-hover transition-colors"
              >
                Got it, start debugging →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="rounded-md bg-brand px-5 py-2 text-[13px] font-medium text-brand-foreground hover:bg-brand-hover transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Returns true if the walkthrough has never been seen */
export function shouldShowWalkthrough(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

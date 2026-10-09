'use client'

import { BookOpen, Lightbulb, OctagonAlert, Quote, Sparkles } from 'lucide-react'
import {
  FEATURE_INSTRUCTIONS,
  type FeatureInstructionKey,
} from '@/lib/feature-instructions'
import { cn } from '@/lib/utils'

interface FeatureInstructionsPanelProps {
  featureKey: FeatureInstructionKey
  className?: string
}

export function FeatureInstructionsPanel({ featureKey, className }: FeatureInstructionsPanelProps) {
  const guide = FEATURE_INSTRUCTIONS[featureKey]
  if (!guide) return null

  return (
    <div className={cn('mx-auto max-w-3xl', className)}>
      {/* Hero */}
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-paper-elevated px-3 py-1">
          <BookOpen size={12} className="text-brand" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Instructions
          </span>
        </div>
        <h2 className="font-serif text-[32px] sm:text-[40px] font-medium leading-[1.1] tracking-tight text-ink">
          {guide.title}
        </h2>
        <p className="mt-2 font-serif text-[18px] italic text-ink-faint leading-snug">
          {guide.tagline}
        </p>
        <p className="mt-5 text-[15px] text-ink-muted leading-relaxed max-w-2xl">
          {guide.goal}
        </p>
      </div>

      {/* Steps */}
      <section className="mb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-5">
          What to do
        </p>
        <ol className="space-y-0 border border-hairline rounded-2xl overflow-hidden bg-paper-elevated">
          {guide.steps.map((step, i) => (
            <li
              key={step.title}
              className={cn(
                'flex gap-5 px-5 py-5 sm:px-6',
                i > 0 && 'border-t border-hairline',
              )}
            >
              <span className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-paper font-mono text-[11px] font-semibold text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-[17px] font-medium text-ink leading-snug">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13px] text-ink-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tips + Avoid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-12">
        <section className="rounded-2xl border border-hairline bg-emerald-50/40 px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={14} className="text-emerald-600" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700/80">
              Make the most of it
            </p>
          </div>
          <ul className="space-y-3">
            {guide.tips.map(tip => (
              <li key={tip} className="flex gap-2.5 text-[13px] text-ink leading-relaxed">
                <Sparkles size={12} className="mt-1 shrink-0 text-emerald-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-hairline bg-rose-50/40 px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <OctagonAlert size={14} className="text-rose-500" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-600/80">
              Common traps
            </p>
          </div>
          <ul className="space-y-3">
            {guide.avoid.map(item => (
              <li key={item} className="flex gap-2.5 text-[13px] text-ink leading-relaxed">
                <span className="mt-0.5 shrink-0 font-semibold text-rose-400">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Interview tip */}
      <blockquote className="rounded-2xl border border-hairline bg-paper-elevated px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2 mb-3">
          <Quote size={14} className="text-ink-faint" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Interview signal
          </p>
        </div>
        <p className="font-serif text-[17px] sm:text-[19px] font-medium italic leading-relaxed text-ink">
          “{guide.interviewTip}”
        </p>
      </blockquote>
    </div>
  )
}

/** Problems | Instructions primary switcher for problem libraries. */
export function ProblemsInstructionsTabs({
  view,
  onChange,
}: {
  view: 'problems' | 'instructions'
  onChange: (v: 'problems' | 'instructions') => void
}) {
  return (
    <div className="flex items-center gap-0">
      {(
        [
          { id: 'problems' as const, label: 'Problems' },
          { id: 'instructions' as const, label: 'Instructions' },
        ]
      ).map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-[12px] font-medium border-b-2 transition-all',
            view === tab.id
              ? 'border-ink text-ink'
              : 'border-transparent text-ink-faint hover:text-ink-muted',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

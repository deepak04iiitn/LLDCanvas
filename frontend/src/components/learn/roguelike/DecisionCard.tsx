'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Stage, DecisionOption } from '@/lib/learn-api'

interface Props {
  stage: Stage
  onDecide: (option: DecisionOption) => void
  onCanvasInstead: (() => void) | null
  onSkip: () => void
}

const OPTION_COLORS: Record<string, string> = {
  A: 'border-blue-300 bg-blue-50 text-blue-700',
  B: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  C: 'border-amber-300 bg-amber-50 text-amber-700',
  D: 'border-purple-300 bg-purple-50 text-purple-700',
}

const OPTION_SELECTED: Record<string, string> = {
  A: 'ring-2 ring-blue-400',
  B: 'ring-2 ring-emerald-400',
  C: 'ring-2 ring-amber-400',
  D: 'ring-2 ring-purple-400',
}

const TAG_COLORS: Record<string, string> = {
  higher_coupling: 'bg-red-100 text-red-700',
  abstraction_added: 'bg-blue-100 text-blue-700',
  duplication_risk: 'bg-amber-100 text-amber-700',
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600'
}

export function DecisionCard({ stage, onDecide, onCanvasInstead, onSkip }: Props) {
  const [selected, setSelected] = useState<DecisionOption | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const options = stage.event.decisions ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-hairline px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-lg font-semibold text-ink">{stage.event.title}</h2>
          <p className="mt-1 text-[13px] text-ink-muted">How do you approach this?</p>
          <p className="mt-2 text-[11px] text-ink-faint italic">
            There is no single correct answer. Your choice shapes the rest of the run.
          </p>
        </div>

        {/* Options */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelected(selected?.id === opt.id ? null : opt)}
                onMouseEnter={() => setHovered(opt.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-150 hover:shadow-md',
                  OPTION_COLORS[opt.id],
                  selected?.id === opt.id && OPTION_SELECTED[opt.id],
                )}
              >
                {/* Letter badge */}
                <div className="flex items-start gap-2.5">
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[13px] font-bold',
                    OPTION_COLORS[opt.id],
                  )}>
                    {opt.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[13px] text-ink leading-tight">{opt.label}</p>
                    <p className="mt-1 text-[12px] text-ink-muted leading-snug">{opt.description}</p>
                  </div>
                </div>

                {/* Tags */}
                {opt.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {opt.tags.map(tag => (
                      <span key={tag} className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-mono', getTagColor(tag))}>
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Consequence tooltip on hover */}
                {(hovered === opt.id || selected?.id === opt.id) && opt.consequence && (
                  <div className="mt-2.5 rounded-lg border border-hairline bg-paper/80 px-3 py-2">
                    <p className="text-[11px] text-ink-muted leading-snug">
                      <span className="font-mono text-[10px] text-ink-faint uppercase tracking-wider mr-1">Consequence:</span>
                      {opt.consequence}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-hairline px-5 py-3 bg-paper-elevated shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onCanvasInstead && (
                <button
                  onClick={onCanvasInstead}
                  className="text-[12px] text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
                >
                  Design on Canvas instead
                </button>
              )}
              <button
                onClick={onSkip}
                className="text-[12px] text-ink-faint hover:text-red-500 transition-colors"
                title="Skipping adds +3 debt"
              >
                Skip stage <span className="text-red-400">+3 debt</span>
              </button>
            </div>
            <button
              disabled={!selected}
              onClick={() => selected && onDecide(selected)}
              className="rounded-lg bg-brand px-5 py-2 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selected ? `Confirm: Option ${selected.id}` : 'Select an option'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

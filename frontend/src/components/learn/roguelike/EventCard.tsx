'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stage } from '@/lib/learn-api'

interface Props {
  stage: Stage
  onContinue: () => void
  onSkip: () => void
  onRefactor: () => void
  debtAmount?: number
}

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  requirement: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  scale:        { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  failure:      { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  business:     { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  team:         { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
  time:         { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  constraint:   { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' },
  boss:         { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-200 text-red-800' },
}

const EVENT_ICONS: Record<string, string> = {
  requirement: '🆕', scale: '📈', failure: '🔥', business: '🏢',
  team: '👥', time: '⏱️', constraint: '🔒', boss: '🐉',
}

export function EventCard({ stage, onContinue, onSkip, onRefactor, debtAmount = 0 }: Props) {
  const [hintOpen, setHintOpen] = useState(false)
  const { event } = stage
  const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.requirement
  const icon = EVENT_ICONS[event.type] ?? '❓'
  const isBoss = stage.isBoss || event.type === 'boss'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden">
        {/* Boss banner */}
        {isBoss && (
          <div className="bg-red-600 px-4 py-1.5 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-white">
              🐉 BOSS ENCOUNTER
            </p>
          </div>
        )}

        {/* Header */}
        <div className={cn('px-5 pt-5 pb-4 border-b border-hairline', colors.bg)}>
          <div className="flex items-start gap-3">
            <span className="text-4xl leading-none">{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] font-medium', colors.badge)}>
                  {event.type}
                </span>
                {stage.isCheckpoint && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                    💾 Checkpoint ahead
                  </span>
                )}
              </div>
              <h2 className={cn('mt-2 text-xl font-semibold leading-tight', colors.text)}>
                {stage.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-[14px] leading-relaxed text-ink">
            {event.description}
          </p>

          {event.successCriteria && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-600 mb-1">Success Criteria</p>
              <p className="text-[13px] text-emerald-800">{event.successCriteria}</p>
            </div>
          )}

          {event.hint && (
            <div className="rounded-lg border border-hairline bg-paper-elevated">
              <button
                onClick={() => setHintOpen(v => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-[12px] text-ink-muted hover:text-ink transition-colors"
              >
                <span className="font-mono uppercase tracking-wider text-[10px]">💡 Hint</span>
                <ChevronDown size={14} className={cn('transition-transform', hintOpen && 'rotate-180')} />
              </button>
              {hintOpen && (
                <div className="border-t border-hairline px-3 py-2">
                  <p className="text-[13px] text-ink-muted">{event.hint}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-hairline px-5 py-3 bg-paper-elevated">
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              title="Skip this stage — adds +3 debt"
              className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted border border-hairline hover:bg-hairline/40 transition-colors"
            >
              Skip <span className="text-red-500 text-[10px]">+3 debt</span>
            </button>
            {debtAmount > 10 && (
              <button
                onClick={onRefactor}
                title="Refactor first — reduces debt by 5"
                className="rounded-md px-3 py-1.5 text-[12px] text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Refactor First <span className="text-emerald-600 text-[10px]">-5 debt</span>
              </button>
            )}
          </div>
          <button
            onClick={onContinue}
            className="rounded-lg bg-brand px-5 py-2 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

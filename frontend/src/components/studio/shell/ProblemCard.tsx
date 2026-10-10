'use client'

import { ArrowRight, CheckCircle2, Loader2, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudioPackSummary } from '@/lib/studio-api'
import { packIdOf } from '@/lib/studio-api'
import { LockedChallengeOverlay, challengeLockFrom } from '@/components/billing/ChallengeLockCue'

export type ProblemStatus = 'not_started' | 'in_progress' | 'completed'

const DIFFICULTY_BAR: Record<string, string> = {
  easy:   'bg-emerald-400',
  medium: 'bg-amber-400',
  hard:   'bg-rose-500',
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard:   'bg-rose-50 text-rose-700 border-rose-200',
}

const STATUS_CONFIG: Record<ProblemStatus, { label: string; icon: React.ElementType; className: string }> = {
  not_started: { label: 'Start',    icon: Play,        className: 'bg-brand text-white hover:opacity-90' },
  in_progress: { label: 'Continue', icon: ArrowRight,  className: 'bg-brand text-white hover:opacity-90' },
  completed:   { label: 'Review',   icon: RotateCcw,   className: 'border border-brand text-brand hover:bg-brand-tint/30' },
}

export interface ProblemCardProps {
  pack: StudioPackSummary
  status?: ProblemStatus
  isStarting?: boolean
  onStart: (pack: StudioPackSummary) => void
  className?: string
}

export function ProblemCard({ pack, status = 'not_started', isStarting, onStart, className }: ProblemCardProps) {
  const diff = (pack.difficulty ?? 'easy').toLowerCase() as string
  const s = STATUS_CONFIG[status]
  const Icon = s.icon

  const card = (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-hairline bg-paper-elevated overflow-hidden transition-all duration-200',
        !pack.locked && 'hover:shadow-md hover:border-brand/20',
        className,
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', DIFFICULTY_BAR[diff] ?? 'bg-brand/30')} />

      <div className="flex-1 flex flex-col pl-5 pr-5 pt-5 pb-4 ml-0.5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide',
            DIFFICULTY_BADGE[diff] ?? 'bg-paper border-hairline text-ink-muted',
          )}>
            {pack.difficulty ?? 'easy'}
          </span>

          {status === 'completed' && (
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          )}
          {status === 'in_progress' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              In Progress
            </span>
          )}
        </div>

        <h3 className="font-serif text-[15px] font-medium text-ink leading-snug mb-1.5 group-hover:text-brand transition-colors">
          {pack.title}
        </h3>

        {pack.description && (
          <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 flex-1 mb-3">
            {pack.description}
          </p>
        )}

        {pack.tags && pack.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pack.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-md bg-paper border border-hairline px-2 py-0.5 font-mono text-[9px] text-ink-faint uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}

        {!pack.locked && (
          <button
            type="button"
            disabled={isStarting}
            onClick={() => onStart(pack)}
            className={cn(
              'mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all',
              s.className,
              isStarting && 'opacity-60 cursor-not-allowed',
            )}
          >
            {isStarting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Icon size={13} fill={status === 'not_started' ? 'currentColor' : 'none'} />
            )}
            {isStarting ? 'Opening…' : s.label}
          </button>
        )}
      </div>
    </div>
  )

  if (pack.locked) {
    return (
      <LockedChallengeOverlay
        from={challengeLockFrom(String(pack.type || 'challenge'), pack.requiredPlan)}
        className="rounded-2xl"
      >
        {card}
      </LockedChallengeOverlay>
    )
  }

  return card
}

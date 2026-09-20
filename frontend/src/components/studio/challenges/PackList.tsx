'use client'

import { Loader2, Play } from 'lucide-react'
import type { StudioPackSummary } from '@/lib/studio-api'
import { packIdOf } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

const DIFFICULTY_TONE: Record<string, string> = {
  easy: 'text-emerald-700',
  medium: 'text-amber-700',
  hard: 'text-rose-700',
}

export interface PackListProps {
  packs: StudioPackSummary[]
  loading?: boolean
  emptyMessage?: string
  startingId?: string | null
  onStart: (pack: StudioPackSummary) => void
  className?: string
}

export function PackList({
  packs,
  loading,
  emptyMessage = 'No published packs yet.',
  startingId,
  onStart,
  className,
}: PackListProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center gap-2 py-16 text-ink-muted', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading packs…</span>
      </div>
    )
  }

  if (packs.length === 0) {
    return (
      <div className={cn('py-16 text-center', className)}>
        <p className="text-[13px] text-ink-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {packs.map(pack => {
        const id = packIdOf(pack)
        const busy = startingId === id
        return (
          <li
            key={id}
            className="flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-serif text-base font-medium text-ink">{pack.title}</h3>
              <span
                className={cn(
                  'shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wide',
                  DIFFICULTY_TONE[pack.difficulty] ?? 'text-ink-faint',
                )}
              >
                {pack.difficulty}
              </span>
            </div>
            {pack.description && (
              <p className="mb-3 flex-1 text-[13px] leading-relaxed text-ink-muted">
                {pack.description}
              </p>
            )}
            {pack.tags && pack.tags.length > 0 && (
              <p className="mb-4 font-mono text-[10px] text-ink-faint">
                {pack.tags.join(' · ')}
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => onStart(pack)}
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" fill="currentColor" />
              )}
              {busy ? 'Starting…' : 'Start'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

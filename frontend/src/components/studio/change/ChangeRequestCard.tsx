'use client'

import { cn } from '@/lib/utils'

export interface ChangeRequestCardProps {
  title?: string
  body?: string
  type?: string
  constraints?: string[]
  briefing?: string
  className?: string
}

export function ChangeRequestCard({
  title,
  body,
  type,
  constraints = [],
  briefing,
  className,
}: ChangeRequestCardProps) {
  return (
    <div className={cn('border-b border-hairline bg-paper px-4 py-4 sm:px-6', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
        Change request{type ? ` · ${type}` : ''}
      </p>
      <h2 className="mt-1 font-serif text-xl text-ink">{title ?? 'Update required'}</h2>

      {briefing && (
        <div className="mt-3 rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Situation · read this first
          </p>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{briefing}</p>
        </div>
      )}

      {body && (
        <div className="mt-3">
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            What product wants
          </p>
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">{body}</p>
        </div>
      )}

      {constraints.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Hard rules (don’t break these)
          </p>
          <ul className="space-y-1">
            {constraints.map(c => (
              <li key={c} className="flex gap-2 text-[13px] text-ink">
                <span className="text-rose-600">✕</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

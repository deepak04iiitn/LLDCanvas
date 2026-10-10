'use client'

import Link from 'next/link'
import { ArrowUpRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Pricing `from=` key for challenge locks. */
export function challengeLockFrom(
  feature: string,
  requiredPlan?: 'free' | 'pro' | 'ultimate' | string,
): string {
  return `${feature}_${requiredPlan === 'ultimate' ? 'hard' : 'medium'}`
}

/**
 * Blurry hide-lock overlay matching Practice Problems.
 * Row/card content is not tappable — Upgrade is the only action.
 */
export function LockedChallengeOverlay({
  from,
  children,
  className,
}: {
  from: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-paper/75 backdrop-blur-[1.5px]">
        <Link
          href={`/pricing?from=${encodeURIComponent(from)}`}
          className="inline-flex items-center gap-3 border border-hairline bg-paper px-4 py-2.5 shadow-sm transition-colors hover:border-brand/30 hover:bg-paper-elevated"
        >
          <Lock className="h-3.5 w-3.5 text-ink-faint" />
          <span className="text-xs text-ink-muted">Locked on your plan</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
            Upgrade <ArrowUpRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Compact lock cue for catalog rows — links to pricing with a from= query. */
export function ChallengeLockCue({
  requiredPlan = 'pro',
  from,
  className,
}: {
  requiredPlan?: 'pro' | 'ultimate'
  from: string
  className?: string
}) {
  const label = requiredPlan === 'ultimate' ? 'Ultimate · Hard' : 'Pro'
  return (
    <Link
      href={`/pricing?from=${encodeURIComponent(from)}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
        requiredPlan === 'ultimate'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15'
          : 'border-brand/30 bg-brand/10 text-brand hover:bg-brand/15',
        className,
      )}
    >
      <Lock className="h-3 w-3" />
      {label}
    </Link>
  )
}

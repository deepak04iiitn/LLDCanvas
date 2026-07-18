'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UpgradeGateProps {
  /** Feature name to display */
  feature: string
  /** Minimum plan required */
  requiredPlan?: 'pro' | 'ultimate'
  /** Short description of what the feature offers */
  description?: string
  /** Compact inline variant vs full overlay */
  variant?: 'inline' | 'overlay' | 'banner'
  className?: string
}

const PLAN_COLORS: Record<string, string> = {
  pro:      'from-brand/20 to-brand/5 border-brand/30',
  ultimate: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  pro:      { label: 'Pro', cls: 'bg-brand/10 text-brand border border-brand/20' },
  ultimate: { label: 'Ultimate', cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' },
}

export function UpgradeGate({
  feature,
  requiredPlan = 'pro',
  description,
  variant = 'inline',
  className,
}: UpgradeGateProps) {
  const badge  = PLAN_BADGE[requiredPlan]
  const colors = PLAN_COLORS[requiredPlan]

  if (variant === 'banner') {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl border bg-linear-to-r px-4 py-3 text-sm', colors, className)}>
        <Lock className="h-4 w-4 shrink-0 text-ink-muted" />
        <p className="flex-1 text-ink-muted">
          <span className="font-medium text-ink">{feature}</span> requires{' '}
          <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold', badge.cls)}>
            {badge.label}
          </span>
        </p>
        <Link
          href="/pricing"
          className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 transition-colors"
        >
          Upgrade <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className={cn('relative flex flex-col items-center justify-center rounded-2xl border bg-linear-to-br p-10 text-center', colors, className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10"
        >
          <Sparkles className="h-7 w-7 text-brand" />
        </motion.div>

        <span className={cn('mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badge.cls)}>
          {badge.label} Feature
        </span>

        <h3 className="mb-2 text-lg font-semibold text-ink">{feature}</h3>
        {description && (
          <p className="mb-6 max-w-xs text-sm text-ink-muted">{description}</p>
        )}

        <Link
          href="/pricing"
          className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
        >
          Upgrade to {badge.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  // inline (default)
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border bg-linear-to-r px-3 py-2 text-sm', colors, className)}>
      <Lock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
      <span className="text-ink-muted">
        <span className="font-medium text-ink">{feature}</span> is a{' '}
        <span className={cn('inline-flex items-center rounded px-1 py-0.5 text-xs font-semibold', badge.cls)}>
          {badge.label}
        </span>{' '}
        feature
      </span>
      <Link href="/pricing" className="ml-auto shrink-0 text-xs font-medium text-brand hover:underline">
        Upgrade
      </Link>
    </div>
  )
}

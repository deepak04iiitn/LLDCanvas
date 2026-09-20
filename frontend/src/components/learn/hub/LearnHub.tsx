'use client'

import Link from 'next/link'
import { ArrowRight, GraduationCap, Lock } from 'lucide-react'
import {
  getFeaturesByCategory,
  type FeatureDefinition,
} from '@/lib/features/feature-registry'
import { isFeatureEnabled } from '@/lib/features/flags'
import { cn } from '@/lib/utils'

function FeatureCard({ feature }: { feature: FeatureDefinition }) {
  const enabled = isFeatureEnabled(feature.flagKey)
  const locked = !enabled

  return (
    <Link
      href={locked ? '#' : feature.href}
      aria-disabled={locked}
      onClick={e => {
        if (locked) e.preventDefault()
      }}
      className={cn(
        'group flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5 transition-all',
        locked
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-brand/30 hover:shadow-sm',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-serif text-base font-medium text-ink group-hover:text-brand">
          {feature.label}
        </h3>
        {feature.minPlan && feature.minPlan !== 'free' && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-amber-600">
            <Lock size={10} />
            {feature.minPlan === 'ultimate' ? 'Ult.' : 'Pro'}
          </span>
        )}
      </div>
      <p className="flex-1 text-[13px] leading-relaxed text-ink-muted">
        {feature.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
        {locked ? 'Coming soon' : 'Open'}
        {!locked && (
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        )}
      </span>
    </Link>
  )
}

export function LearnHub() {
  const features = getFeaturesByCategory('learn')

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <GraduationCap size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Product
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Learn &amp; Practice
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Quiz, detective scenarios, mashups, and design score — deliberate
              practice for LLD interviews.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </div>
  )
}

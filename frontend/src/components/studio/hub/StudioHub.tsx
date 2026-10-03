'use client'

import Link from 'next/link'
import { BarChart3, Bug, Lock, TrendingUp, Wrench, Zap } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import {
  getFeaturesByCategory,
  type FeatureDefinition,
} from '@/lib/features/feature-registry'
import { isFeatureEnabled } from '@/lib/features/flags'
import { cn } from '@/lib/utils'

const FEATURE_ICONS: Record<string, React.ElementType> = {
  debugger: Bug,
  refactor: Wrench,
  'change-one': Zap,
  evolution: TrendingUp,
  budget: BarChart3,
}

const PRACTICE_IDS = ['debugger', 'refactor', 'change-one', 'evolution', 'budget']

function FeatureCard({ feature }: { feature: FeatureDefinition }) {
  const enabled = isFeatureEnabled(feature.flagKey)
  const locked = !enabled
  const Icon = (FEATURE_ICONS[feature.id] ?? Bug) as React.ElementType

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5',
        locked && 'opacity-60',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        {feature.minPlan && feature.minPlan !== 'free' && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
            <Lock size={10} />
            {feature.minPlan === 'ultimate' ? 'Ult.' : 'Pro'}
          </span>
        )}
      </div>
      <h3 className="font-serif text-lg font-medium text-ink">{feature.label}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-muted">
        {feature.description}
      </p>
      {locked ? (
        <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-ink-faint">
          <Lock size={11} />
          Requires {feature.minPlan === 'ultimate' ? 'Ultimate' : 'Pro'}
        </div>
      ) : (
        <Link
          href={feature.href}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Open
        </Link>
      )}
    </div>
  )
}

function FeatureSection({
  label,
  features,
}: {
  label: string
  features: FeatureDefinition[]
}) {
  if (features.length === 0) return null
  return (
    <section className="mb-10">
      <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(f => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </section>
  )
}

export function StudioHub() {
  const features = getFeaturesByCategory('design-studio')
  const practiceFeatures = features.filter(f => PRACTICE_IDS.includes(f.id))

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <SectionHeader
          eyebrow="Design Studio"
          title="Practice Challenges"
          subtitle="Critique, evolve, and inspect architectures — challenge modes and in-editor analysis tools."
          className="mb-10"
        />
        <FeatureSection label="Practice Challenges" features={practiceFeatures} />
      </div>
    </div>
  )
}

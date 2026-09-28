'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight, type LucideIcon,
  Loader2, Sparkles, Target, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { studioApi } from '@/lib/studio-api'

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface HowItWorksStep {
  step: number
  title: string
  description: string
}

export interface SkillItem {
  label: string
  description?: string
  icon?: LucideIcon
}

export interface FeatureStats {
  total: number
  completed: number
  inProgress: number
}

export interface FeatureOverviewProps {
  title: string
  tagline: string
  description: string
  /** Lucide icon component */
  icon: LucideIcon
  /** Tailwind bg class for the hero icon circle */
  accentBg?: string
  /** Tailwind text class for the hero icon */
  accentText?: string
  howItWorks: HowItWorksStep[]
  skills: SkillItem[]
  interviewRelevance: string
  /** Example scenarios / what you'll practice */
  exampleScenarios?: string[]
  /** Href to the problem library for this feature */
  problemsHref: string
  /** StudioPackType to auto-load total problem count (optional) */
  packType?: string | null
  /** Override stats loading entirely */
  statsLoader?: () => Promise<FeatureStats>
  /** Override the section eyebrow label (defaults to 'Design Studio') */
  sectionLabel?: string
}

// ─── Small stat chip ─────────────────────────────────────────────────────────

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-hairline bg-paper-elevated px-5 py-3.5 min-w-20">
      <span className="font-mono text-xl font-bold text-ink">{value}</span>
      <span className="text-[11px] text-ink-faint text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeatureOverview({
  title,
  tagline,
  description,
  icon: Icon,
  accentBg = 'bg-brand-tint',
  accentText = 'text-brand',
  howItWorks,
  skills,
  interviewRelevance,
  exampleScenarios,
  problemsHref,
  packType,
  statsLoader,
  sectionLabel = 'Design Studio',
}: FeatureOverviewProps) {
  const [stats,       setStats]       = useState<FeatureStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Load pack count for stats
  useEffect(() => {
    if (!packType && !statsLoader) return
    setStatsLoading(true)
    ;(async () => {
      try {
        if (statsLoader) {
          setStats(await statsLoader())
        } else if (packType) {
          const res = await studioApi.packs.list(packType)
          const packs = res.packs ?? []
          setStats({ total: packs.length, completed: 0, inProgress: 0 })
        }
      } catch { /* silent */ }
      finally { setStatsLoading(false) }
    })()
  }, [packType, statsLoader])

  const hasStarted = stats && (stats.completed > 0 || stats.inProgress > 0)
  const ctaLabel   = hasStarted ? 'Continue Practicing' : 'Explore Problems'

  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-b from-brand-tint/35 to-paper border-b border-hairline/60 px-6 pt-10 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Icon */}
            <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', accentBg)}>
              <Icon size={26} className={accentText} strokeWidth={1.75} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand mb-1">
                {sectionLabel}
              </p>
              <h1 className="font-serif text-3xl font-medium text-ink leading-tight mb-1.5">
                {title}
              </h1>
              <p className="text-[15px] text-ink-muted leading-relaxed max-w-2xl">
                {tagline}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {statsLoading ? (
              <Loader2 size={14} className="animate-spin text-ink-faint" />
            ) : stats ? (
              <>
                <StatChip value={stats.total} label="Problems" />
                {stats.completed > 0 && <StatChip value={stats.completed} label="Completed" />}
                {stats.inProgress > 0 && <StatChip value={stats.inProgress} label="In Progress" />}
              </>
            ) : null}

            {/* CTA */}
            <Link
              href={problemsHref}
              className="ml-auto flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              {ctaLabel}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-12">

        {/* Description */}
        <p className="text-[15px] text-ink leading-[1.8] max-w-3xl">
          {description}
        </p>

        {/* How it works */}
        <section>
          <h2 className="font-serif text-xl font-medium text-ink mb-6">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {howItWorks.map(step => (
              <div key={step.step} className="rounded-2xl border border-hairline bg-paper-elevated p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white font-mono text-[12px] font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-[14px] text-ink leading-tight">{step.title}</h3>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Two-column: Skills + Interview relevance */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Skills */}
          <section className="rounded-2xl border border-hairline bg-paper-elevated p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-tint">
                <Target size={14} className="text-brand" />
              </div>
              <h2 className="font-serif text-base font-medium text-ink">Skills you&apos;ll build</h2>
            </div>
            <ul className="space-y-3">
              {skills.map(skill => (
                <li key={skill.label} className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand/60" />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{skill.label}</p>
                    {skill.description && (
                      <p className="text-[12px] text-ink-muted mt-0.5">{skill.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Interview relevance */}
          <section className="rounded-2xl border border-brand/20 bg-brand-tint/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
                <Users size={14} className="text-brand" />
              </div>
              <h2 className="font-serif text-base font-medium text-ink">Interview relevance</h2>
            </div>
            <p className="text-[13px] text-ink leading-[1.75]">{interviewRelevance}</p>
          </section>
        </div>

        {/* Example scenarios */}
        {exampleScenarios && exampleScenarios.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-ink-faint" />
              <h2 className="font-serif text-lg font-medium text-ink">What you&apos;ll practice</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {exampleScenarios.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  <ChevronRight size={14} className="mt-0.5 shrink-0 text-brand/50" />
                  <p className="text-[13px] text-ink">{s}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sparkles CTA bottom */}
        <div className="rounded-2xl border border-brand/20 bg-brand-tint/20 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles size={18} className="text-brand shrink-0" />
            <div>
              <p className="font-semibold text-[14px] text-ink">Ready to practice?</p>
              <p className="text-[12px] text-ink-muted">Choose a problem and start solving.</p>
            </div>
          </div>
          <Link
            href={problemsHref}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
          >
            {ctaLabel} <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/dashboard/AppShell'
import { journeyApi, type SkillsPageResponse } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

// ─── Skill-to-practice link mapping ──────────────────────────────────────────
const SKILL_PRACTICE: Record<string, { label: string; href: string }> = {
  oop:                  { label: 'Study OOP in Plannr',           href: '/plannr/roadmap' },
  solid:                { label: 'Practice in Debug Lab',          href: '/dashboard/learn/debugger' },
  patterns:             { label: 'Train Pattern Recognition',      href: '/dashboard/learn/detective' },
  designThinking:       { label: 'Try Change One Thing',           href: '/dashboard/design-studio/change' },
  requirementAnalysis:  { label: 'Continue Plannr Roadmap',        href: '/plannr/roadmap' },
  entityIdentification: { label: 'Continue Plannr Roadmap',        href: '/plannr/roadmap' },
  responsibilities:     { label: 'Try Refactoring Mode',           href: '/dashboard/design-studio/refactor' },
  relationships:        { label: 'Study in Plannr',                href: '/plannr/roadmap' },
  extensibility:        { label: 'Try Change One Thing',           href: '/dashboard/design-studio/change' },
  coupling:             { label: 'Practice in Design Debugger',    href: '/dashboard/design-studio/debugger' },
  cohesion:             { label: 'Try Refactoring Mode',           href: '/dashboard/design-studio/refactor' },
  communication:        { label: 'Practice Experiences in Plannr', href: '/plannr/experiences' },
  tradeoffReasoning:    { label: 'Run LLD Roguelike',              href: '/dashboard/learn/roguelike' },
  followupHandling:     { label: 'Pattern Detective Mode',         href: '/dashboard/learn/detective' },
  designSpeed:          { label: 'Try Timed Challenges',           href: '/design-studio' },
}

// ─── Readiness ring ───────────────────────────────────────────────────────────
function ReadinessRing({ score, label }: { score: number; label: string }) {
  const size   = 160
  const stroke = 14
  const radius = (size - stroke) / 2
  const circ   = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor"
            strokeWidth={stroke}
            className="text-hairline"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-brand transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-bold text-ink">{score}</span>
          <span className="text-[11px] text-ink-faint">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Interview Readiness
        </p>
        <p className="font-serif text-xl font-medium mt-0.5 text-ink">{label}</p>
      </div>
    </div>
  )
}

// ─── Individual skill card ─────────────────────────────────────────────────────
function SkillCard({ skillKey, label, score }: { skillKey: string; label: string; score: number }) {
  const practice = SKILL_PRACTICE[skillKey]

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[13px] font-bold text-ink">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-hairline overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      {practice && (
        <Link
          href={practice.href}
          className="inline-block text-[11px] text-brand hover:underline"
        >
          {practice.label} →
        </Link>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardSkillsPage() {
  const [data, setData]     = useState<SkillsPageResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getSkillsPage()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!data || !data.skills) {
    return (
      <div className="h-full flex items-center justify-center text-ink-muted text-sm">
        Could not load skills. Start your Plannr journey first.
      </div>
    )
  }

  const skillKeys = Object.keys(data.skills) as string[]

  return (
    <AppShell>
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

        {/* Header */}
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
            Dashboard
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Skill Profile</h1>
          <p className="mt-2 text-[14px] text-ink-muted">Your progress across all 15 LLD interview dimensions.</p>
        </div>

        {/* Readiness ring (centered) */}
        <div className="flex justify-center py-4">
          <ReadinessRing score={data.interviewReadiness} label={data.readinessLabel} />
        </div>

        {/* Breakdown row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Skill Average',    value: `${data.breakdown.skillAverage}/100` },
            { label: 'Topics Completed', value: String(data.breakdown.totalTopicsCompleted) },
            { label: 'Stage Reached',    value: `Stage ${data.breakdown.stageReached}` },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-hairline bg-paper-elevated p-4 text-center">
              <p className="font-mono text-2xl font-bold text-ink">{s.value}</p>
              <p className="text-[11px] text-ink-faint mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Strengths & focus areas */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Top skills */}
          <div className="rounded-2xl border border-brand/20 bg-brand-tint/20 p-5 space-y-3">
            <h2 className="font-serif text-base font-medium text-ink">Your Strengths</h2>
            <div className="flex flex-wrap gap-2">
              {data.topSkills.map(s => (
                <span
                  key={s.key}
                  className="rounded-full bg-paper border border-hairline px-3 py-1 text-[12px] font-medium text-ink"
                >
                  {s.label} · {s.score}
                </span>
              ))}
            </div>
          </div>

          {/* Weak skills */}
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 space-y-3">
            <h2 className="font-serif text-base font-medium text-ink">Focus Areas</h2>
            <div className="space-y-2">
              {data.weakSkills.map(s => {
                const practice = SKILL_PRACTICE[s.key]
                return (
                  <div key={s.key} className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink-muted font-medium">
                      {s.label} <span className="font-normal text-ink-faint">({s.score})</span>
                    </span>
                    {practice && (
                      <Link
                        href={practice.href}
                        className="text-[11px] font-medium text-brand hover:underline shrink-0"
                      >
                        {practice.label} →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* All skill cards grid */}
        <div>
          <h2 className="font-serif text-xl font-medium text-ink mb-5">All Skills</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillKeys.map((key: string) => {
              const score = (data.skills as unknown as Record<string, number>)[key] ?? 0
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())
              return (
                <SkillCard
                  key={key}
                  skillKey={key}
                  label={label}
                  score={score}
                />
              )
            })}
          </div>
        </div>

      </div>
    </div>
    </AppShell>
  )
}

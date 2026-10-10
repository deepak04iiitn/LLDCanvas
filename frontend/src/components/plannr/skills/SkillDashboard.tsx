'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { journeyApi, type SkillsResponse, type SkillGroupEntry } from '@/lib/plannr-api'
import { ProgressRing } from '@/components/plannr/shared/ProgressRing'
import { cn } from '@/lib/utils'

const READINESS_CONFIG = {
  'not-started': {
    label: 'Not started',
    color: 'text-ink-muted',
    bg: 'bg-paper-elevated border-hairline',
    tip: 'Scores stay at zero until you practice, pass checks, or master a topic. Nothing is assumed.',
  },
  beginner: {
    label: 'Beginner',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    tip: 'Early evidence on your track. Keep completing practice and topics.',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    tip: "You're building momentum. Keep practicing daily.",
  },
  advanced: {
    label: 'Advanced',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    tip: 'Almost there! Tackle harder mocks and weak skills.',
  },
  'interview-ready': {
    label: 'Interview Ready',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    tip: "You're ready to ace LLD interviews on this track.",
  },
}

function SkillBar({ skill }: { skill: SkillGroupEntry }) {
  const isAssessed = skill.assessed === true
  const showScore = isAssessed

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-[12px]">
        <span className="text-ink-muted">{skill.label}</span>
        {showScore ? (
          <span
            className={cn(
              'font-medium tabular-nums',
              skill.score >= 70 ? 'text-green-600' : skill.score >= 40 ? 'text-amber-600' : 'text-red-600',
            )}
          >
            {skill.score}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Not assessed
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hairline">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            !showScore && 'bg-transparent',
            showScore && skill.score >= 70 && 'bg-green-500',
            showScore && skill.score >= 40 && skill.score < 70 && 'bg-amber-500',
            showScore && skill.score < 40 && 'bg-red-400',
          )}
          style={{ width: showScore ? `${skill.score}%` : '0%' }}
        />
      </div>
      {isAssessed && skill.recentReasons && skill.recentReasons.length > 0 && (
        <p className="text-[10px] leading-snug text-ink-faint">
          Why: {skill.recentReasons[0]}
        </p>
      )}
    </div>
  )
}

function SkillGroupCard({
  group,
}: {
  group: { label: string; skills: SkillGroupEntry[] }
}) {
  const assessed = group.skills.filter(s => s.assessed)
  const avg =
    assessed.length > 0
      ? Math.round(assessed.reduce((s, x) => s + x.score, 0) / assessed.length)
      : null

  return (
    <div className="space-y-4 rounded-2xl border border-hairline bg-paper p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14px] font-medium text-ink">{group.label}</h3>
        {avg !== null ? (
          <span
            className={cn(
              'font-mono text-[13px] font-bold tabular-nums',
              avg >= 70 ? 'text-green-600' : avg >= 40 ? 'text-amber-600' : 'text-red-600',
            )}
          >
            {avg}/100
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            —
          </span>
        )}
      </div>
      <div className="space-y-3">
        {group.skills.map(s => (
          <SkillBar key={s.key} skill={s} />
        ))}
      </div>
    </div>
  )
}

export function SkillDashboard() {
  const [data, setData] = useState<SkillsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi
      .getSkills()
      .then(raw => {
        if (!raw || typeof raw !== 'object' || !raw.skills) return
        const safe: SkillsResponse = {
          ...raw,
          overallScore:
            raw.overallScore === null || typeof raw.overallScore === 'number'
              ? raw.overallScore
              : null,
          readinessLevel: raw.readinessLevel ?? 'not-started',
          weakestSkill: {
            ...raw.weakestSkill,
            score: typeof raw.weakestSkill?.score === 'number' ? raw.weakestSkill.score : 0,
            assessed: raw.weakestSkill?.assessed,
          },
          strongestSkill: {
            ...raw.strongestSkill,
            score: typeof raw.strongestSkill?.score === 'number' ? raw.strongestSkill.score : 0,
            assessed: raw.strongestSkill?.assessed,
          },
          grouped: Object.fromEntries(
            Object.entries(raw.grouped ?? {}).map(([gk, g]) => [
              gk,
              {
                ...g,
                skills: (g.skills ?? []).map(s => ({
                  ...s,
                  score: typeof s.score === 'number' ? s.score : 0,
                  assessed: s.assessed === true,
                  recentReasons: s.recentReasons ?? [],
                })),
              },
            ]),
          ),
        }
        setData(safe)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-ink-muted">
        Could not load skills. Please try again.
      </div>
    )
  }

  const readiness = READINESS_CONFIG[data.readinessLevel] ?? READINESS_CONFIG['not-started']
  const hasScore = data.overallScore !== null
  const trackLabel = data.track?.label ?? 'Your track'

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full space-y-8 px-6 py-8 lg:px-8">
        <div>
          <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Plannr · {trackLabel}
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">My Skills</h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-muted">
            Only skills on your preparation track count toward readiness. Scores start at zero and
            rise when you practice, pass checks, master topics, or finish mocks.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-shrink-0 flex-col items-center gap-2">
            <ProgressRing percent={hasScore ? data.overallScore! : 0} size={120} stroke={10} />
            <p className="text-[12px] text-ink-muted">
              {hasScore ? 'Track readiness' : 'No evidence yet'}
            </p>
          </div>
          <div className={cn('flex-1 space-y-2 rounded-2xl border p-5', readiness.bg)}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
              Readiness
            </p>
            <p className={cn('font-serif text-2xl font-medium', readiness.color)}>
              {readiness.label}
            </p>
            <p className="text-[13px] text-ink-muted">{readiness.tip}</p>
            {data.howToImprove && (
              <p className="pt-1 text-[13px] font-medium text-ink">{data.howToImprove}</p>
            )}
            {hasScore && data.strongestSkill?.assessed && data.weakestSkill?.assessed && (
              <div className="flex gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-ink-faint">Strongest</p>
                  <p className="text-[13px] font-medium text-green-600">
                    {data.strongestSkill.label} ({data.strongestSkill.score})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint">Focus next</p>
                  <p className="text-[13px] font-medium text-red-500">
                    {data.weakestSkill.label} ({data.weakestSkill.score})
                  </p>
                </div>
              </div>
            )}
            {!hasScore && (
              <Link
                href="/dashboard/plannr"
                className="inline-flex pt-2 text-[13px] font-medium text-brand hover:underline"
              >
                Continue learning →
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {Object.entries(data.grouped).map(([k, g]) => (
            <SkillGroupCard key={k} group={g} />
          ))}
        </div>
      </div>
    </div>
  )
}

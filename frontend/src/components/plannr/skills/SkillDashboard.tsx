'use client'

import { useEffect, useState } from 'react'
import { journeyApi, type SkillsResponse } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { ProgressRing } from '@/components/plannr/shared/ProgressRing'
import { cn } from '@/lib/utils'

const READINESS_CONFIG = {
  'beginner':        { label: 'Beginner',        color: 'text-red-600',   bg: 'bg-red-50 border-red-200',   tip: 'Focus on completing Stage 1 & 2 topics first.' },
  'intermediate':    { label: 'Intermediate',    color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', tip: 'You\'re building momentum. Keep practicing daily.' },
  'advanced':        { label: 'Advanced',        color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',  tip: 'Almost there! Tackle harder experiences.' },
  'interview-ready': { label: 'Interview Ready', color: 'text-green-600', bg: 'bg-green-50 border-green-200', tip: '🎉 You\'re ready to ace LLD interviews!' },
}

function SkillBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="text-ink-muted">{label}</span>
        <span className={cn('font-medium', score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600')}>
          {score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-hairline overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function SkillGroupCard({ groupKey, group }: { groupKey: string; group: { label: string; skills: { key: string; label: string; score: number }[] } }) {
  const avg = Math.round(group.skills.reduce((s, x) => s + x.score, 0) / group.skills.length)
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[14px] text-ink">{group.label}</h3>
        <span className={cn(
          'font-mono text-[13px] font-bold',
          avg >= 70 ? 'text-green-600' : avg >= 40 ? 'text-amber-600' : 'text-red-600',
        )}>{avg}/100</span>
      </div>
      <div className="space-y-3">
        {group.skills.map(s => <SkillBar key={s.key} label={s.label} score={s.score} />)}
      </div>
    </div>
  )
}

export function SkillDashboard() {
  const [data, setData] = useState<SkillsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getSkills()
      .then(raw => {
        // Sanitise: ensure every skill score is a number (guard against Mongoose
        // sub-document objects leaking through before backend restart)
        if (!raw || typeof raw !== 'object') return
        const safe: SkillsResponse = {
          ...raw,
          overallScore: typeof raw.overallScore === 'number' ? raw.overallScore : 0,
          weakestSkill: {
            ...raw.weakestSkill,
            score: typeof raw.weakestSkill?.score === 'number' ? raw.weakestSkill.score : 0,
          },
          strongestSkill: {
            ...raw.strongestSkill,
            score: typeof raw.strongestSkill?.score === 'number' ? raw.strongestSkill.score : 0,
          },
          grouped: Object.fromEntries(
            Object.entries(raw.grouped ?? {}).map(([gk, g]) => [
              gk,
              {
                ...g,
                skills: (g.skills ?? []).map(s => ({
                  ...s,
                  score: typeof s.score === 'number' ? s.score : 0,
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
      <div className="flex min-h-[calc(100vh-56px)] bg-paper">
        <JourneySidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] bg-paper">
        <JourneySidebar />
        <main className="flex-1 flex items-center justify-center text-ink-muted">
          Could not load skills. Please try again.
        </main>
      </div>
    )
  }

  const readiness = READINESS_CONFIG[data.readinessLevel]

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
          {/* Header */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">My Skills</h1>
            <p className="mt-2 text-[14px] text-ink-muted">Track your progress across 15 LLD dimensions.</p>
          </div>

          {/* Overall score + readiness */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <ProgressRing percent={data.overallScore} size={120} stroke={10} />
              <p className="text-[12px] text-ink-muted">Overall Score</p>
            </div>
            <div className={cn('flex-1 rounded-2xl border p-5 space-y-2', readiness.bg)}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Readiness Level</p>
              <p className={cn('text-2xl font-serif font-medium', readiness.color)}>{readiness.label}</p>
              <p className="text-[13px] text-ink-muted">{readiness.tip}</p>
              <div className="flex gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-ink-faint">Strongest</p>
                  <p className="text-[13px] font-medium text-green-600">{data.strongestSkill.label} ({data.strongestSkill.score})</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint">Weakest</p>
                  <p className="text-[13px] font-medium text-red-500">{data.weakestSkill.label} ({data.weakestSkill.score})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill groups */}
          <div className="grid gap-5 sm:grid-cols-2">
            {Object.entries(data.grouped).map(([k, g]) => (
              <SkillGroupCard key={k} groupKey={k} group={g} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

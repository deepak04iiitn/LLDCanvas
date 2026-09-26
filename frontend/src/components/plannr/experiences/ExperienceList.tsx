'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Zap, Lock, ArrowRight, Users } from 'lucide-react'
import { journeyApi, type JourneyExperience, type JourneyProfile } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

function ReadinessBar({ label, weight }: { label: string; weight: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-ink-faint">
        <span className="capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span>{weight}%</span>
      </div>
      <div className="h-1 rounded-full bg-hairline overflow-hidden">
        <div
          className={cn('h-full rounded-full', weight >= 66 ? 'bg-green-500' : weight >= 33 ? 'bg-amber-500' : 'bg-red-400')}
          style={{ width: `${weight}%` }}
        />
      </div>
    </div>
  )
}

function ExperienceCard({ exp, locked }: { exp: JourneyExperience; locked: boolean }) {
  const readiness = exp.userReadiness ?? 0
  const top3 = exp.skillBars.slice(0, 3)

  const card = (
    <div className={cn(
      'group rounded-2xl border bg-paper p-5 flex flex-col gap-3 transition-all',
      locked
        ? 'opacity-60 cursor-not-allowed border-hairline'
        : 'hover:shadow-md hover:border-brand/20 cursor-pointer border-hairline',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-[15px] text-ink">{exp.title}</p>
          <p className="text-[11px] text-ink-faint mt-0.5">{exp.round} · {exp.durationMinutes}m</p>
        </div>
        {locked ? (
          <Lock size={16} className="text-ink-faint shrink-0" />
        ) : (
          <ArrowRight size={16} className="text-ink-faint shrink-0 group-hover:text-brand transition-colors" />
        )}
      </div>

      {/* Problem */}
      <p className="text-[13px] text-ink-muted line-clamp-2">{exp.problemDescription}</p>

      {/* Concepts */}
      <div className="flex flex-wrap gap-1.5">
        {exp.conceptsTested.slice(0, 4).map(c => (
          <span key={c} className="text-[10px] bg-paper-elevated border border-hairline rounded-full px-2 py-0.5 text-ink-muted">{c}</span>
        ))}
      </div>

      {/* Skill bars */}
      <div className="space-y-1.5">
        {top3.map(s => <ReadinessBar key={s.skill} label={s.skill} weight={s.weight} />)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock size={10} /> {exp.durationMinutes}m
        </div>
        {!locked && (
          <div className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
            readiness >= 70 ? 'bg-green-100 text-green-700' : readiness >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
          )}>
            {readiness >= 70 ? '✅ Ready' : readiness >= 40 ? '⚠️ Partial' : '🔒 Build skills first'}
          </div>
        )}
      </div>
    </div>
  )

  if (locked) return card
  return <Link href={`/plannr/experiences/${exp.slug}`}>{card}</Link>
}

export function ExperienceList() {
  const [experiences, setExperiences] = useState<JourneyExperience[]>([])
  const [profile, setProfile] = useState<JourneyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([journeyApi.listExperiences(), journeyApi.getProfile()])
      .then(([expsData, profileData]) => {
        setExperiences(expsData.experiences)
        setProfile(profileData.profile)
      })
      .finally(() => setLoading(false))
  }, [])

  const completedTopics = new Set(profile?.topicsCompleted ?? [])

  function isLocked(exp: JourneyExperience) {
    if (!profile) return true
    return exp.prerequisiteTopics.some(pt => !completedTopics.has(pt))
  }

  return (
    <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Interview Experiences</h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
              10 real-world LLD problems asked in actual interviews. Practice step-by-step with structured guidance.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map(exp => (
                <ExperienceCard key={exp.slug} exp={exp} locked={isLocked(exp)} />
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, Lock, ArrowRight } from 'lucide-react'
import { journeyApi, type JourneyExperience, type JourneyProfile } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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

function ExperienceCard({
  exp,
  locked,
  missingPrereqs,
  topicTitles,
}: {
  exp: JourneyExperience
  locked: boolean
  missingPrereqs: string[]
  topicTitles: Record<string, string>
}) {
  const readiness = exp.userReadiness ?? 0
  const top3 = exp.skillBars.slice(0, 3)

  const card = (
    <div className={cn(
      'group rounded-2xl border bg-paper p-5 flex flex-col gap-3 transition-all h-full',
      locked
        ? 'border-hairline bg-paper-elevated/40'
        : 'hover:shadow-md hover:border-brand/20 cursor-pointer border-hairline',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={cn('font-medium text-[15px]', locked ? 'text-ink-muted' : 'text-ink')}>
            {exp.title}
          </p>
          <p className="text-[11px] text-ink-faint mt-0.5">{exp.round} · {exp.durationMinutes}m</p>
        </div>
        {locked ? (
          <Lock size={16} className="text-ink-faint shrink-0" />
        ) : (
          <ArrowRight size={16} className="text-ink-faint shrink-0 group-hover:text-brand transition-colors" />
        )}
      </div>

      <p className="text-[13px] text-ink-muted line-clamp-2">{exp.problemDescription}</p>

      <div className="flex flex-wrap gap-1.5">
        {exp.conceptsTested.slice(0, 4).map(c => (
          <span key={c} className="text-[10px] bg-paper-elevated border border-hairline rounded-full px-2 py-0.5 text-ink-muted">{c}</span>
        ))}
      </div>

      <div className="space-y-1.5">
        {top3.map(s => <ReadinessBar key={s.skill} label={s.skill} weight={s.weight} />)}
      </div>

      {locked && (
        <div className="mt-auto rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 space-y-1.5">
          <p className="text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
            <Lock size={11} /> To unlock, complete these topics
          </p>
          {missingPrereqs.length === 0 ? (
            <p className="text-[12px] text-ink-muted">Finish your Plannr setup and start the roadmap.</p>
          ) : (
            <ul className="space-y-1">
              {missingPrereqs.map(slug => (
                <li key={slug}>
                  <Link
                    href={`/dashboard/plannr/topic/${slug}`}
                    className="text-[12px] text-brand font-medium hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    → {topicTitles[slug] ?? titleFromSlug(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!locked && (
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Clock size={10} /> {exp.durationMinutes}m
          </div>
          <div className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
            readiness >= 70 ? 'bg-green-100 text-green-700' : readiness >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
          )}>
            {readiness >= 70 ? 'Ready' : readiness >= 40 ? 'Partial' : 'Build skills first'}
          </div>
        </div>
      )}
    </div>
  )

  if (locked) return card
  return <Link href={`/dashboard/plannr/experiences/${exp.slug}`} className="block h-full">{card}</Link>
}

export function ExperienceList() {
  const [experiences, setExperiences] = useState<JourneyExperience[]>([])
  const [profile, setProfile] = useState<JourneyProfile | null>(null)
  const [topicTitles, setTopicTitles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      journeyApi.listExperiences(),
      journeyApi.getProfile(),
      journeyApi.getRoadmap().catch(() => null),
    ])
      .then(([expsData, profileData, roadmap]) => {
        setExperiences(expsData.experiences)
        setProfile(profileData.profile)
        const titles: Record<string, string> = {}
        for (const stage of roadmap?.stages ?? []) {
          for (const t of stage.topics) titles[t.slug] = t.title
        }
        setTopicTitles(titles)
      })
      .finally(() => setLoading(false))
  }, [])

  const completedTopics = useMemo(
    () => new Set(profile?.topicsCompleted ?? []),
    [profile],
  )

  function missingFor(exp: JourneyExperience) {
    return (exp.prerequisiteTopics ?? []).filter(pt => !completedTopics.has(pt))
  }

  function isLocked(exp: JourneyExperience) {
    if (!profile) return true
    return missingFor(exp).length > 0
  }

  const lockedCount = experiences.filter(isLocked).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full px-6 py-8 lg:px-8">
        <div className="mb-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
            Plannr
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Interview Mocks</h1>
          <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
            Full LLD problems from real interviews. Unlock them by completing prerequisite topics on your roadmap.
          </p>
        </div>

        {!loading && lockedCount > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-950">
            <span className="font-medium">{lockedCount} mock{lockedCount === 1 ? '' : 's'} locked.</span>
            {' '}Complete the listed roadmap topics on each card to unlock — start from{' '}
            <Link href="/dashboard/plannr/roadmap" className="font-semibold text-brand underline-offset-2 hover:underline">
              your roadmap
            </Link>
            .
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map(exp => {
              const missing = missingFor(exp)
              return (
                <ExperienceCard
                  key={exp.slug}
                  exp={exp}
                  locked={isLocked(exp)}
                  missingPrereqs={missing}
                  topicTitles={topicTitles}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

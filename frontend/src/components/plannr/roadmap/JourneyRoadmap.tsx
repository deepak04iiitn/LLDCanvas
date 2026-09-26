'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Lock, AlertTriangle, Star, ArrowRight, Clock } from 'lucide-react'
import { journeyApi, type StageData, type JourneyTopic, type TopicUserStatus } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { StageTag } from '@/components/plannr/shared/StageTag'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<TopicUserStatus, {
  icon: React.FC<{ size: number; className?: string }>
  label: string
  color: string
  border: string
  bg: string
}> = {
  completed:   { icon: CheckCircle2, label: 'Completed', color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50' },
  in_progress: { icon: Circle,       label: 'In Progress', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
  recommended: { icon: Star,         label: 'Recommended', color: 'text-brand',    border: 'border-brand/30', bg: 'bg-brand-tint/40' },
  locked:      { icon: Lock,         label: 'Not yet',    color: 'text-ink-faint', border: 'border-hairline', bg: 'bg-paper' },
}

const DIFF_COLORS = { easy: 'bg-green-400', medium: 'bg-amber-400', hard: 'bg-red-400' }

function TopicNode({ topic }: { topic: JourneyTopic }) {
  const status = (topic.userStatus ?? 'locked') as TopicUserStatus
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  const isClickable = status !== 'locked'

  const content = (
    <div className={cn(
      'rounded-xl border-2 p-4 transition-all flex flex-col gap-2',
      cfg.border, cfg.bg,
      isClickable ? 'cursor-pointer hover:shadow-sm hover:scale-[1.01]' : 'opacity-60 cursor-not-allowed',
      status === 'recommended' && 'ring-2 ring-brand/20',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{topic.icon}</span>
          <div>
            <p className={cn('text-[12px] font-semibold', cfg.color)}>{topic.title}</p>
            {topic.subtitle && <p className="text-[10px] text-ink-faint">{topic.subtitle}</p>}
          </div>
        </div>
        <Icon size={14} className={cn('shrink-0 mt-0.5', cfg.color)} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
          cfg.color, cfg.bg, `border ${cfg.border}`,
        )}>
          {cfg.label}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
          <Clock size={9} /> {topic.estimatedMinutes}m
        </span>
      </div>

      {/* Difficulty dots */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {Object.entries(topic.difficultyDimensions ?? {}).map(([k, v]) => (
          <div key={k} className="flex items-center gap-0.5" title={`${k}: ${v}`}>
            <div className={cn('h-1.5 w-1.5 rounded-full', DIFF_COLORS[v as keyof typeof DIFF_COLORS] ?? 'bg-gray-300')} />
            <span className="text-[9px] text-ink-faint capitalize">{k.replace('requirementAmbiguity', 'req')}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (!isClickable) return content
  return <Link href={`/plannr/topic/${topic.slug}`}>{content}</Link>
}

const STAGE_COLORS: Record<number, { header: string; accent: string }> = {
  1: { header: 'from-blue-50 to-transparent', accent: 'text-blue-700' },
  2: { header: 'from-violet-50 to-transparent', accent: 'text-violet-700' },
  3: { header: 'from-amber-50 to-transparent', accent: 'text-amber-700' },
  4: { header: 'from-green-50 to-transparent', accent: 'text-green-700' },
  5: { header: 'from-red-50 to-transparent', accent: 'text-red-700' },
}

function StageSection({ stage }: { stage: StageData }) {
  const colors = STAGE_COLORS[stage.stage] ?? { header: 'from-paper to-transparent', accent: 'text-ink' }
  const completedCount = stage.topics.filter(t => t.userStatus === 'completed').length

  return (
    <section className="mb-10">
      <div className={cn('rounded-2xl bg-gradient-to-b p-5 mb-4', colors.header)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <StageTag stage={stage.stage} className="mb-2" />
            <h2 className={cn('font-serif text-xl font-medium', colors.accent)}>{stage.label}</h2>
            <p className="text-[13px] text-ink-muted mt-1">{stage.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-lg font-bold text-ink">{completedCount}/{stage.topics.length}</p>
            <p className="text-[10px] text-ink-faint">completed</p>
          </div>
        </div>
        {/* Stage progress bar */}
        <div className="mt-4 h-1.5 rounded-full bg-hairline overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${stage.topics.length > 0 ? (completedCount / stage.topics.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stage.topics.map(t => <TopicNode key={t.slug} topic={t} />)}
      </div>
    </section>
  )
}

export function JourneyRoadmap() {
  const [stages, setStages] = useState<StageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getRoadmap()
      .then(d => setStages(d.stages))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Your Roadmap</h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
              Five stages from OOP fundamentals to interview readiness. Click any unlocked topic to start learning.
            </p>
          </div>

          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-4">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <v.icon size={12} className={v.color} />
                <span className="text-[11px] text-ink-muted">{v.label}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : stages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ink-muted">No topics yet.</p>
              <Link href="/plannr/setup" className="mt-4 inline-flex items-center gap-1 text-brand text-[13px]">
                Set up your journey <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            stages.map(s => <StageSection key={s.stage} stage={s} />)
          )}
        </div>
      </main>
    </div>
  )
}

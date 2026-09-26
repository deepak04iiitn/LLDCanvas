'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Lock, Star, ArrowRight, Clock, Play } from 'lucide-react'
import { journeyApi, type StageData, type JourneyTopic, type TopicUserStatus } from '@/lib/plannr-api'
import { StageTag } from '@/components/plannr/shared/StageTag'
import { cn } from '@/lib/utils'

type StageStatus = 'completed' | 'active' | 'locked'

function getStageStatus(stage: StageData): StageStatus {
  if (stage.topics.length === 0) return 'locked'
  const allCompleted = stage.topics.every(t => t.userStatus === 'completed')
  if (allCompleted) return 'completed'
  const hasProgress = stage.topics.some(
    t => t.userStatus === 'recommended' || t.userStatus === 'in_progress' || t.userStatus === 'completed',
  )
  return hasProgress ? 'active' : 'locked'
}

const STATUS_CONFIG: Record<TopicUserStatus, {
  icon: React.FC<{ size: number; className?: string }>
  label: string
  textColor: string
  border: string
  bg: string
  opacity: string
}> = {
  completed:   { icon: CheckCircle2, label: 'Completed',   textColor: 'text-brand',      border: 'border-brand/20',   bg: 'bg-brand-tint/40', opacity: '' },
  in_progress: { icon: Play,         label: 'In Progress', textColor: 'text-brand',      border: 'border-brand/30',   bg: 'bg-paper-elevated', opacity: '' },
  recommended: { icon: Star,         label: 'Recommended', textColor: 'text-brand',      border: 'border-brand',      bg: 'bg-paper',          opacity: '' },
  locked:      { icon: Lock,         label: 'Locked',      textColor: 'text-ink-faint',  border: 'border-hairline',   bg: 'bg-paper',          opacity: 'opacity-50' },
}

function TopicNode({ topic }: { topic: JourneyTopic }) {
  const status = (topic.userStatus ?? 'locked') as TopicUserStatus
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  const isClickable = status !== 'locked'

  const content = (
    <div className={cn(
      'rounded-xl border-2 p-4 transition-all flex flex-col gap-2',
      cfg.border, cfg.bg, cfg.opacity,
      status === 'recommended' && 'shadow-sm ring-2 ring-brand/10',
      isClickable && 'hover:shadow-sm hover:scale-[1.01]',
      !isClickable && 'cursor-not-allowed',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn('text-[13px] font-semibold truncate', isClickable ? 'text-ink' : 'text-ink-faint')}>
            {topic.title}
          </p>
          {topic.subtitle && (
            <p className="text-[11px] text-ink-faint truncate mt-0.5">{topic.subtitle}</p>
          )}
        </div>
        <Icon size={14} className={cn('shrink-0 mt-0.5', cfg.textColor)} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          'font-mono inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium border',
          cfg.textColor, cfg.border,
        )}>
          {cfg.label}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
          <Clock size={9} /> {topic.estimatedMinutes}m
        </span>
      </div>
    </div>
  )

  if (!isClickable) return content
  return <Link href={`/plannr/topic/${topic.slug}`}>{content}</Link>
}

function StageSection({ stage }: { stage: StageData }) {
  const completedCount = stage.topics.filter(t => t.userStatus === 'completed').length
  const stageStatus = getStageStatus(stage)

  const StageIcon = stageStatus === 'completed' ? CheckCircle2
    : stageStatus === 'active' ? Play
    : Lock

  return (
    <section className="mb-10">
      {/* Stage header */}
      <div className="flex items-start gap-3 pb-4 mb-5 border-b border-hairline">
        <div className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          stageStatus === 'completed' ? 'bg-brand-tint' : stageStatus === 'active' ? 'bg-brand' : 'bg-paper-elevated',
        )}>
          <StageIcon
            size={16}
            className={stageStatus === 'active' ? 'text-white' : stageStatus === 'completed' ? 'text-brand' : 'text-ink-faint'}
          />
        </div>
        <div className="flex-1">
          <StageTag stage={stage.stage} className="mb-1" />
          <h2 className="font-serif text-xl font-medium text-ink">{stage.label}</h2>
          {stage.description && (
            <p className="text-[13px] text-ink-muted mt-0.5">{stage.description}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-lg font-bold text-ink">{completedCount}/{stage.topics.length}</p>
          <p className="font-mono text-[10px] text-ink-faint">done</p>
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="mb-5 h-1.5 rounded-full bg-hairline overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${stage.topics.length > 0 ? (completedCount / stage.topics.length) * 100 : 0}%` }}
        />
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
    <div className="h-full overflow-y-auto">
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
          {(Object.entries(STATUS_CONFIG) as [TopicUserStatus, typeof STATUS_CONFIG[TopicUserStatus]][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <v.icon size={12} className={v.textColor} />
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
    </div>
  )
}

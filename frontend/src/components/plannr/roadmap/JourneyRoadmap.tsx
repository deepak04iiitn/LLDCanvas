'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Lock, Star, ArrowRight, Clock, Play } from 'lucide-react'
import { journeyApi, type StageData, type JourneyTopic, type TopicUserStatus } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

type StageStatus = 'completed' | 'active' | 'locked'

function getStageStatus(stage: StageData): StageStatus {
  if (stage.topics.length === 0) return 'locked'
  if (stage.topics.every(t => t.userStatus === 'completed')) return 'completed'
  if (stage.topics.some(t => ['recommended', 'in_progress', 'completed'].includes(t.userStatus ?? ''))) return 'active'
  return 'locked'
}

// ── Topic Card ────────────────────────────────────────────────────────────────
function TopicCard({ topic }: { topic: JourneyTopic }) {
  const status = (topic.userStatus ?? 'locked') as TopicUserStatus
  const isClickable = status !== 'locked'

  const statusMeta = {
    completed:   { label: 'Done',        dot: 'bg-brand',         ring: 'border-brand/20 bg-brand-tint/30' },
    in_progress: { label: 'In progress', dot: 'bg-amber-400',     ring: 'border-amber-200 bg-amber-50/50'  },
    recommended: { label: 'Up next',     dot: 'bg-brand animate-pulse', ring: 'border-brand bg-paper ring-2 ring-brand/10' },
    locked:      { label: 'Locked',      dot: 'bg-hairline-strong', ring: 'border-hairline bg-paper opacity-50' },
  }[status]

  const card = (
    <div className={cn(
      'rounded-xl border p-4 transition-all flex flex-col gap-3 h-full',
      statusMeta.ring,
      isClickable && 'hover:shadow-sm cursor-pointer',
      !isClickable && 'cursor-not-allowed',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[13px] font-semibold leading-snug',
            status === 'locked' ? 'text-ink-faint' : 'text-ink',
          )}>
            {topic.title}
          </p>
          {topic.subtitle && (
            <p className="text-[11px] text-ink-faint mt-0.5 line-clamp-1">{topic.subtitle}</p>
          )}
        </div>
        {status === 'locked'      && <Lock size={13} className="shrink-0 text-ink-faint mt-0.5" />}
        {status === 'completed'   && <CheckCircle2 size={13} className="shrink-0 text-brand mt-0.5" />}
        {status === 'recommended' && <Star size={13} className="shrink-0 text-brand mt-0.5" />}
        {status === 'in_progress' && <Play size={13} className="shrink-0 text-brand mt-0.5" />}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusMeta.dot)} />
        <span className="text-[10px] font-medium text-ink-faint">{statusMeta.label}</span>
        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-ink-faint">
          <Clock size={9} /> {topic.estimatedMinutes}m
        </span>
      </div>
    </div>
  )

  if (!isClickable) return card
  return <Link href={`/plannr/topic/${topic.slug}`} className="block h-full">{card}</Link>
}

// ── Stage Section ─────────────────────────────────────────────────────────────
function StageSection({ stage, index }: { stage: StageData; index: number }) {
  const status = getStageStatus(stage)
  const completedCount = stage.topics.filter(t => t.userStatus === 'completed').length
  const pct = stage.topics.length > 0 ? Math.round((completedCount / stage.topics.length) * 100) : 0

  return (
    <section>
      {/* Stage header */}
      <div className="flex items-start gap-5 mb-5">
        {/* Large stage number */}
        <div className="shrink-0 pt-1">
          <p className={cn(
            'font-serif text-[48px] font-medium leading-none select-none',
            status === 'locked' ? 'text-hairline-strong' : 'text-brand/15',
          )}>
            {String(index + 1).padStart(2, '0')}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">Stage {stage.stage}</p>
              <h2 className={cn(
                'font-serif text-[20px] font-medium leading-tight',
                status === 'locked' ? 'text-ink-faint' : 'text-ink',
              )}>
                {stage.label}
              </h2>
              {stage.description && (
                <p className="text-[13px] text-ink-muted mt-1 max-w-xl">{stage.description}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className={cn('font-mono text-[15px] font-bold', status === 'locked' ? 'text-ink-faint' : 'text-ink')}>
                {completedCount}<span className="text-ink-faint font-normal">/{stage.topics.length}</span>
              </p>
              <p className="text-[10px] text-ink-faint">topics</p>
            </div>
          </div>

          {/* Stage progress bar */}
          <div className="h-1 rounded-full bg-hairline overflow-hidden mt-3">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                status === 'locked' ? 'bg-hairline-strong' : 'bg-brand',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status indicator row */}
      {status === 'locked' && (
        <div className="ml-17 mb-4 flex items-center gap-2 text-[12px] text-ink-faint">
          <Lock size={12} />
          Complete the previous stage to unlock this one
        </div>
      )}

      {/* Topic grid */}
      <div className={cn(
        'ml-17 grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
        status === 'locked' && 'pointer-events-none',
      )}>
        {stage.topics.map(t => <TopicCard key={t.slug} topic={t} />)}
      </div>
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function JourneyRoadmap() {
  const [stages, setStages] = useState<StageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getRoadmap()
      .then(d => setStages(d.stages))
      .finally(() => setLoading(false))
  }, [])

  const totalTopics     = stages.reduce((s, st) => s + st.topics.length, 0)
  const completedTopics = stages.reduce((s, st) => s + st.topics.filter(t => t.userStatus === 'completed').length, 0)
  const overallPct      = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* Back nav */}
        <div className="mb-6">
          <Link href="/plannr" className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">Plannr</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-[30px] font-medium text-ink leading-tight tracking-tight">
                Your Roadmap
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">
                Five stages from OOP fundamentals to interview readiness.
              </p>
            </div>

            {!loading && totalTopics > 0 && (
              <div className="shrink-0 text-right">
                <p className="font-mono text-[28px] font-medium text-brand leading-none">{overallPct}%</p>
                <p className="text-[11px] text-ink-faint mt-0.5">{completedTopics}/{totalTopics} topics</p>
              </div>
            )}
          </div>

          {/* Overall progress bar */}
          {!loading && totalTopics > 0 && (
            <div className="mt-4 h-1.5 rounded-full bg-hairline overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        {!loading && totalTopics > 0 && (
          <div className="flex flex-wrap gap-5 mb-8 pb-6 border-b border-hairline">
            {[
              { dot: 'bg-brand', label: 'Completed' },
              { dot: 'bg-brand animate-pulse', label: 'Up next' },
              { dot: 'bg-amber-400', label: 'In progress' },
              { dot: 'bg-hairline-strong', label: 'Locked' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full shrink-0', dot)} />
                <span className="text-[12px] text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : stages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-muted mb-4">No topics yet.</p>
            <Link href="/plannr/setup" className="inline-flex items-center gap-1.5 text-brand text-[13px] font-semibold">
              Set up your journey <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-hairline space-y-0">
            {stages.map((s, i) => (
              <div key={s.stage} className="py-10 first:pt-0">
                <StageSection stage={s} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

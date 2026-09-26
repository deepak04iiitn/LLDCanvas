'use client'

import { useEffect, useState } from 'react'
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react'
import { journeyApi, type DayPlanEntry } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const STATUS_CONFIG = {
  done:     { color: 'border-green-200 bg-green-50',   badge: 'bg-green-100 text-green-700',   label: 'Done' },
  today:    { color: 'border-brand/30 bg-brand-tint/20 ring-2 ring-brand/20', badge: 'bg-brand text-white', label: 'Today' },
  upcoming: { color: 'border-hairline bg-paper',       badge: 'bg-paper-elevated text-ink-faint', label: 'Upcoming' },
}

function DayCard({ entry }: { entry: DayPlanEntry }) {
  const cfg = STATUS_CONFIG[entry.status]

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', cfg.color)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.badge)}>{cfg.label}</span>
            <span className="text-[11px] text-ink-faint">{entry.date}</span>
          </div>
          <p className="font-medium text-[14px] text-ink mt-1">Day {entry.day} · {entry.focus}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Clock size={10} /> {entry.totalMinutes}m
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {entry.topics.map(t => (
          entry.status === 'upcoming' ? (
            <Link href={`/plannr/topic/${t.slug}`} key={t.slug}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-hairline hover:border-brand/30 hover:bg-paper-elevated transition-colors">
                <span className="text-sm">{t.icon}</span>
                <span className="text-[13px] text-ink flex-1">{t.title}</span>
                <span className="text-[10px] text-ink-faint">{t.estimatedMinutes}m</span>
              </div>
            </Link>
          ) : (
            <div key={t.slug} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-paper/70">
              {entry.status === 'done' ? (
                <CheckCircle2 size={12} className="text-green-600 shrink-0" />
              ) : (
                <BookOpen size={12} className="text-brand shrink-0" />
              )}
              <span className="text-[13px] text-ink flex-1">{t.icon} {t.title}</span>
              <span className="text-[10px] text-ink-faint">{t.estimatedMinutes}m</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export function DayPlan() {
  const [plan, setPlan] = useState<DayPlanEntry[]>([])
  const [meta, setMeta] = useState<{ preparationDays: number; startDate: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getPlan()
      .then(d => {
        setPlan(d.plan)
        setMeta({ preparationDays: d.preparationDays, startDate: d.startDate })
      })
      .finally(() => setLoading(false))
  }, [])

  const doneCount = plan.filter(d => d.status === 'done').length
  const total = plan.length
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
          {/* Header */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">My Plan</h1>
            {meta && (
              <p className="mt-2 text-[14px] text-ink-muted">
                {meta.preparationDays}-day plan · Started {new Date(meta.startDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Progress summary */}
          {!loading && plan.length > 0 && (
            <div className="rounded-2xl bg-paper-elevated border border-hairline p-5 space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-muted">Overall Progress</span>
                <span className="font-medium text-ink">{doneCount}/{total} days</span>
              </div>
              <div className="h-2 rounded-full bg-hairline overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-faint">{progress}% complete</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : plan.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">No plan yet. Complete onboarding to generate your plan.</div>
          ) : (
            <div className="space-y-4">
              {plan.map(entry => <DayCard key={entry.day} entry={entry} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

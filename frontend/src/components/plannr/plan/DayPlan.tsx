'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, CheckCircle2, ArrowRight, Play,
  ChevronDown, Check, Trash2, Loader2, Plus,
} from 'lucide-react'
import { journeyApi, type DayPlanEntry, type PlannrSummary } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer', general: 'General LLD',
}

// -- Plan Switcher -------------------------------------------------------------
function PlanSwitcherButton({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter()
  const [plans, setPlans]       = useState<PlannrSummary[]>([])
  const [open, setOpen]         = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [deleting, setDeleting]  = useState<string | null>(null)

  function load() { journeyApi.listPlans().then(d => setPlans(d.plans)).catch(() => {}) }
  useEffect(() => { load() }, [])
  const activePlan = plans.find(p => p.isActive)

  async function handleSwitch(id: string) {
    if (switching) return; setSwitching(id)
    try { await journeyApi.switchPlan(id); await load(); onSwitch(); setOpen(false) }
    finally { setSwitching(null) }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deleting || plans.length <= 1) return
    if (!confirm('Delete this Plannr? This cannot be undone.')) return
    setDeleting(id)
    try { await journeyApi.deletePlan(id); await load(); onSwitch() }
    finally { setDeleting(null) }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30 transition-colors"
      >
        <span className="max-w-32 truncate">{activePlan?.planName ?? 'My Plan'}</span>
        <ChevronDown size={12} className={cn('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-60 bg-paper rounded-xl border border-hairline shadow-lg overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              {plans.map(p => (
                <div key={p._id} onClick={() => !p.isActive && handleSwitch(p._id)}
                  className={cn('flex items-center gap-2 px-3 py-2.5 transition-colors group cursor-pointer',
                    p.isActive ? 'bg-brand-tint/30 cursor-default' : 'hover:bg-paper-elevated')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-ink truncate">{p.planName}</p>
                    <p className="text-[10px] text-ink-faint">{ROLE_LABELS[p.targetRole]} · {p.progressPercent}% done</p>
                  </div>
                  {p.isActive
                    ? <Check size={12} className="text-brand shrink-0" />
                    : switching === p._id
                      ? <Loader2 size={12} className="animate-spin text-ink-faint shrink-0" />
                      : <button onClick={e => handleDelete(p._id, e)} disabled={plans.length <= 1}
                          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 disabled:hidden transition-opacity">
                          {deleting === p._id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                        </button>
                  }
                </div>
              ))}
            </div>
            <div className="border-t border-hairline">
              <button
                onClick={() => { setOpen(false); router.push('/dashboard/plannr/setup') }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-brand font-medium hover:bg-brand-tint/20 transition-colors"
              >
                <Plus size={12} /> New Plannr
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// -- Main Component ------------------------------------------------------------
export function DayPlan() {
  const router = useRouter()
  const [plan, setPlan]   = useState<DayPlanEntry[]>([])
  const [meta, setMeta]   = useState<{ preparationDays: number; startDate: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    journeyApi.getPlan()
      .then(d => {
        setPlan(d.plan)
        setMeta({ preparationDays: d.preparationDays, startDate: d.startDate })
        // Auto-expand today
        const today = d.plan.find(e => e.status === 'today')
        if (today) setExpanded(today.day)
      })
      .finally(() => setLoading(false))
  }, [])

  const doneCount = plan.filter(d => d.status === 'done').length
  const total     = plan.length
  const progress  = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const daysLeft  = total - doneCount
  const todayEntry = plan.find(e => e.status === 'today')

  // Group by week (7 days each)
  const weekGroups = useMemo<DayPlanEntry[][]>(() => {
    const groups: DayPlanEntry[][] = []
    plan.forEach(entry => {
      const wi = Math.floor((entry.day - 1) / 7)
      if (!groups[wi]) groups[wi] = []
      groups[wi].push(entry)
    })
    return groups
  }, [plan])

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* -- Header -- */}
        <div className="mb-6">
          <Link href="/dashboard/plannr" className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors mb-5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">My Plan</p>
            <h1 className="font-serif text-[30px] font-medium text-ink leading-tight tracking-tight">
              {meta ? `${meta.preparationDays}-Day Roadmap` : 'Your Plan'}
            </h1>
            {meta && (
              <p className="text-[13px] text-ink-muted mt-1">
                Started {new Date(meta.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <PlanSwitcherButton onSwitch={() => router.refresh()} />
        </div>

        {/* -- Progress strip -- */}
        {!loading && total > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-8">
                {[
                  { value: doneCount, label: 'Days done' },
                  { value: daysLeft,  label: 'Days left' },
                  { value: `${progress}%`, label: 'Complete', accent: true },
                ].map(({ value, label, accent }) => (
                  <div key={label}>
                    <p className={cn('font-mono text-[26px] font-medium leading-none', accent ? 'text-brand' : 'text-ink')}>
                      {value}
                    </p>
                    <p className="text-[11px] text-ink-faint mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {todayEntry && todayEntry.topics.length > 0 && (
                <Link
                  href={`/plannr/topic/${todayEntry.topics[0].slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover transition-colors"
                >
                  <Play size={13} /> Start Today
                </Link>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-[10px] text-ink-faint">Day 1</span>
              <span className="font-mono text-[10px] text-ink-faint">Day {total}</span>
            </div>
          </div>
        )}

        {/* -- Loading / Empty / Content -- */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-muted mb-4">No plan yet. Complete onboarding to generate your plan.</p>
            <Link href="/dashboard/plannr/setup" className="inline-flex items-center gap-1.5 text-brand text-[13px] font-semibold">
              Set up your journey <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {weekGroups.map((week, wi) => {
              const weekDone     = week.filter(e => e.status === 'done').length
              const hasToday     = week.some(e => e.status === 'today')
              const allDone      = weekDone === week.length
              const weekTotalMin = week.reduce((s, e) => s + e.totalMinutes, 0)

              return (
                <div key={wi}>
                  {/* Week header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={cn(
                      'font-mono text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border',
                      hasToday ? 'border-brand/30 bg-brand-tint text-brand' :
                      allDone  ? 'border-hairline text-ink-faint bg-paper-elevated' :
                                 'border-hairline text-ink-faint',
                    )}>
                      Week {wi + 1}
                    </span>
                    {allDone && (
                      <span className="flex items-center gap-1 text-[11px] text-brand">
                        <CheckCircle2 size={11} /> Complete
                      </span>
                    )}
                    {hasToday && <span className="text-[11px] font-medium text-brand">Current week</span>}
                    <div className="flex-1 h-px bg-hairline" />
                    <span className="font-mono text-[10px] text-ink-faint">
                      {weekDone}/{week.length} · {weekTotalMin}m total
                    </span>
                  </div>

                  {/* Day rows */}
                  <div className="space-y-1.5">
                    {week.map(entry => {
                      const isExpanded = expanded === entry.day
                      const isToday    = entry.status === 'today'
                      const isDone     = entry.status === 'done'

                      return (
                        <div key={entry.day} className="rounded-xl overflow-hidden border border-hairline">
                          {/* Day toggle row */}
                          <button
                            onClick={() => setExpanded(isExpanded ? null : entry.day)}
                            className={cn(
                              'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
                              isToday ? 'bg-brand-tint/40' :
                              isDone  ? 'bg-paper' :
                                        'bg-paper hover:bg-paper-elevated',
                            )}
                          >
                            {/* Day circle */}
                            <div className={cn(
                              'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                              isDone  ? 'bg-brand text-white' :
                              isToday ? 'bg-brand text-white' :
                                        'bg-hairline text-ink-faint',
                            )}>
                              {isDone
                                ? <Check size={12} strokeWidth={3} />
                                : <span className="text-[10px] font-bold">{entry.day}</span>
                              }
                            </div>

                            {/* Day label */}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className={cn(
                                'text-[13px] font-medium',
                                isDone ? 'text-ink-faint' : 'text-ink',
                              )}>
                                Day {entry.day}
                              </span>
                              <span className={cn(
                                'text-[13px]',
                                isDone ? 'text-ink-faint' : 'text-ink-muted',
                              )}>
                                · {entry.focus}
                              </span>
                              {isToday && (
                                <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">
                                  Today
                                </span>
                              )}
                            </div>

                            {/* Time + chevron */}
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="flex items-center gap-1 font-mono text-[10px] text-ink-faint">
                                <Clock size={9} /> {entry.totalMinutes}m
                              </span>
                              <ChevronDown size={13} className={cn(
                                'text-ink-faint transition-transform duration-200',
                                isExpanded && 'rotate-180',
                              )} />
                            </div>
                          </button>

                          {/* Expanded topics */}
                          {isExpanded && (
                            <div className={cn(
                              'border-t border-hairline divide-y divide-hairline',
                              isToday ? 'bg-brand-tint/20' : 'bg-paper-elevated',
                            )}>
                              {entry.topics.map(t => (
                                <Link
                                  key={t.slug}
                                  href={`/plannr/topic/${t.slug}`}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-paper-elevated transition-colors group"
                                >
                                  <span className="text-base shrink-0 w-6 text-center">{t.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-ink">{t.title}</p>
                                    <p className="text-[10px] text-ink-faint capitalize mt-0.5">{t.type}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono text-[10px] text-ink-faint">{t.estimatedMinutes}m</span>
                                    {isDone
                                      ? <CheckCircle2 size={13} className="text-brand" />
                                      : <ArrowRight size={12} className="text-ink-faint group-hover:text-brand transition-colors" />
                                    }
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

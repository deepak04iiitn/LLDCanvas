'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, BookOpen, Target, BarChart2, Flame, Clock, Play, CheckCircle2,
  ChevronDown, Plus, Check, Trash2, Loader2, Trophy, Layers,
} from 'lucide-react'
import { journeyApi, type JourneyProfile, type JourneyRecommendation, type JourneyActivity, type PlannrSummary, type DayPlanEntry } from '@/lib/plannr-api'
import { SpacedRepetitionWidget } from '@/components/plannr/hub/SpacedRepetitionWidget'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer', general: 'General LLD',
}



// ─── Plan Switcher Button (inline, for page headers) ──────────────────────────
function PlanSwitcherButton({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter()
  const [plans, setPlans] = useState<PlannrSummary[]>([])
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function load() { journeyApi.listPlans().then(d => setPlans(d.plans)).catch(() => {}) }
  useEffect(() => { load() }, [])

  const activePlan = plans.find(p => p.isActive)

  async function handleSwitch(id: string) {
    if (switching) return
    setSwitching(id)
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
    <>
      <div className="relative">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30 transition-colors">
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
                    className={cn('flex items-center gap-2 px-3 py-2.5 transition-colors group', p.isActive ? 'bg-brand-tint/30 cursor-default' : 'hover:bg-paper-elevated cursor-pointer')}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink truncate">{p.planName}</p>
                      <p className="text-[10px] text-ink-faint">{ROLE_LABELS[p.targetRole]} · {p.progressPercent}% done</p>
                    </div>
                    {p.isActive ? <Check size={12} className="text-brand shrink-0" />
                      : switching === p._id ? <Loader2 size={12} className="animate-spin text-ink-faint shrink-0" />
                      : <button onClick={e => handleDelete(p._id, e)} disabled={plans.length <= 1}
                          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 disabled:hidden transition-opacity">
                          {deleting === p._id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                        </button>}
                  </div>
                ))}
              </div>
              <div className="border-t border-hairline">
                <button onClick={() => { setOpen(false); router.push('/dashboard/plannr/setup') }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-brand font-medium hover:bg-brand-tint/20 transition-colors">
                  <Plus size={12} /> New Plannr
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </>
  )
}


function RecommendationCard({ rec }: { rec: JourneyRecommendation }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
        Next Topic
      </p>
      <h3 className="font-serif text-base font-medium text-ink">{rec.topicTitle}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted line-clamp-2">{rec.reason}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock size={11} />
          ~{rec.estimatedMinutes} min
        </span>
        <Link
          href={`/plannr/topic/${rec.topicSlug}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Start Topic <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ─── Plannr Intro / Landing Page ─────────────────────────────────────────────
function PlannrIntroPage() {
  const skillGrid = [
    { label: 'SOLID Principles', lit: true },
    { label: 'OOP Fundamentals', lit: true },
    { label: 'Design Patterns', lit: true },
    { label: 'API Design', lit: true },
    { label: 'UML Notation', lit: false },
    { label: 'Class Diagrams', lit: false },
    { label: 'Concurrency', lit: true },
    { label: 'Trade-off Analysis', lit: true },
    { label: 'Error Handling', lit: false },
    { label: 'Caching Strategies', lit: false },
    { label: 'DB Modelling', lit: false },
    { label: 'Interview Delivery', lit: true },
    { label: 'Code Walkthrough', lit: false },
    { label: 'Requirements Parsing', lit: true },
    { label: 'Scalability Thinking', lit: false },
  ]

  const phases = [
    {
      week: 'Week 1',
      theme: 'Foundations',
      desc: 'You\'ll relearn OOP the way senior engineers think about it — not how university textbooks teach it. By day 5, SOLID principles feel obvious, not abstract.',
      topics: ['OOP Fundamentals', 'SOLID Principles', 'UML Basics', 'Class Diagram Thinking'],
    },
    {
      week: 'Week 2',
      theme: 'Patterns',
      desc: 'Design patterns aren\'t tricks to memorise. You\'ll understand why each one exists, what problem it solves, and — critically — when not to use it.',
      topics: ['Factory & Builder', 'Observer & Strategy', 'Decorator & Facade', 'Pattern Selection'],
    },
    {
      week: 'Week 3',
      theme: 'Applied',
      desc: 'Real problems from real interviews: design a Library system, a Parking Lot, a Notification engine. You\'ll design, get guided feedback, and understand the tradeoffs.',
      topics: ['Library System', 'Vending Machine', 'Parking Lot', 'Notification System'],
    },
    {
      week: 'Week 4',
      theme: 'Interview-Ready',
      desc: 'Spaced repetition brings everything back sharp. You\'ll practise delivery, handle edge cases under time pressure, and walk in knowing your stuff cold.',
      topics: ['Review & Gap Analysis', 'Edge Case Thinking', 'Timed Walkthroughs', 'Interview Delivery'],
    },
  ]

  return (
    <div className="bg-paper">

      {/* ════════════════════════════════════════════════════════════════════
          HERO — full viewport, left-editorial, real app-window on right
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col border-b border-hairline overflow-hidden">

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.38]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex-1 flex flex-col max-w-6xl mx-auto w-full px-8">

          {/* Main two-column row */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-12 py-16">

            {/* ── LEFT ── */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint mb-12">
                lld · interview preparation
              </p>

              <h1 className="font-serif font-medium tracking-tight leading-[0.88] mb-8">
                <span className="block text-[40px] sm:text-[50px] lg:text-[58px] text-ink whitespace-nowrap">Crack the design</span>
                <span className="block text-[40px] sm:text-[50px] lg:text-[58px] text-brand whitespace-nowrap">round.</span>
              </h1>

              {/* Brand rule */}
              <div className="w-10 h-0.5 bg-brand mb-7" />

              <p className="text-[15px] leading-[1.75] text-ink-muted mb-10 max-w-75">
                A day-by-day system that takes you from scattered knowledge to confident LLD performance. No winging it.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <Link
                  href="/dashboard/plannr/setup"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:bg-brand-hover transition-colors"
                >
                  Build your plan <ArrowRight size={14} />
                </Link>
                <span className="text-[12px] text-ink-faint">Free · 2 min</span>
              </div>

              {/* Role row */}
              <div className="flex items-center gap-x-3 gap-y-1.5 pt-6 border-t border-hairline flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">works for</span>
                {['SDE-1', 'SDE-2', 'Backend', 'Full Stack'].map((r, i) => (
                  <span key={r} className="flex items-center gap-3">
                    {i > 0 && <span className="text-hairline-strong select-none">·</span>}
                    <span className="text-[12px] font-medium text-ink-muted">{r}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: real app-window mockup ── */}
            <div className="lg:w-110 shrink-0">
              <div className="rounded-2xl border border-hairline-strong bg-paper-elevated shadow-[0_12px_56px_rgba(0,0,0,0.1)] overflow-hidden">

                {/* macOS-style title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-paper">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-4 font-mono text-[10px] text-ink-faint">plannr — day 8 of 60</span>
                  <span className="ml-auto rounded-md bg-brand-tint px-2 py-0.5 text-[10px] font-semibold text-brand">SDE-2</span>
                </div>

                {/* Two-panel layout */}
                <div className="flex">

                  {/* Sidebar: topic tree */}
                  <div className="w-40 border-r border-hairline p-3 bg-paper/60 shrink-0 hidden sm:block">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-ink-faint mb-2.5 px-1">Week 2</p>
                    <div className="space-y-0.5">
                      {[
                        { label: 'SOLID Principles', state: 'done' },
                        { label: 'Design Patterns', state: 'active' },
                        { label: 'OOP Deep Dive', state: 'upcoming' },
                        { label: 'API Design', state: 'upcoming' },
                        { label: 'Practice Round', state: 'upcoming' },
                      ].map(item => (
                        <div
                          key={item.label}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] truncate',
                            item.state === 'active' && 'bg-brand/8 text-brand font-semibold',
                            item.state === 'done' && 'text-ink-faint',
                            item.state === 'upcoming' && 'text-ink-muted',
                          )}
                        >
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            item.state === 'done' ? 'bg-brand' : item.state === 'active' ? 'bg-brand' : 'bg-hairline-strong',
                          )} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main panel */}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="mb-4">
                      <p className="font-mono text-[8px] uppercase tracking-widest text-ink-faint mb-1">Today&apos;s topic</p>
                      <h3 className="font-serif text-[18px] font-medium text-ink">Design Patterns</h3>
                      <p className="text-[11px] text-ink-muted mt-0.5">Factory · Singleton · Observer · Strategy</p>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {[
                        { label: 'What are design patterns?', done: true, time: '8m' },
                        { label: 'Factory Pattern — concept + code', done: true, time: '12m' },
                        { label: 'Singleton Pattern', done: false, active: true, time: '10m' },
                        { label: 'Practice: Vending Machine', done: false, active: false, time: '25m' },
                      ].map(item => (
                        <div
                          key={item.label}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border px-3 py-2',
                            item.active ? 'border-brand/25 bg-brand/4' : 'border-hairline',
                          )}
                        >
                          <div className={cn(
                            'h-3.5 w-3.5 rounded-full border-[1.5px] shrink-0',
                            item.done ? 'bg-brand border-brand' : item.active ? 'border-brand' : 'border-hairline-strong',
                          )} />
                          <span className={cn(
                            'flex-1 text-[11px] truncate',
                            item.done ? 'line-through text-ink-faint' : item.active ? 'font-medium text-ink' : 'text-ink',
                          )}>
                            {item.label}
                          </span>
                          <span className="font-mono text-[9px] text-ink-faint shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-hairline pt-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] text-ink-faint">Day progress</span>
                        <span className="font-mono text-[10px] font-semibold text-brand">50%</span>
                      </div>
                      <div className="h-1 rounded-full bg-hairline overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-brand" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <p className="mt-3 text-[11px] text-ink-faint text-center">Your actual daily view, inside Plannr</p>
            </div>

          </div>

          {/* Bottom anchor strip */}
          <div className="border-t border-hairline py-4 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mr-3">Covers</span>
            {['Design Patterns', 'SOLID', 'OOP', 'API Design', 'Concurrency', 'Trade-offs', 'UML', 'Interview Delivery', '+7 more'].map((tag, i) => (
              <span key={tag} className="flex items-center gap-1.5 shrink-0">
                {i > 0 && <span className="text-hairline-strong select-none">·</span>}
                <span className="text-[12px] text-ink-muted">{tag}</span>
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATEMENT STRIP — one sharp editorial sentence
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-6">
            <p className="font-serif text-[28px] sm:text-[36px] leading-[1.15] text-ink flex-1 max-w-2xl">
              Most LLD prep is just reading.{' '}
              <span className="text-ink-muted">
                Reading doesn&apos;t prepare you for{' '}
                <em className="not-italic text-brand">designing</em>.
              </span>
            </p>
            <Link
              href="/dashboard/plannr/setup"
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Fix that now <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          THE PROGRAM — week-by-week, specific, not generic features
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-8 py-20">

          {/* Section header row */}
          <div className="flex flex-col lg:flex-row gap-12 mb-14">
            <div className="lg:w-44 shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                7 – 60 day<br />programs
              </p>
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[38px] sm:text-[46px] font-medium text-ink leading-[0.92] tracking-tight">
                A plan built around<br />how learning works.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.7] text-ink-muted max-w-sm">
                Pick 7, 14, 30 or 60 days — Plannr scales the curriculum to your runway. Not a list of topics to Google. A structured week-by-week progression with concrete outputs at every stage.
              </p>
            </div>
          </div>

          {/* Phase rows */}
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-44 shrink-0" aria-hidden />
            <div className="flex-1 divide-y divide-hairline">
              {phases.map(({ week, theme, desc, topics }) => (
                <div key={week} className="flex gap-10 py-10">
                  {/* Week label + theme */}
                  <div className="shrink-0 w-24">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">{week}</p>
                    <p className="font-serif text-[17px] font-medium text-ink leading-tight">{theme}</p>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] leading-[1.7] text-ink-muted mb-4">{desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map(t => (
                        <span key={t} className="rounded-md border border-hairline bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SKILLS GRID — heat-map style, not a progress bar chart
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12">

            <div className="lg:w-44 shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                15 skills<br />tracked
              </p>
            </div>

            <div className="flex-1">
              <p className="text-[14px] text-ink-muted mb-8 max-w-sm leading-relaxed">
                Plannr tracks your depth across every dimension of LLD — not just whether you&apos;ve seen it, but how well you can apply it under interview pressure.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
                {skillGrid.map(({ label, lit }) => (
                  <div
                    key={label}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-center',
                      lit ? 'border-brand/20 bg-brand-tint' : 'border-hairline bg-paper',
                    )}
                  >
                    <p className={cn('text-[11px] font-medium leading-tight', lit ? 'text-brand' : 'text-ink-faint')}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-ink-faint">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-tint border border-brand/20" />
                  Actively coached in your plan
                </span>
                <span className="text-hairline-strong">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-paper border border-hairline" />
                  Covered &amp; assessed
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA — typographic split, confident and minimal
      ════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="max-w-6xl mx-auto px-8 py-28">
          <div className="flex flex-col lg:flex-row lg:items-end gap-10">
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-6">Start today</p>
              <h2 className="font-serif text-[60px] sm:text-[80px] font-medium text-ink leading-[0.85] tracking-tight">
                Ready when<br />you are.
              </h2>
            </div>
            <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 lg:pb-2">
              <Link
                href="/dashboard/plannr/setup"
                className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-brand-hover transition-colors"
              >
                Create Your Plan <ArrowRight size={15} />
              </Link>
              <p className="text-[11px] text-ink-faint">Free · No account needed to explore</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

// ─── Journey Dashboard ────────────────────────────────────────────────────────
function computeStreak(activities: JourneyActivity[]): number {
  if (!activities.length) return 0
  const dates = new Set(activities.map(a => a.completedAt.split('T')[0]))
  let streak = 0
  const now = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (dates.has(key)) { streak++ } else if (i > 0) { break }
  }
  return streak
}

export function JourneyDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    profile: JourneyProfile | null
    recommendation: JourneyRecommendation | null
    recentActivity: JourneyActivity[]
    completedCount: number
    totalTopics: number
    progressPercent: number
    onboarded: boolean
  } | null>(null)
  const [todayPlan, setTodayPlan] = useState<DayPlanEntry | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    Promise.all([
      journeyApi.getDashboard(),
      journeyApi.getPlan().catch(() => null),
    ])
      .then(([dashboard, plan]) => {
        setData(dashboard)
        if (plan) {
          setTodayPlan(plan.plan.find(d => d.status === 'today') ?? null)
        }
        const s = computeStreak(dashboard.recentActivity ?? [])
        setStreak(s)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!data || !data.onboarded || !data.profile) {
    return <PlannrIntroPage />
  }

  const { profile, recommendation, completedCount, totalTopics, progressPercent } = data
  const daysPassed = Math.floor(
    (Date.now() - new Date(profile.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )
  const daysLeft = Math.max(0, profile.preparationDays - daysPassed)
  const currentDay = daysPassed + 1

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">Plannr</p>
            <h1 className="font-serif text-[28px] font-medium text-ink leading-tight">Your Preparation Plan</h1>
            <p className="font-mono text-[12px] text-ink-muted mt-1">
              Day {currentDay} &middot; {ROLE_LABELS[profile.targetRole] ?? profile.targetRole} &middot; {daysLeft > 0 ? `${daysLeft} days left` : 'Journey complete'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/plannr/plan" className="rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30 transition-colors">
              Full Plan
            </Link>
            <Link href="/dashboard/plannr/roadmap" className="rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30 transition-colors">
              Roadmap
            </Link>
            <PlanSwitcherButton onSwitch={() => router.refresh()} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT column — main content */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* TODAY'S PLAN */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-4">
                Today
              </p>
              {todayPlan && todayPlan.topics.length > 0 ? (
                <>
                  <div className="space-y-3 mb-5">
                    {todayPlan.topics.map((act, i) => (
                      <div key={act.slug} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[11px] font-bold">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-[13px] text-ink">{act.title}</span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                          <Clock size={10} /> {act.estimatedMinutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-hairline mb-4">
                    <span className="text-[12px] text-ink-muted">Total today</span>
                    <span className="font-mono text-[13px] font-semibold text-ink">
                      {todayPlan.totalMinutes} min
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-ink-muted mb-5">
                  {todayPlan === null ? 'Loading your plan…' : 'No topics scheduled for today.'}
                </p>
              )}
              <Link
                href="/dashboard/plannr/roadmap"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Play size={14} /> Start Today&apos;s Plan
              </Link>
            </div>

            {/* NEXT TOPIC */}
            {recommendation ? (
              <RecommendationCard rec={recommendation} />
            ) : (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-5 text-center">
                <CheckCircle2 size={20} className="text-brand mx-auto mb-2" />
                <p className="font-medium text-[14px] text-ink">All topics completed — interview ready!</p>
                <Link href="/dashboard/plannr/experiences" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
                  Try interview experiences <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT column — 320 px */}
          <div className="lg:w-80 lg:shrink-0 space-y-4">
            {/* Progress */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">
                Progress
              </p>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] text-ink">{completedCount}/{totalTopics} topics completed</span>
                <span className="font-mono text-[13px] font-bold text-ink">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-hairline overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Due for Review */}
            <SpacedRepetitionWidget />

            {/* Streak */}
            {streak > 0 && (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">
                  Streak
                </p>
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-brand" />
                  <span className="font-serif text-xl font-medium text-ink">{streak}-day streak</span>
                </div>
                <p className="text-[11px] text-ink-faint mt-1">Keep it going!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

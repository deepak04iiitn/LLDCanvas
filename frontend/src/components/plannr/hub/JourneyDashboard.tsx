'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Target, BarChart2, Flame, Clock, Play, CheckCircle2,
  Map, ClipboardList, Briefcase, Lightbulb, CalendarDays, TrendingUp,
} from 'lucide-react'
import {
  journeyApi,
  type JourneyProfile,
  type JourneyRecommendation,
  type JourneyActivity,
  type DayPlanEntry,
  type SkillsResponse,
} from '@/lib/plannr-api'
import { SpacedRepetitionWidget } from '@/components/plannr/hub/SpacedRepetitionWidget'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer', general: 'General LLD',
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Speak OOP',
  2: 'Responsibilities',
  3: 'Design for Change',
  4: 'Interview Thinking',
  5: 'Pressure Test',
}

const QUICK_LINKS = [
  { href: '/dashboard/plannr/roadmap',     icon: Map,           label: 'Roadmap',   blurb: 'Stage path & mastery' },
  { href: '/dashboard/plannr/practice',    icon: Target,        label: 'Practice',  blurb: 'Easy → Hard drills' },
  { href: '/dashboard/plannr/revise',      icon: ClipboardList, label: 'Revise',    blurb: 'Sheets & spaced review' },
  { href: '/dashboard/plannr/experiences', icon: Briefcase,     label: 'Mocks',     blurb: 'Full interview problems' },
  { href: '/dashboard/plannr/skills',      icon: BarChart2,     label: 'Skills',    blurb: 'Evidence on your track' },
  { href: '/dashboard/plannr/tips',        icon: Lightbulb,     label: 'Tips',      blurb: 'Interview playbook' },
]

function ProgressRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold text-ink">
        {percent}%
      </span>
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
                Track skills<br />from evidence
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
  const [skills, setSkills] = useState<SkillsResponse | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    Promise.all([
      journeyApi.getDashboard(),
      journeyApi.getPlan().catch(() => null),
      journeyApi.getSkills().catch(() => null),
    ])
      .then(([dashboard, plan, skillsData]) => {
        setData(dashboard)
        if (plan) setTodayPlan(plan.plan.find(d => d.status === 'today') ?? null)
        if (skillsData?.skills) setSkills(skillsData)
        setStreak(computeStreak(dashboard.recentActivity ?? []))
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

  const { profile, recommendation, recentActivity, completedCount, totalTopics, progressPercent } = data
  const daysPassed = Math.floor(
    (Date.now() - new Date(profile.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )
  const daysLeft = Math.max(0, profile.preparationDays - daysPassed)
  const currentDay = daysPassed + 1
  const continueHref = recommendation
    ? `/dashboard/plannr/topic/${recommendation.topicSlug}`
    : todayPlan?.topics[0]
      ? `/dashboard/plannr/topic/${todayPlan.topics[0].slug}`
      : '/dashboard/plannr/roadmap'
  const stageLabel = STAGE_LABELS[profile.currentStage] ?? `Stage ${profile.currentStage}`
  const weak = skills?.weakestSkill
  const strong = skills?.strongestSkill
  const focusAreas = profile.focusAreas ?? []

  return (
    <div className="relative min-h-full w-full bg-paper overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--brand) 18%, transparent)' }}
      />

      <div className="relative w-full px-6 py-8 lg:px-10 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl border border-hairline bg-paper-elevated/90 backdrop-blur-sm p-6 lg:p-8 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <ProgressRing percent={progressPercent} size={88} />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-2">Plannr · Home</p>
              <h1 className="font-serif text-[30px] lg:text-[34px] font-medium text-ink leading-[1.05] tracking-tight">
                Keep going — Day {currentDay}.
              </h1>
              <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
                {ROLE_LABELS[profile.targetRole] ?? profile.targetRole}
                {' · '}
                {stageLabel}
                {' · '}
                {daysLeft > 0 ? `${daysLeft} days left` : 'Timeline complete'}
                {focusAreas.length > 0 ? ` · Focus: ${focusAreas.slice(0, 3).join(', ')}` : ''}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Link
                  href={continueHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Play size={14} /> Continue learning
                </Link>
                <Link
                  href="/dashboard/plannr/plan"
                  className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper px-4 py-2.5 text-[13px] font-medium text-ink hover:border-brand/30 transition-colors"
                >
                  <CalendarDays size={14} /> Full plan
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:w-56 shrink-0">
              {[
                { label: 'Topics', value: `${completedCount}/${totalTopics}` },
                { label: 'Stage', value: String(profile.currentStage) },
                { label: 'Streak', value: streak > 0 ? `${streak}d` : '—' },
                { label: 'Left', value: daysLeft > 0 ? `${daysLeft}d` : 'Done' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl border border-hairline bg-paper px-3 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">{stat.label}</p>
                  <p className="font-serif text-[20px] font-medium text-ink leading-tight mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Jump in</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map(({ href, icon: Icon, label, blurb }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-hairline bg-paper-elevated p-3.5 hover:border-brand/30 hover:shadow-sm transition-all"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/8 text-brand mb-2.5 group-hover:bg-brand group-hover:text-white transition-colors">
                  <Icon size={15} />
                </span>
                <p className="text-[13px] font-medium text-ink">{label}</p>
                <p className="text-[11px] text-ink-faint mt-0.5 leading-snug">{blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main column */}
          <div className="space-y-5 min-w-0">
            {/* Continue focus */}
            <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.07] to-paper-elevated p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand mb-3">Up next</p>
              {recommendation ? (
                <>
                  <h2 className="font-serif text-[24px] font-medium text-ink leading-tight">
                    {recommendation.topicTitle}
                  </h2>
                  <p className="mt-2 text-[13px] text-ink-muted leading-relaxed max-w-lg">
                    {recommendation.reason}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1 text-[11px] text-ink-muted">
                      <Clock size={11} /> ~{recommendation.estimatedMinutes} min
                    </span>
                    <Link
                      href={`/dashboard/plannr/topic/${recommendation.topicSlug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
                    >
                      Start topic <ArrowRight size={13} />
                    </Link>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="font-serif text-[22px] font-medium text-ink">Curriculum complete</h2>
                  <p className="mt-1 text-[13px] text-ink-muted">You finished the path — lock it in with mocks.</p>
                  <Link
                    href="/dashboard/plannr/experiences"
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand"
                  >
                    Open interview mocks <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* Today */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Today&apos;s focus
                </p>
                {todayPlan && todayPlan.topics.length > 0 && (
                  <span className="font-mono text-[11px] text-ink-faint">{todayPlan.totalMinutes} min total</span>
                )}
              </div>
              {todayPlan && todayPlan.topics.length > 0 ? (
                <ul className="space-y-2.5">
                  {todayPlan.topics.map((act, i) => (
                    <li key={act.slug}>
                      <Link
                        href={`/dashboard/plannr/topic/${act.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-hairline bg-paper px-3 py-2.5 hover:border-brand/30 transition-colors"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[11px] font-bold">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-[13px] font-medium text-ink">{act.title}</span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                          <Clock size={10} /> {act.estimatedMinutes}m
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-hairline bg-paper px-4 py-6 text-center">
                  <p className="text-[13px] text-ink-muted">
                    {todayPlan === null ? 'Loading your plan…' : 'Nothing packed for today — pick up your recommended topic.'}
                  </p>
                  <Link href={continueHref} className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand">
                    Continue anyway <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

            {/* Recent activity */}
            {recentActivity.length > 0 && (
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">
                  Recent activity
                </p>
                <ul className="space-y-2">
                  {recentActivity.slice(0, 5).map(a => (
                    <li key={a._id} className="flex items-center gap-3 text-[12px]">
                      <CheckCircle2 size={13} className="text-brand shrink-0" />
                      <span className="flex-1 text-ink truncate capitalize">
                        {a.activityType.replace(/_/g, ' ')}
                        {a.topicSlug ? ` · ${a.topicSlug}` : ''}
                      </span>
                      <span className="font-mono text-[10px] text-ink-faint shrink-0">
                        {new Date(a.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Side column */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Progress
                </p>
                <TrendingUp size={14} className="text-brand" />
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing percent={progressPercent} size={64} />
                <div>
                  <p className="font-serif text-[22px] font-medium text-ink leading-none">
                    {completedCount}
                    <span className="text-ink-faint text-[14px]"> / {totalTopics}</span>
                  </p>
                  <p className="text-[12px] text-ink-muted mt-1">topics completed</p>
                  <p className="text-[11px] text-ink-faint mt-1">Stage {profile.currentStage} · {stageLabel}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-hairline overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {(streak > 0 || weak || strong || skills?.howToImprove) && (
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 space-y-4">
                {streak > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                      <Flame size={18} />
                    </span>
                    <div>
                      <p className="font-serif text-[18px] font-medium text-ink leading-none">{streak}-day streak</p>
                      <p className="text-[11px] text-ink-faint mt-1">Keep the chain going today</p>
                    </div>
                  </div>
                )}
                {skills?.overallScore === null && skills?.howToImprove && (
                  <div className="rounded-xl border border-hairline bg-paper px-3 py-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">Skills</p>
                    <p className="text-[13px] font-medium text-ink">{skills.howToImprove}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">Scores start at 0 — earn them with practice.</p>
                    <Link href="/dashboard/plannr/skills" className="mt-1.5 inline-block text-[11px] font-medium text-brand">
                      View skills →
                    </Link>
                  </div>
                )}
                {weak?.assessed && (
                  <div className="rounded-xl border border-hairline bg-paper px-3 py-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">Focus next</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-ink">{weak.label}</p>
                      <span className="font-mono text-[12px] text-amber-700">{weak.score}</span>
                    </div>
                    <Link href="/dashboard/plannr/skills" className="mt-1.5 inline-block text-[11px] font-medium text-brand">
                      View skills →
                    </Link>
                  </div>
                )}
                {strong?.assessed && (
                  <div className="rounded-xl border border-hairline bg-paper px-3 py-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">Strongest skill</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-ink">{strong.label}</p>
                      <span className="font-mono text-[12px] text-emerald-700">{strong.score}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <SpacedRepetitionWidget />

            <Link
              href="/dashboard/plannr/revise"
              className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper-elevated p-4 hover:border-brand/30 transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/8 text-brand">
                <BookOpen size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">Cheat sheets & revise</p>
                <p className="text-[11px] text-ink-faint">Pull packs from completed topics</p>
              </div>
              <ArrowRight size={14} className="text-ink-faint shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2,
  Sprout, Leaf, Settings2, Shuffle, Target,
  Flame, CalendarDays, Mountain, BookOpen, Wrench, Zap,
  Route, Clock, Compass,
} from 'lucide-react'
import { journeyApi, type DiagnosticQuestion, type DiagnosticResult } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'sde1',      label: 'SDE-1',       sub: 'Junior / early career',   Icon: Sprout    },
  { value: 'sde2',      label: 'SDE-2',       sub: 'Mid-level interviews',    Icon: Leaf      },
  { value: 'backend',   label: 'Backend',     sub: 'Services & APIs focus',    Icon: Settings2 },
  { value: 'fullstack', label: 'Full Stack',  sub: 'End-to-end product think', Icon: Shuffle   },
  { value: 'general',   label: 'General LLD', sub: 'Broad design mastery',    Icon: Target    },
]

const TIMELINES = [
  { value: 7,  label: '7 days',  sub: 'Crash course',   Icon: Flame,        tone: 'Intense' },
  { value: 14, label: '14 days', sub: 'Focused prep',   Icon: Target,       tone: 'Focused' },
  { value: 30, label: '30 days', sub: 'Thorough path',  Icon: CalendarDays, tone: 'Balanced' },
  { value: 60, label: '60 days', sub: 'Deep mastery',   Icon: Mountain,     tone: 'Deep' },
]

const LEVELS = [
  { value: 'scratch',   label: 'Starting from scratch', desc: 'New to OOP and design patterns',     Icon: Sprout   },
  { value: 'oop',       label: 'Know OOP',              desc: 'Classes, inheritance, polymorphism', Icon: BookOpen },
  { value: 'basic-lld', label: 'Know basic LLD',        desc: 'SOLID and some patterns',            Icon: Wrench   },
  { value: 'solving',   label: 'Already solving',       desc: 'Practiced LLD problems before',      Icon: Zap      },
]

const FOCUS_AREAS = [
  { value: 'patterns',  label: 'Patterns' },
  { value: 'solid',     label: 'SOLID' },
  { value: 'systems',   label: 'Systems (LLD)' },
  { value: 'interview', label: 'Interview delivery' },
  { value: 'oop',       label: 'OOP fundamentals' },
]

const DAILY_MINUTES = [25, 45, 60, 90]

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend', fullstack: 'Full Stack', general: 'General LLD',
}
const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP',
  'basic-lld': 'Know basic LLD', solving: 'Already solving',
}

type WizardStep = 'welcome' | 'role' | 'timeline' | 'level' | 'pace' | 'diagnostic'

const STEPS: WizardStep[] = ['welcome', 'role', 'timeline', 'level', 'pace', 'diagnostic']

const STEP_META: Record<WizardStep, { eyebrow: string; title: string; sub: string }> = {
  welcome: {
    eyebrow: 'Step 1 · Name',
    title: 'What should we call this plan?',
    sub: 'Give it a name you’ll recognize when you switch plans later.',
  },
  role: {
    eyebrow: 'Step 2 · Target',
    title: 'What are you preparing for?',
    sub: 'We’ll tune topic depth and interview framing to this role.',
  },
  timeline: {
    eyebrow: 'Step 3 · Pace',
    title: 'How much time do you have?',
    sub: 'Shorter plans compress; longer ones go deeper with more review.',
  },
  level: {
    eyebrow: 'Step 4 · Placement',
    title: 'Where should we place you on the path?',
    sub: 'This only skips early stages. Skill scores still start at 0 — nothing is assumed.',
  },
  pace: {
    eyebrow: 'Step 5 · Focus',
    title: 'Shape your daily rhythm',
    sub: 'Optional focus areas and how long you can study each day.',
  },
  diagnostic: {
    eyebrow: 'Step 6 · Placement',
    title: 'Quick placement check',
    sub: 'A few questions refine your starting stage. Skip anytime.',
  },
}

const DOT_GRID = {
  backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
}

function ProgressRail({ step }: { step: WizardStep }) {
  const idx = STEPS.indexOf(step)
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            i < idx && 'bg-brand',
            i === idx && 'bg-brand/70',
            i > idx && 'bg-hairline',
          )}
        />
      ))}
    </div>
  )
}

function GeneratingScreen({
  role, timeline, level, genStep, done,
}: {
  role: string; timeline: number; level: string; genStep: number; done: boolean
}) {
  const steps = [
    `Reading your ${ROLE_LABELS[role] ?? 'role'} profile`,
    'Mapping topics to your experience level',
    `Sequencing your ${timeline}-day learning path`,
    'Scheduling daily sessions and reviews',
    'Finalising your personalised plan',
  ]

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-paper px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={DOT_GRID} />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand) 28%, transparent), transparent 70%)' }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative h-16 w-16">
            {done ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand/20 bg-brand-tint animate-in fade-in duration-300">
                <CheckCircle2 size={28} className="text-brand" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-paper-elevated">
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
              </div>
            )}
          </div>
        </div>
        <div className="mb-8 text-center">
          {done ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <h2 className="font-serif text-[30px] font-medium tracking-tight text-ink">Your plan is ready.</h2>
              <p className="mt-1.5 text-[13px] text-ink-muted">Taking you there now…</p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-[22px] font-medium text-ink">Building your plan</h2>
              <p className="mt-1 text-[13px] text-ink-muted">This takes just a moment</p>
            </>
          )}
        </div>
        {!done && (
          <div className="mb-6 space-y-3 rounded-2xl border border-hairline bg-paper-elevated px-5 py-4">
            {steps.map((label, i) => {
              const revealed = i <= genStep
              const isActive = i === genStep
              const isDone = i < genStep
              return (
                <div
                  key={label}
                  className={cn(
                    'flex items-center gap-3 transition-all duration-500',
                    revealed ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0',
                  )}
                >
                  <div className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-300',
                    isDone && 'border-brand bg-brand',
                    isActive && 'border-brand bg-transparent',
                    !isDone && !isActive && 'border-hairline-strong',
                  )}>
                    {isDone && <Check size={9} className="text-white" strokeWidth={3} />}
                    {isActive && <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />}
                  </div>
                  <span className={cn(
                    'text-[13px] transition-colors duration-300',
                    isDone && 'text-ink-faint line-through',
                    isActive && 'font-medium text-ink',
                    !isDone && !isActive && 'text-ink-muted',
                  )}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {!done && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[ROLE_LABELS[role], `${timeline} days`, LEVEL_LABELS[level]].map((chip, i) => (
              <span key={i} className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 text-[11px] font-medium text-ink-muted">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdditional = searchParams.get('mode') === 'new'

  const [step, setStep] = useState<WizardStep>('welcome')
  const [planName, setPlanName] = useState('')
  const [role, setRole] = useState('')
  const [timeline, setTimeline] = useState(30)
  const [level, setLevel] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [dailyMinutes, setDailyMinutes] = useState(45)
  const [interviewDate, setInterviewDate] = useState('')
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [diagResult, setDiagResult] = useState<DiagnosticResult | null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(-1)
  const [genDone, setGenDone] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const stepIdx = STEPS.indexOf(step)
  const meta = STEP_META[step]

  useEffect(() => {
    if (step === 'diagnostic' && questions.length === 0) {
      journeyApi.getDiagnostic().then(r => setQuestions(r.questions)).catch(() => setQuestions([]))
    }
  }, [step, questions.length])

  function goTo(next: WizardStep) {
    setAnimKey(k => k + 1)
    setStep(next)
  }

  function goBack() {
    if (stepIdx <= 0) {
      router.push('/dashboard/plannr')
      return
    }
    goTo(STEPS[stepIdx - 1])
  }

  function goNext() {
    if (stepIdx >= STEPS.length - 1) return
    goTo(STEPS[stepIdx + 1])
  }

  function toggleFocus(v: string) {
    setFocusAreas(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]))
  }

  function canAdvance(): boolean {
    if (step === 'welcome') return !!planName.trim()
    if (step === 'role') return !!role
    if (step === 'timeline') return !!timeline
    if (step === 'level') return !!level
    if (step === 'pace') return true
    return false
  }

  async function runSetup(diagnostic?: DiagnosticResult) {
    setGenerating(true)
    setGenStep(0)
    const STEP_MS = 780
    const STEP_COUNT = 5
    const animPromise = new Promise<void>(resolve => {
      for (let i = 1; i < STEP_COUNT; i++) {
        const idx = i
        setTimeout(() => setGenStep(idx), idx * STEP_MS)
      }
      setTimeout(resolve, STEP_COUNT * STEP_MS)
    })
    const apiPromise = journeyApi.setup({
      planName: planName.trim() || 'My Plannr',
      targetRole: role,
      preparationDays: timeline,
      currentLevel: diagnostic?.suggestedLevel ?? level,
      focusAreas,
      dailyMinutes,
      interviewDate: interviewDate || undefined,
      diagnostic: diagnostic ?? undefined,
    })
    try {
      await Promise.all([animPromise, apiPromise])
      setGenDone(true)
      await new Promise(r => setTimeout(r, 900))
      router.push('/dashboard/plannr')
      router.refresh()
    } catch {
      setGenerating(false)
      setGenStep(-1)
      setGenDone(false)
    }
  }

  async function finishDiagnostic() {
    const payload = Object.entries(answers).map(([id, optionId]) => ({ id, optionId }))
    const res = await journeyApi.submitDiagnostic(payload)
    const diagnostic: DiagnosticResult = {
      score: res.score,
      suggestedLevel: res.suggestedLevel,
      suggestedStage: res.suggestedStage,
      answers: res.answers,
      completedAt: new Date().toISOString(),
    }
    setDiagResult(diagnostic)
    setLevel(res.suggestedLevel)
    await runSetup(diagnostic)
  }

  if (generating) {
    return (
      <GeneratingScreen
        role={role}
        timeline={timeline}
        level={level}
        genStep={genStep}
        done={genDone}
      />
    )
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-paper">
      <div className="pointer-events-none absolute inset-0 opacity-35" style={DOT_GRID} />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand) 22%, transparent), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand) 18%, transparent), transparent 70%)' }}
      />

      {/* Top bar */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper-elevated/90 px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-brand/30 hover:text-ink"
          >
            <ArrowLeft size={13} />
            {stepIdx === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Compass size={13} strokeWidth={2.25} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {isAdditional ? 'New plan' : 'Plannr setup'}
            </span>
          </div>
          <span className="font-mono text-[10px] tabular-nums text-ink-faint">
            {stepIdx + 1} / {STEPS.length}
          </span>
        </div>
        <ProgressRail step={step} />
      </div>

      {/* Step body */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div
          key={animKey}
          className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-3 duration-400"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {meta.eyebrow}
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,4vw,2.35rem)] font-medium leading-[1.05] tracking-tight text-ink">
            {meta.title}
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-muted">
            {meta.sub}
          </p>

          <div className="mt-8 flex-1">
            {step === 'welcome' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-hairline bg-paper-elevated/90 p-5 sm:p-6">
                  <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                    Plan name
                  </label>
                  <input
                    autoFocus
                    value={planName}
                    onChange={e => setPlanName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canAdvance() && goNext()}
                    placeholder="e.g. Google SDE-2 · May"
                    className="w-full border-0 bg-transparent font-serif text-[26px] font-medium text-ink placeholder:text-ink-faint/60 focus:outline-none"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Route, t: 'Personalised path', d: 'Topics ordered for your level' },
                    { icon: Clock, t: 'Daily rhythm', d: 'Sessions sized to your minutes' },
                    { icon: Target, t: 'Interview ready', d: 'Practice → revise → mocks' },
                  ].map(({ icon: Icon, t, d }) => (
                    <div key={t} className="rounded-2xl border border-hairline/80 bg-paper-elevated/60 px-4 py-3.5">
                      <Icon size={15} className="mb-2 text-brand" strokeWidth={2} />
                      <p className="text-[13px] font-medium text-ink">{t}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'role' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map(r => {
                  const active = role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        'group flex items-start gap-3.5 rounded-2xl border px-4 py-4 text-left transition-all duration-200',
                        active
                          ? 'border-brand bg-brand-tint/50 shadow-sm shadow-brand/10'
                          : 'border-hairline bg-paper-elevated/80 hover:border-brand/35',
                      )}
                    >
                      <span className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                        active ? 'bg-brand text-white' : 'bg-paper text-ink-muted group-hover:text-brand',
                      )}>
                        <r.Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span>
                        <span className={cn('block font-serif text-[18px] font-medium', active ? 'text-brand' : 'text-ink')}>
                          {r.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-ink-muted">{r.sub}</span>
                      </span>
                      {active && <Check size={16} className="ml-auto mt-1 shrink-0 text-brand" strokeWidth={2.5} />}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 'timeline' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {TIMELINES.map(t => {
                  const active = timeline === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTimeline(t.value)}
                      className={cn(
                        'relative overflow-hidden rounded-2xl border px-5 py-5 text-left transition-all duration-200',
                        active
                          ? 'border-brand bg-brand-tint/50 shadow-sm shadow-brand/10'
                          : 'border-hairline bg-paper-elevated/80 hover:border-brand/35',
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl',
                          active ? 'bg-brand text-white' : 'bg-paper text-ink-muted',
                        )}>
                          <t.Icon size={16} />
                        </span>
                        <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                          {t.tone}
                        </span>
                      </div>
                      <p className={cn('font-serif text-[26px] font-medium leading-none', active ? 'text-brand' : 'text-ink')}>
                        {t.label}
                      </p>
                      <p className="mt-1.5 text-[12px] text-ink-muted">{t.sub}</p>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 'level' && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEVELS.map(l => {
                    const active = level === l.value
                    return (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setLevel(l.value)}
                        className={cn(
                          'flex flex-col rounded-2xl border px-4 py-4 text-left transition-all duration-200',
                          active
                            ? 'border-brand bg-brand-tint/50 shadow-sm shadow-brand/10'
                            : 'border-hairline bg-paper-elevated/80 hover:border-brand/35',
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2.5">
                          <l.Icon size={15} className={active ? 'text-brand' : 'text-ink-faint'} />
                          <p className={cn('text-[14px] font-medium', active ? 'text-brand' : 'text-ink')}>
                            {l.label}
                          </p>
                        </div>
                        <p className="text-[12px] leading-relaxed text-ink-muted">{l.desc}</p>
                      </button>
                    )
                  })}
                </div>
                <p className="rounded-xl border border-hairline/80 bg-paper-elevated/60 px-4 py-3 text-[12px] text-ink-muted">
                  Placement skips beginner stages when you already know the basics. Your skill
                  scores still start at <span className="font-medium text-ink">0</span> and only
                  rise from practice, checks, mastery, and mocks.
                </p>
              </div>
            )}

            {step === 'pace' && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                    Focus areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map(f => {
                      const on = focusAreas.includes(f.value)
                      return (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => toggleFocus(f.value)}
                          className={cn(
                            'rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors',
                            on
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-hairline bg-paper-elevated text-ink-muted hover:border-brand/30',
                          )}
                        >
                          {f.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                    Daily minutes
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {DAILY_MINUTES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDailyMinutes(m)}
                        className={cn(
                          'rounded-2xl border py-3.5 text-center transition-all',
                          dailyMinutes === m
                            ? 'border-brand bg-brand-tint/50'
                            : 'border-hairline bg-paper-elevated/80 hover:border-brand/30',
                        )}
                      >
                        <span className={cn(
                          'block font-serif text-[22px] font-medium leading-none',
                          dailyMinutes === m ? 'text-brand' : 'text-ink',
                        )}>
                          {m}
                        </span>
                        <span className="mt-1 block text-[10px] text-ink-faint">min</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                    Interview date · optional
                  </p>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full max-w-xs rounded-2xl border border-hairline bg-paper-elevated px-4 py-3 text-[14px] text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            )}

            {step === 'diagnostic' && (
              <div>
                {questions[qIdx] ? (
                  <div className="space-y-3">
                    <p className="mb-1 font-mono text-[10px] text-ink-faint">
                      Question {qIdx + 1} of {questions.length}
                    </p>
                    <p className="mb-4 text-[16px] font-medium leading-snug text-ink">
                      {questions[qIdx].prompt}
                    </p>
                    {questions[qIdx].options.map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setAnswers(a => ({ ...a, [questions[qIdx].id]: o.id }))}
                        className={cn(
                          'w-full rounded-2xl border px-4 py-3.5 text-left text-[13px] transition-colors',
                          answers[questions[qIdx].id] === o.id
                            ? 'border-brand bg-brand/5 text-ink'
                            : 'border-hairline bg-paper-elevated text-ink-muted hover:border-brand/30',
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                    {diagResult && (
                      <p className="pt-2 text-[12px] text-ink-muted">
                        Suggested level: {diagResult.suggestedLevel} · stage {diagResult.suggestedStage}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-16">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="relative z-10 mt-8 flex items-center justify-between gap-3 border-t border-hairline/80 pt-5">
          {step === 'diagnostic' ? (
            <>
              <button
                type="button"
                onClick={() => runSetup()}
                className="text-[13px] text-ink-faint transition-colors hover:text-ink"
              >
                Skip → create plan
              </button>
              {questions.length > 0 && qIdx < questions.length - 1 ? (
                <button
                  type="button"
                  disabled={!answers[questions[qIdx]?.id]}
                  onClick={() => setQIdx(i => i + 1)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-[14px] font-semibold text-white shadow-sm shadow-brand/20 transition-opacity disabled:opacity-40"
                >
                  Next <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={questions.length === 0 || Object.keys(answers).length < questions.length}
                  onClick={finishDiagnostic}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-[14px] font-semibold text-white shadow-sm shadow-brand/20 transition-opacity disabled:opacity-40"
                >
                  Finish & create <ArrowRight size={15} />
                </button>
              )}
            </>
          ) : (
            <>
              <p className="hidden text-[12px] text-ink-faint sm:block">
                {step === 'pace' ? 'Focus is optional — continue anytime' : 'One step at a time'}
              </p>
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={goNext}
                className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-brand px-7 py-3 text-[14px] font-semibold text-white shadow-sm shadow-brand/20 transition-all hover:opacity-95 disabled:opacity-40"
              >
                Continue <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Check, CheckCircle2,
  Sprout, Leaf, Settings2, Shuffle, Target,
  Flame, CalendarDays, Mountain, BookOpen, Wrench, Zap,
} from 'lucide-react'
import { journeyApi } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

// -- Data ----------------------------------------------------------------------
const ROLES = [
  { value: 'sde1',      label: 'SDE-1',       Icon: Sprout    },
  { value: 'sde2',      label: 'SDE-2',       Icon: Leaf      },
  { value: 'backend',   label: 'Backend',     Icon: Settings2 },
  { value: 'fullstack', label: 'Full Stack',  Icon: Shuffle   },
  { value: 'general',   label: 'General LLD', Icon: Target    },
]

const TIMELINES = [
  { value: 7,  label: '7 days',  sub: 'Crash course', Icon: Flame        },
  { value: 14, label: '14 days', sub: 'Focused prep',  Icon: Target       },
  { value: 30, label: '30 days', sub: 'Thorough',      Icon: CalendarDays },
  { value: 60, label: '60 days', sub: 'Deep mastery',  Icon: Mountain     },
]

const LEVELS = [
  { value: 'scratch',   label: 'Starting from scratch',    desc: 'New to OOP and design patterns',     Icon: Sprout   },
  { value: 'oop',       label: 'Know OOP',                 desc: 'Classes, inheritance, polymorphism', Icon: BookOpen },
  { value: 'basic-lld', label: 'Know basic LLD',           desc: 'Know SOLID, some patterns',          Icon: Wrench   },
  { value: 'solving',   label: 'Already solving problems', desc: 'Practiced LLD problems before',      Icon: Zap      },
]

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend', fullstack: 'Full Stack', general: 'General LLD',
}

const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP',
  'basic-lld': 'Know basic LLD', solving: 'Already solving',
}

// -- Shared background texture -------------------------------------------------
const DOT_GRID = {
  backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
}

// -- Generation / loading screen -----------------------------------------------
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
    <div className="min-h-[calc(100vh-64px)] bg-paper flex items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 opacity-30" style={DOT_GRID} />

      <div className="relative w-full max-w-sm">

        {/* -- Animated icon -- */}
        <div className="flex justify-center mb-8">
          <div className="relative h-16 w-16">
            {done ? (
              <div className="h-16 w-16 rounded-full bg-brand-tint border border-brand/20 flex items-center justify-center animate-in fade-in duration-300">
                <CheckCircle2 size={28} className="text-brand" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full border border-hairline bg-paper-elevated flex items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
              </div>
            )}
          </div>
        </div>

        {/* -- Headline -- */}
        <div className="text-center mb-8">
          {done ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <h2 className="font-serif text-[30px] font-medium text-ink tracking-tight">Your plan is ready.</h2>
              <p className="text-[13px] text-ink-muted mt-1.5">Taking you there now…</p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-[22px] font-medium text-ink">Building your plan</h2>
              <p className="text-[13px] text-ink-muted mt-1">This takes just a moment</p>
            </>
          )}
        </div>

        {/* -- Steps (stream in one by one) -- */}
        {!done && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated px-5 py-4 space-y-3 mb-6">
            {steps.map((step, i) => {
              const revealed = i <= genStep
              const isActive = i === genStep
              const isDone   = i < genStep
              return (
                <div
                  key={step}
                  className={cn(
                    'flex items-center gap-3 transition-all duration-500',
                    revealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3',
                  )}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    'h-5 w-5 rounded-full shrink-0 flex items-center justify-center border-[1.5px] transition-all duration-300',
                    isDone   ? 'bg-brand border-brand'           : '',
                    isActive ? 'border-brand bg-transparent'     : '',
                    !isDone && !isActive ? 'border-hairline-strong' : '',
                  )}>
                    {isDone   && <Check size={9} className="text-white" strokeWidth={3} />}
                    {isActive && <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'text-[13px] transition-colors duration-300',
                    isDone   ? 'text-ink-faint line-through' : '',
                    isActive ? 'text-ink font-medium'        : '',
                    !isDone && !isActive ? 'text-ink-muted'  : '',
                  )}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* -- Plan metadata chips -- */}
        {!done && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
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

// -- Main wizard ---------------------------------------------------------------
export function OnboardingWizard() {
  const router = useRouter()
  const [planName,   setPlanName]  = useState('')
  const [role,       setRole]      = useState('')
  const [timeline,   setTimeline]  = useState(30)
  const [level,      setLevel]     = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStep,    setGenStep]   = useState(-1)
  const [genDone,    setGenDone]   = useState(false)

  const canSubmit = !!planName.trim() && !!role && !!level
  const STEP_MS   = 780
  const STEP_COUNT = 5

  async function handleFinish() {
    if (!canSubmit || generating) return
    setGenerating(true)
    setGenStep(0)

    // Stream steps in one by one
    const animPromise = new Promise<void>(resolve => {
      for (let i = 1; i < STEP_COUNT; i++) {
        const idx = i
        setTimeout(() => setGenStep(idx), idx * STEP_MS)
      }
      setTimeout(resolve, STEP_COUNT * STEP_MS)
    })

    // API call
    const apiPromise = journeyApi.setup({
      planName:        planName.trim() || 'My Plannr',
      targetRole:      role,
      preparationDays: timeline,
      currentLevel:    level,
    })

    try {
      await Promise.all([animPromise, apiPromise])
      setGenDone(true)
      await new Promise(r => setTimeout(r, 1000))
      router.push('/dashboard/plannr')
    } catch {
      setGenerating(false)
      setGenStep(-1)
      setGenDone(false)
    }
  }

  // Show generation screen
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

  // -- Setup form ------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper flex items-center justify-center px-6 py-6">

      <div className="pointer-events-none fixed inset-0 opacity-30" style={DOT_GRID} />

      <div className="relative w-full max-w-2xl">

        {/* Header */}
        <div className="mb-7">
          <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-3">
            plannr · setup
          </p>
          <h1 className="font-serif text-[34px] font-medium text-ink leading-[0.92] tracking-tight">
            Build your plan.
          </h1>
          <p className="text-[13px] text-ink-muted mt-1.5">
            Takes 30 seconds. Everything can be changed later.
          </p>
        </div>

        <div className="space-y-5">

          {/* Plan name */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-2">Plan name</p>
            <input
              autoFocus
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && handleFinish()}
              placeholder="e.g. Google SDE-2 Prep"
              className="w-full rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand transition-colors"
            />
            <div className="flex gap-2 mt-2">
              {['SDE-2 Prep', 'FAANG Target', 'Startup Round', 'General Practice'].map(s => (
                <button
                  key={s}
                  onClick={() => setPlanName(s)}
                  className="text-[11px] px-2.5 py-0.5 rounded-full border border-hairline text-ink-muted hover:border-brand/30 hover:text-brand transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Target role */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-2">Preparing for</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all',
                    role === r.value
                      ? 'border-brand bg-brand-tint text-brand'
                      : 'border-hairline bg-paper-elevated text-ink-muted hover:border-brand/30 hover:text-ink',
                  )}
                >
                  <r.Icon size={13} className="shrink-0" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-2">Time available</p>
            <div className="grid grid-cols-4 gap-2">
              {TIMELINES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTimeline(t.value)}
                  className={cn(
                    'rounded-xl border py-3 text-center transition-all',
                    timeline === t.value
                      ? 'border-brand bg-brand-tint'
                      : 'border-hairline bg-paper-elevated hover:border-brand/30',
                  )}
                >
                  <p className={cn(
                    'font-serif text-[17px] font-medium leading-none',
                    timeline === t.value ? 'text-brand' : 'text-ink',
                  )}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-1">{t.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Current level */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-2">Current level</p>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={cn(
                    'text-left rounded-xl border px-4 py-3 transition-all',
                    level === l.value
                      ? 'border-brand bg-brand-tint'
                      : 'border-hairline bg-paper-elevated hover:border-brand/30',
                  )}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <l.Icon size={12} className={cn('shrink-0', level === l.value ? 'text-brand' : 'text-ink-faint')} />
                    <p className={cn('font-medium text-[13px]', level === l.value ? 'text-brand' : 'text-ink')}>
                      {l.label}
                    </p>
                  </div>
                  <p className="text-[11px] text-ink-muted pl-5">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <p className="text-[12px] text-ink-faint">Settings can be changed any time</p>
            <button
              onClick={handleFinish}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-hover disabled:opacity-40 transition-colors"
            >
              Create My Plan <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

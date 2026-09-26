'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, CheckCircle, Clock, Target, Zap } from 'lucide-react'
import { journeyApi } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

// ── Step 1: Target Role ───────────────────────────────────────────────────────
const ROLES = [
  { value: 'sde1', label: 'SDE-1', desc: 'Entry-level engineering role', icon: '🌱' },
  { value: 'sde2', label: 'SDE-2', desc: 'Mid-level with more depth expected', icon: '🌿' },
  { value: 'backend', label: 'Backend Engineer', desc: 'Backend-focused role', icon: '⚙️' },
  { value: 'fullstack', label: 'Full Stack Engineer', desc: 'Frontend + backend', icon: '🔄' },
  { value: 'general', label: 'General LLD', desc: 'Just want to learn LLD well', icon: '🎯' },
]

const TIMELINES = [
  { value: 7, label: '7 Days', desc: 'Crash course — essentials only', icon: '⚡', color: 'text-red-600' },
  { value: 14, label: '14 Days', desc: 'Focused preparation', icon: '🎯', color: 'text-amber-600' },
  { value: 30, label: '30 Days', desc: 'Comfortable, thorough prep', icon: '📅', color: 'text-blue-600' },
  { value: 60, label: '60 Days', desc: 'Deep mastery — no rush', icon: '🏔️', color: 'text-green-600' },
]

const LEVELS = [
  { value: 'scratch', label: 'Starting from scratch', desc: "New to OOP and design patterns", icon: '🌱' },
  { value: 'oop', label: 'Know OOP', desc: 'Understand classes, inheritance, polymorphism', icon: '📚' },
  { value: 'basic-lld', label: 'Know basic LLD', desc: 'Familiar with SOLID, some patterns', icon: '🔧' },
  { value: 'solving', label: 'Already solving problems', desc: 'Practiced LLD problems before', icon: '⚡' },
]

function OptionCard<T>({
  option, selected, onSelect,
}: {
  option: { value: T; label: string; desc: string; icon: string; color?: string }
  selected: boolean
  onSelect: (v: T) => void
}) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all',
        selected
          ? 'border-brand bg-brand-tint/40'
          : 'border-hairline bg-paper-elevated hover:border-brand/30',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{option.icon}</span>
        <div>
          <p className={cn('font-medium text-[13px]', selected ? 'text-brand' : 'text-ink')}>
            {option.label}
          </p>
          <p className="text-[12px] text-ink-muted">{option.desc}</p>
        </div>
        {selected && <CheckCircle size={16} className="ml-auto shrink-0 text-brand" />}
      </div>
    </button>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [planName, setPlanName] = useState('')
  const [role, setRole] = useState<string>('')
  const [timeline, setTimeline] = useState<number>(30)
  const [level, setLevel] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const steps = ['Name Your Plan', 'Target Role', 'Preparation Time', 'Current Level']
  const canNext = [!!planName.trim(), !!role, !!timeline, !!level][step]

  async function handleFinish() {
    setLoading(true)
    try {
      await journeyApi.setup({ planName: planName.trim() || 'My Plannr', targetRole: role, preparationDays: timeline, currentLevel: level })
      router.push('/plannr')
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧭</div>
          <h1 className="font-serif text-2xl font-medium text-ink">Set Up Your Plannr</h1>
          <p className="text-[13px] text-ink-muted mt-2">Quick setup to personalize your preparation plan</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors',
                i < step ? 'bg-brand text-white' : i === step ? 'bg-brand text-white' : 'bg-hairline text-ink-faint',
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <p className={cn('text-[11px] font-medium', i === step ? 'text-ink' : 'text-ink-faint')}>{s}</p>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-hairline" />}
            </div>
          ))}
        </div>

        {/* Step 0: Plan Name */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-[16px] text-ink">What's this plan for?</h2>
            <p className="text-[13px] text-ink-muted">Give it a name so you can recognise it when you have multiple plans.</p>
            <input
              autoFocus
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canNext && setStep(1)}
              placeholder="e.g. Google SDE-2 Prep, Amazon Interview"
              className="w-full rounded-xl border border-hairline px-4 py-3 text-[14px] text-ink bg-paper-elevated focus:outline-none focus:border-brand"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {['SDE-2 Prep', 'FAANG Target', 'Startup Round', 'General Practice'].map(s => (
                <button key={s} onClick={() => setPlanName(s)}
                  className="text-[11px] px-3 py-1 rounded-full border border-hairline text-ink-muted hover:border-brand/30 hover:text-brand transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 mb-5">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-medium text-ink mb-4">What are you preparing for?</h2>
              {ROLES.map(r => (
                <OptionCard key={r.value} option={r} selected={role === r.value} onSelect={setRole} />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-medium text-ink mb-4">How much time do you have?</h2>
              {TIMELINES.map(t => (
                <OptionCard key={t.value} option={t} selected={timeline === t.value} onSelect={setTimeline} />
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-medium text-ink mb-4">What is your current level?</h2>
              {LEVELS.map(l => (
                <OptionCard key={l.value} option={l} selected={level === l.value} onSelect={setLevel} />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] text-ink-muted hover:text-ink disabled:opacity-40 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext || loading}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {loading ? (
                <><div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating...</>
              ) : (
                <>Start Plannr <Zap size={14} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Timer,
  Clock,
  StickyNote,
  Maximize2,
  Flame,
  BarChart2,
  ArrowRight,
  Pause,
  StopCircle,
  Infinity,
  Play,
  Lock,
  Rocket,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
import { usePlan } from '@/hooks/usePlan'
import { InterviewSetupModal } from '@/components/interview/InterviewSetupModal'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'Choose duration', desc: '30–90 min, custom, or unlimited' },
  { title: 'Design under pressure', desc: 'Timer, notes, pause, fullscreen' },
  { title: 'Save to Practice Log', desc: 'Canvas + time recorded automatically' },
]

const FEATURES = [
  { icon: Clock, title: 'Flexible timers', desc: 'Presets, custom, or no limit' },
  { icon: Pause, title: 'Pause & resume', desc: 'Step away without losing place' },
  { icon: StickyNote, title: 'Session notes', desc: 'Approach & trade-offs beside canvas' },
  { icon: Maximize2, title: 'Fullscreen', desc: 'Hide chrome for pure focus' },
  { icon: Flame, title: 'Daily streaks', desc: 'Build a practice habit' },
  { icon: BarChart2, title: 'Analytics', desc: 'Time, sessions, activity' },
  { icon: StopCircle, title: 'Auto-save', desc: 'Snapshot saved on exit' },
  { icon: Infinity, title: 'Resume later', desc: 'Pick up mid-session anytime' },
]

function EditorPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-lg shadow-ink/5">
      {/* Fake window chrome */}
      <div className="flex items-center gap-2 border-b border-hairline bg-paper px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
        </div>
        <span className="ml-2 text-[11px] font-medium text-ink-faint">LLDCanvas · Interview</span>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-tint px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          <span className="font-mono text-[11px] font-bold tabular-nums text-brand">24:07</span>
          <span className="mx-0.5 h-3 w-px bg-brand/20" />
          <Pause className="h-3 w-3 text-brand/70" />
          <StickyNote className="h-3 w-3 text-brand/70" />
          <StopCircle className="h-3 w-3 text-red-500/70" />
        </div>
      </div>

      {/* Fake canvas */}
      <div
        className="relative h-44 bg-paper sm:h-52"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--hairline) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      >
        <div className="absolute left-[12%] top-[22%] w-[28%] rounded-lg border border-hairline bg-paper-elevated p-2.5 shadow-sm">
          <div className="mb-1.5 h-2 w-16 rounded bg-brand/20" />
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded bg-hairline" />
            <div className="h-1.5 w-4/5 rounded bg-hairline" />
            <div className="h-1.5 w-3/5 rounded bg-hairline" />
          </div>
        </div>
        <div className="absolute right-[14%] top-[30%] w-[30%] rounded-lg border border-hairline bg-paper-elevated p-2.5 shadow-sm">
          <div className="mb-1.5 h-2 w-20 rounded bg-gold/30" />
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded bg-hairline" />
            <div className="h-1.5 w-2/3 rounded bg-hairline" />
          </div>
        </div>
        {/* Connection line hint */}
        <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
          <line x1="38%" y1="40%" x2="58%" y2="45%" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        <div className="absolute bottom-3 left-3 rounded-lg border border-hairline bg-paper-elevated/95 px-2.5 py-1.5 text-[10px] font-medium text-ink-faint shadow-sm backdrop-blur-sm">
          Infinite canvas · problem assigned
        </div>
      </div>
    </div>
  )
}

export default function InterviewModePage() {
  const { isFree } = usePlan()
  const [setupOpen, setSetupOpen] = useState(false)

  return (
    <AppShell>
      <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-paper">
        <InterviewSetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />

        {isFree ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/20">
              <Lock className="h-6 w-6" />
            </div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
              <Rocket className="h-3 w-3" /> Pro feature
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Interview Mode</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Timed LLD sessions with notes, fullscreen focus, and automatic Practice Log tracking.
            </p>
            <p className="mt-3 text-sm text-ink-faint">
              <span className="font-medium text-ink">Pro</span>: 10 sessions/month
              <span className="mx-2">·</span>
              <span className="font-medium text-ink">Ultimate</span>: Unlimited + analytics
            </p>
            <Link
              href="/pricing"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
            >
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Compact header */}
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline bg-paper-elevated px-5 py-4 sm:px-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <h1 className="text-xl font-semibold tracking-tight text-ink">Interview Mode</h1>
                  <span className="text-xs text-ink-faint">Timed practice in the editor</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/dashboard/sessions"
                  className="hidden items-center gap-1.5 rounded-xl border border-hairline px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink sm:inline-flex"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Log
                </Link>
                <button
                  type="button"
                  onClick={() => setSetupOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-all hover:bg-brand-hover active:scale-[0.98]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Interview
                </button>
              </div>
            </header>

            <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8 sm:py-8">
              {/* Hero band — full width of content */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-8 grid items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10"
              >
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
                    <Timer className="h-3.5 w-3.5" />
                    Live countdown in the topbar
                  </div>
                  <h2 className="text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl">
                    Practice LLD like a real interview
                  </h2>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
                    Pick a duration, get a problem, and design under the clock — with notes, pause, and auto-save to your Practice Log.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {['30 min', '45 min', '60 min', '90 min', 'Custom', 'No limit'].map(label => (
                      <span
                        key={label}
                        className="rounded-lg border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs font-medium text-ink-muted"
                      >
                        {label === 'No limit' ? (
                          <span className="inline-flex items-center gap-1">
                            <Infinity className="h-3 w-3" /> Unlimited
                          </span>
                        ) : (
                          label
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSetupOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
                    >
                      Start Interview
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-ink-faint">Opens the editor with a timer</p>
                  </div>
                </div>

                <EditorPreview />
              </motion.section>

              {/* Steps */}
              <section className="mb-8 grid gap-3 sm:grid-cols-3">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-2xl border border-hairline bg-paper-elevated p-4"
                  >
                    <span className="font-mono text-[11px] font-bold text-brand">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-1.5 text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{step.desc}</p>
                  </motion.div>
                ))}
              </section>

              {/* Features — dense */}
              <section className="mb-8">
                <h3 className="mb-3 text-sm font-semibold text-ink">Included in every session</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {FEATURES.map(f => (
                    <div
                      key={f.title}
                      className="flex gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-hairline hover:bg-paper-elevated"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint">
                        <f.icon className="h-4 w-4 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{f.title}</p>
                        <p className="text-xs text-ink-faint">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA strip */}
              <section className="overflow-hidden rounded-2xl bg-brand p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-brand-foreground">Ready when you are</h3>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {['Assigned problem', 'Live timer', 'Saved to log'].map(t => (
                        <li key={t} className="inline-flex items-center gap-1.5 text-xs text-brand-foreground/75">
                          <CheckCircle2 className="h-3 w-3" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSetupOpen(true)}
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-foreground px-5 py-3',
                      'text-sm font-semibold text-brand transition-opacity hover:opacity-95',
                    )}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Start Interview
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

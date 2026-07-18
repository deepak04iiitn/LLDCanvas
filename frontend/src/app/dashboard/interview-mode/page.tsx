'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Timer, Clock, StickyNote, Maximize2,
  Flame, BarChart2, CheckCircle2, ArrowRight,
  Pause, StopCircle, Infinity, Play, Lock, Sparkles,
} from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
import { usePlan } from '@/hooks/usePlan'

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    title: 'Open any diagram',
    desc: 'Go to My Diagrams and open an existing diagram, or create a new blank one.',
    icon: CheckCircle2,
  },
  {
    title: 'Flip the Interview Mode toggle',
    desc: 'Switch on Interview Mode in the top navigation bar of the editor.',
    icon: Timer,
  },
  {
    title: 'Set your timer & question',
    desc: 'Choose a duration — 30, 45, 60, 90 minutes, custom, or no limit — and name your design question.',
    icon: Clock,
  },
  {
    title: 'Design under the clock',
    desc: 'The timer runs live in the topbar. Pause anytime, jot down notes, or go fullscreen.',
    icon: Flame,
  },
  {
    title: 'End & review',
    desc: 'Click the stop button to save your session. Your time and diagram are recorded automatically.',
    icon: BarChart2,
  },
]

const FEATURES = [
  {
    icon: Clock,
    title: 'Flexible timers',
    desc: '30, 45, 60, or 90-minute presets. Set a custom duration or run with no limit at all.',
  },
  {
    icon: Pause,
    title: 'Pause & resume',
    desc: 'Life happens. Pause the clock mid-session and resume exactly where you left off.',
  },
  {
    icon: StickyNote,
    title: 'Session notes',
    desc: 'A dedicated side panel for jotting your thought process, trade-offs, and design decisions.',
  },
  {
    icon: Maximize2,
    title: 'Fullscreen focus',
    desc: 'One click to hide all chrome and enter pure drawing mode. Press Escape to exit.',
  },
  {
    icon: Flame,
    title: 'Daily streaks',
    desc: 'Practice every day to build a streak. Your streak and longest run are tracked automatically.',
  },
  {
    icon: BarChart2,
    title: 'Progress analytics',
    desc: 'See your total time, sessions completed, and activity calendar over the past year.',
  },
  {
    icon: StopCircle,
    title: 'Auto-save on exit',
    desc: 'When you end a session your canvas snapshot and notes are saved permanently.',
  },
  {
    icon: Infinity,
    title: 'Resume anytime',
    desc: 'Close the tab mid-session and come back later — the dashboard will let you pick up right where you left off.',
  },
]

const TIMER_OPTS = ['30 min', '45 min', '60 min', '90 min', 'Custom', 'No limit']

// ─── Motion helpers ───────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

// ─── Timer preview mock ───────────────────────────────────────────────────────

function TimerPreview() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-hairline-strong bg-paper-elevated px-3.5 py-2 shadow-sm">
      <div className="h-3.5 w-0.5 rounded-full bg-brand" />
      <span className="font-mono text-sm font-semibold tabular-nums text-brand">24:07</span>
      <div className="mx-0.5 h-3.5 w-px bg-hairline" />
      <button className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline/60 hover:text-ink">
        <Pause className="h-3 w-3" />
      </button>
      <button className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline/60 hover:text-ink">
        <StickyNote className="h-3 w-3" />
      </button>
      <button className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600">
        <StopCircle className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewModePage() {
  const { isFree } = usePlan()

  return (
    <AppShell>
      <div className="no-scrollbar h-full overflow-y-auto bg-paper">

        {/* ── Plan gate overlay ──────────────────────────────────────────────── */}
        {isFree && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
              <Lock className="h-8 w-8 text-brand" />
            </div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3 w-3" /> Pro Feature
            </span>
            <h2 className="mb-2 text-2xl font-bold text-ink">Interview Mode</h2>
            <p className="mb-2 max-w-sm text-sm text-ink-muted">
              Simulate real LLD interview pressure with timed sessions, notes, fullscreen mode, and automatic session tracking.
            </p>
            <p className="mb-8 text-sm text-ink-muted">
              <span className="font-medium text-ink">Pro</span>: 10 sessions/month &nbsp;·&nbsp; <span className="font-medium text-ink">Ultimate</span>: Unlimited + full analytics
            </p>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand/90 transition-colors shadow-lg shadow-brand/25"
            >
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {!isFree && (<>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-5 sm:px-8">
          <div>
            <h1 className="font-serif text-xl font-medium text-ink">Interview Mode</h1>
            <p className="mt-0.5 text-sm text-ink-faint">
              Timed practice sessions, right inside the editor.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-2.5 py-2 text-sm font-medium text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
          >
            <Timer size={15} />
            <span className="hidden sm:inline">Start practicing</span>
          </Link>
        </header>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-hairline bg-paper-elevated px-5 py-16 sm:px-8">
          {/* Faint dot texture, brand-tinted */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent)',
            }}
          />

          <motion.div
            className="relative mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-brand-tint px-4 py-1.5">
              <Timer className="h-3.5 w-3.5 text-brand" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">
                Interview Mode
              </span>
            </div>

            <h2 className="mb-4 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">
              Practice LLD like a real interview
            </h2>
            <p className="mb-9 text-base leading-relaxed text-ink-muted">
              Set a timer, design on the infinite canvas, and take notes as you go — then review your
              session history and build a daily streak. Everything you need to walk in ready.
            </p>

            {/* Live timer mockup */}
            <div className="mb-9 flex justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Topbar timer
                </span>
                <div className="h-4 w-px bg-hairline" />
                <TimerPreview />
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Open My Diagrams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>

        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">

          {/* ── How it works ────────────────────────────────────────────────── */}
          <section className="mb-16">
            <h3 className="mb-1 font-serif text-xl font-medium text-ink">How it works</h3>
            <p className="mb-9 text-sm text-ink-faint">Five steps from your dashboard to a completed session.</p>

            <div className="relative">
              <div className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-px bg-hairline" />

              <div className="space-y-8">
                {HOW_IT_WORKS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    className="relative flex gap-5"
                    {...fadeUp}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-paper-elevated shadow-sm">
                      <step.icon className="h-4 w-4 text-brand" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <span className="font-mono text-[10px] font-semibold text-ink-faint">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h4 className="text-sm font-medium text-ink">{step.title}</h4>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-muted">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Timer options ───────────────────────────────────────────────── */}
          <section className="mb-16">
            <h3 className="mb-1 font-serif text-xl font-medium text-ink">Timer options</h3>
            <p className="mb-5 text-sm text-ink-faint">
              Choose what fits your session — from a quick warm-up to a full mock interview.
            </p>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTS.map(label => (
                <div
                  key={label}
                  className="rounded-full border border-hairline-strong bg-paper-elevated px-4 py-2 text-sm font-medium text-ink shadow-sm"
                >
                  {label === 'No limit' ? (
                    <span className="flex items-center gap-1.5">
                      <Infinity className="h-3.5 w-3.5 text-ink-faint" /> {label}
                    </span>
                  ) : label}
                </div>
              ))}
            </div>
          </section>

          {/* ── Features grid ───────────────────────────────────────────────── */}
          <section className="mb-16">
            <h3 className="mb-1 font-serif text-xl font-medium text-ink">Everything included</h3>
            <p className="mb-6 text-sm text-ink-faint">Every feature you need for focused, trackable practice.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="group flex gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 shadow-sm transition-all duration-200 hover:border-hairline-strong hover:shadow-md"
                  {...fadeUp}
                  transition={{ duration: 0.3, delay: (i % 4) * 0.04 }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint transition-colors duration-200 group-hover:bg-brand/15">
                    <f.icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 text-sm font-medium text-ink">{f.title}</h4>
                    <p className="text-[13px] leading-relaxed text-ink-muted">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── CTA card ────────────────────────────────────────────────────── */}
          <section>
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-brand p-9 text-center shadow-sm"
              {...fadeUp}
              transition={{ duration: 0.4 }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Play className="h-5 w-5 fill-brand-foreground text-brand-foreground" />
                  </div>
                </div>
                <h3 className="mb-2 font-serif text-xl font-medium text-brand-foreground">Ready to start?</h3>
                <p className="mb-6 text-sm text-brand-foreground/75">
                  Open any diagram in the editor — the Interview Mode toggle is waiting in the top nav.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-foreground px-6 py-3 text-sm font-medium text-brand shadow-sm transition-all duration-150 hover:bg-brand-foreground/90 active:scale-[0.97]"
                >
                  Go to My Diagrams
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </section>

        </div>
        </>)} {/* end !isFree */}

      </div>
    </AppShell>
  )
}

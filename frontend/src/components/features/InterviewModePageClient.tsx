'use client'

import Link from 'next/link'
import { ArrowRight, Clock, Flame, BarChart2, StickyNote, Pause, CalendarDays, Timer, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { Reveal } from '@/components/features/Reveal'

// ─── Data ─────────────────────────────────────────────────────────────────────

// Form guide — true = practiced, false = missed
const FORM_GUIDE = [true, true, false, true, true, true, true, true, true, false, true, true, true, true]

const CAREER_STATS = [
  { icon: Flame,       stat: '12',   label: 'CURRENT FORM',   sub: 'day streak',          hot: true  },
  { icon: Timer,       stat: '48h',  label: 'ALL-TIME',        sub: 'total practice time', hot: false },
  { icon: Trophy,      stat: '34',   label: 'MATCHES PLAYED',  sub: 'sessions completed',  hot: false },
  { icon: CalendarDays,stat: '365d', label: 'ACTIVITY LOG',    sub: 'calendar coverage',   hot: false },
  { icon: TrendingUp,  stat: '↑12%', label: 'IMPROVEMENT',     sub: 'Ultimate only',       hot: false },
  { icon: Clock,       stat: '38:41',label: 'PERSONAL BEST',   sub: 'fastest session',     hot: false },
]

const PHASES = [
  {
    phase: 'PRE-MATCH', n: '01',
    title: 'Pick your duration and step in.',
    body: "Choose 30, 45, 60, 90 minutes — or practice without a limit. A blank canvas opens with the full editor. Your notes panel slides open beside it. The clock is ready. You're not.",
    visual: 'picker',
  },
  {
    phase: 'MATCH', n: '02',
    title: 'Design under the countdown.',
    body: "The timer is always visible. You design exactly like in a real interview — blank slate, full editor, all 23 design pattern skeletons available. Pause if you need to, but paused time doesn't count.",
    visual: 'timer',
  },
  {
    phase: 'POST-MATCH', n: '03',
    title: 'Session logged. Streak updated.',
    body: 'End the session and everything saves automatically — your streak increments, practice time accumulates, and your activity calendar marks the day. No manual tracking. No logging. The habit builds itself.',
    visual: 'recap',
  },
]

const FAQ = [
  {
    q: 'What happens when I start an Interview Mode session?',
    a: "You pick a duration (30, 45, 60, 90 minutes, or unlimited), and you're immediately dropped into a timed canvas session. The clock starts, your notes panel opens on the side, and you design just like you would in a real interview — blank canvas, countdown visible at all times.",
  },
  {
    q: 'What happens after the session ends?',
    a: "Your session is logged automatically — time practiced, date, and completion status are added to your activity calendar and analytics dashboard. The streak counter increments if it's a new day. Your canvas and notes are preserved so you can review or continue later.",
  },
  {
    q: 'Can I pause mid-session?',
    a: "Yes — the pause button stops the countdown and freezes your elapsed time. Resume when you're ready, and the clock picks up exactly where it left off. The paused time is not counted toward your session — so a 45-minute session always means 45 minutes of actual design work.",
  },
  {
    q: 'Is my streak broken if I miss a day?',
    a: "Yes, like any streak system — missing a day resets the current streak to zero. Your longest streak is always preserved in your stats, so you can aim to beat your personal best.",
  },
  {
    q: 'What plan do I need for Interview Mode?',
    a: "Interview Mode is a Pro and Ultimate feature. Pro includes sessions with basic score summaries. Ultimate includes unlimited sessions and full analytics — time per session, improvement trends, and a personal best tracker.",
  },
  {
    q: 'Can I use my own diagram inside Interview Mode?',
    a: "Interview Mode opens a fresh blank canvas by default, simulating a real interview. You can use any of the 23 design pattern skeletons from the command palette just like in the regular editor.",
  },
]

// ─── Phase visuals ────────────────────────────────────────────────────────────

function PickerVisual() {
  const durations = ['15 min', '30 min', '45 min', '60 min', '90 min', '∞ No limit']
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated p-5 shadow-sm">
      <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/55">
        Pick Session Duration
      </p>
      <div className="grid grid-cols-3 gap-2">
        {durations.map((d, i) => (
          <button
            key={d}
            className={cn(
              'rounded-xl border py-3 font-mono text-[11px] font-bold transition-colors',
              i === 2
                ? 'border-brand bg-brand text-white shadow-md shadow-brand/20'
                : 'border-hairline bg-paper text-ink-muted',
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-faint">Selected: 45 min</span>
        <button className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 font-mono text-[11px] font-bold text-white">
          Start Session →
        </button>
      </div>
    </div>
  )
}

function TimerVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper shadow-xl"
      style={{ boxShadow: '0 12px 40px rgba(35,78,63,0.10), 0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-5 py-2.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint">
          Active Session · Design a Parking Lot
        </span>
        <Flame size={13} className="text-amber-500" />
      </div>
      <div className="px-6 py-6 text-center">
        <p className="font-mono text-[clamp(3rem,8vw,4.5rem)] font-black leading-none tracking-tight text-brand">
          37:42
        </p>
        <p className="mt-2 font-mono text-[10px] text-ink-faint">of 45:00 · 7:18 remaining</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-hairline">
          <div className="h-full w-[84%] rounded-full bg-brand" />
        </div>
      </div>
      <div className="flex gap-2 border-t border-hairline px-5 py-3">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hairline bg-paper py-2.5 font-mono text-[11px] text-ink-muted">
          <Pause size={11} /> Pause
        </button>
        <button className="flex flex-1 items-center justify-center rounded-xl bg-brand py-2.5 font-mono text-[11px] font-bold text-white">
          End Session
        </button>
      </div>
    </div>
  )
}

function RecapVisual() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const done  = [true, true, true, true, true, true, false]
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/55">
          Session Complete
        </p>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
          +1 Streak
        </span>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-0 divide-x divide-hairline text-center">
        {[
          { val: '45:00', lbl: 'Time used' },
          { val: '🔥 13', lbl: 'Day streak' },
          { val: '35',    lbl: 'Sessions'   },
        ].map(s => (
          <div key={s.lbl} className="px-3 py-1">
            <p className="font-mono text-xl font-black text-ink">{s.val}</p>
            <p className="font-mono text-[9px] text-ink-faint">{s.lbl}</p>
          </div>
        ))}
      </div>
      {/* Mini weekly heatmap */}
      <p className="mb-1.5 font-mono text-[9px] text-ink-faint/50">This week</p>
      <div className="flex gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className={cn('h-7 w-full rounded', done[i] ? 'bg-brand/70' : 'bg-hairline')} />
            <span className="font-mono text-[8px] text-ink-faint/50">{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PHASE_VISUALS: Record<string, React.ReactNode> = {
  picker: <PickerVisual />,
  timer:  <TimerVisual />,
  recap:  <RecapVisual />,
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InterviewModePageClient() {
  return (
    <div className="overflow-hidden">

      {/* ════════════════════ SCOREBOARD STRIP ═══════════════════════════ */}
      <div className="border-b border-hairline bg-paper-elevated/80">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-hairline sm:grid-cols-4">
            {[
              { label: 'CANDIDATE', value: 'You',          live: false },
              { label: 'PROBLEM',   value: 'Parking Lot',  live: false },
              { label: 'SESSION',   value: '37:42',        live: false },
              { label: 'STATUS',    value: 'ACTIVE',       live: true  },
            ].map(s => (
              <div key={s.label} className="px-5 py-3">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.35em] text-ink-faint/45">
                  {s.label}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  {s.live && (
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  <p className={cn('font-mono text-[13px] font-bold', s.live ? 'text-emerald-600' : 'text-ink')}>
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════ HERO ════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-12 sm:px-8 sm:pt-16">
          <Reveal>
            <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">¶03</span>&nbsp;—&nbsp;Interview Mode
            </p>
            <h1 className="font-serif text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.05] tracking-tight text-ink">
              Practice like the clock{' '}
              <span className="text-brand">is always on.</span>{' '}
              Watch it add up.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-muted">
              Most candidates only ever practice untimed — then freeze when the clock starts
              in a real interview. Interview Mode puts a countdown on the canvas from day one,
              then tracks every session as a streak, an activity heatmap, and a practice-time
              graph so the habit builds itself.
            </p>

            {/* Form guide — sports result strip */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="mr-2 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/50">
                  Form
                </span>
                {FORM_GUIDE.map((practiced, i) => (
                  <span
                    key={i}
                    title={practiced ? 'Practiced' : 'Rest day'}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[9px] font-black',
                      practiced
                        ? 'bg-brand text-white'
                        : 'bg-hairline text-ink-faint/40',
                    )}
                  >
                    {practiced ? 'W' : '-'}
                  </span>
                ))}
                <span className="ml-2 font-mono text-[10px] text-brand">12-match unbeaten</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
              >
                Start your streak <ArrowRight size={14} />
              </Link>
              <Link
                href="/features/interview-questions"
                className="flex items-center gap-2 rounded-xl border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
              >
                Browse practice problems
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ STATS ═══════════════════════════════════════ */}
      <Reveal>
        <section className="border-b border-hairline bg-paper-elevated/60">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
              {[
                { value: '5',     label: 'timer presets'         },
                { value: '∞',     label: 'unlimited option'      },
                { value: '365',   label: 'day activity calendar' },
                { value: '1-tap', label: 'pause and resume'      },
              ].map(s => (
                <div key={s.label} className="px-6 py-8 text-center">
                  <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                  <p className="mt-1 font-mono text-[12px] text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ MATCH PHASES ════════════════════════════════ */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <div className="border-b border-hairline py-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
                <span className="text-gold">§01</span>&nbsp;—&nbsp;How a session works
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
                Three phases. From blank canvas to logged session.
              </h2>
            </div>
          </Reveal>
        </div>

        {PHASES.map((phase, i) => (
          <Reveal key={phase.phase} delay={i * 0.07}>
            <div className={cn(
              'relative border-b border-hairline py-14',
              i === 1 && 'bg-paper-elevated/30',
            )}>
              <div className="mx-auto max-w-5xl px-6 sm:px-8">
                <div className={cn(
                  'grid items-center gap-8 lg:grid-cols-2',
                  i === 1 && 'lg:grid-flow-dense',
                )}>
                  {/* Text side */}
                  <div className={i === 1 ? 'lg:col-start-2' : ''}>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1">
                      <span className="font-mono text-[8px] font-black uppercase tracking-[0.4em] text-ink-faint/50">
                        {phase.phase}
                      </span>
                      <span className="h-3 w-px bg-hairline" />
                      <span className="font-mono text-[8px] font-bold text-brand">{phase.n} of 03</span>
                    </div>
                    <h3 className="mb-3 font-serif text-[1.5rem] font-medium leading-snug text-ink">
                      {phase.title}
                    </h3>
                    <p className="text-[14px] leading-[1.85] text-ink-muted">{phase.body}</p>
                  </div>

                  {/* Visual side */}
                  <div className={i === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    {PHASE_VISUALS[phase.visual]}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ════════════════════ CAREER STATS ════════════════════════════════ */}
      <section className="border-b border-hairline py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§02</span>&nbsp;—&nbsp;Career stats
            </p>
            <h2 className="mb-3 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
              Analytics that show progress, not just activity.
            </h2>
            <p className="mb-10 max-w-xl text-[14px] leading-relaxed text-ink-muted">
              Tracking that you practiced is table stakes. Interview Mode goes further — it shows
              whether you&apos;re getting faster, where your weak patterns are, and how your
              personal bests improve over time.
            </p>
          </Reveal>

          {/* Scoreboard-style stats grid */}
          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-hairline">
              <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-3">
                {CAREER_STATS.map(({ icon: Icon, stat, label, sub, hot }, i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-6 text-center',
                      hot && 'bg-amber-50/40',
                    )}
                  >
                    <Icon size={15} className={hot ? 'text-amber-500' : 'text-brand'} />
                    <p className={cn('font-mono text-3xl font-black', hot ? 'text-amber-600' : 'text-ink')}>
                      {stat}
                    </p>
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-ink-faint/50">
                      {label}
                    </p>
                    <p className="text-[11px] text-ink-muted">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ WHY IT MATTERS ════════════════════════════ */}
      <Reveal>
        <section className="border-b border-hairline py-16">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§03</span>&nbsp;—&nbsp;Why timed practice matters
            </p>
            <h2 className="mb-5 font-serif text-[clamp(1.4rem,3vw,2rem)] font-medium text-ink">
              The difference between knowing and performing under pressure.
            </h2>
            <div className="max-w-2xl space-y-4 text-[15px] leading-[1.85] text-ink-muted">
              <p>
                Most engineers who fail LLD rounds know the design patterns. They&apos;ve studied Observer,
                Factory, and Strategy. They can describe composition vs aggregation. But when a countdown
                clock appears and an interviewer is watching, they freeze — because they&apos;ve only ever
                practiced in conditions with zero pressure.
              </p>
              <p>
                Interview Mode is designed to eliminate that gap. By practicing with a real timer, in the
                same tool you&apos;ll use under pressure, you build the procedural memory that lets you draw
                the design quickly and confidently when it counts. The streak system ensures that memory
                compounds day over day, not just in the week before the interview.
              </p>
              <p>
                Pair Interview Mode with the{' '}
                <Link href="/features/interview-questions" className="text-brand hover:underline">
                  100+ practice problems
                </Link>
                {' '}and{' '}
                <Link href="/features/revision-notes" className="text-brand hover:underline">
                  revision notes
                </Link>
                {' '}for a complete preparation workflow.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ TACTICS BOARD (session notes) ══════════════ */}
      <Reveal>
        <section className="border-b border-hairline bg-paper-elevated/40 py-14">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
                  <span className="text-gold">§04</span>&nbsp;—&nbsp;Tactics board
                </p>
                <h2 className="mb-4 font-serif text-[clamp(1.4rem,3vw,2rem)] font-medium text-ink">
                  A dedicated panel for your thought process.
                </h2>
                <p className="text-[14px] leading-[1.85] text-ink-muted">
                  In real LLD interviews, interviewers care as much about how you think as what
                  you design. The session notes panel gives you a dedicated place to write down
                  your trade-offs, assumptions, constraints, and design decisions as you go —
                  the on-screen equivalent of thinking out loud.
                </p>
                <p className="mt-4 text-[14px] leading-[1.85] text-ink-muted">
                  Notes are saved with the session and reviewable afterwards, so you can look
                  back at past sessions and track how your reasoning has evolved.
                </p>
              </div>

              {/* Tactics/notes mockup */}
              <div className="overflow-hidden rounded-2xl border border-hairline bg-paper p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-3">
                  <StickyNote size={13} className="text-brand" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
                    Session Notes · Parking Lot
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] leading-[1.9] text-ink-muted">
                  <p className="font-bold text-ink">Assumptions:</p>
                  <p className="pl-3">- Single building, multiple floors</p>
                  <p className="pl-3">- Support car, motorcycle, truck</p>
                  <p className="pl-3">- Hourly billing strategy (can extend)</p>
                  <p className="mt-2 font-bold text-ink">Design decisions:</p>
                  <p className="pl-3">- Using Strategy for fee calculation</p>
                  <p className="pl-3 text-brand">→ allows adding new pricing models later</p>
                  <p className="pl-3">- Level owns Spot (composition)</p>
                  <p className="mt-2 font-bold text-ink">Trade-offs:</p>
                  <p className="pl-3">- Not handling concurrent reservations yet</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2.5 flex-1 animate-pulse rounded bg-hairline" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ FAQ ════════════════════════════════════════ */}
      <FeatureFaq items={FAQ} />

      {/* ════════════════════ RELATED FEATURES ══════════════════════════ */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            Related features
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/features/interview-questions', label: '100+ LLD practice problems'                    },
              { href: '/features/revision-notes',      label: 'Revision notes — design patterns and OOP'     },
              { href: '/features/editor',              label: 'UML Editor — draw your designs'               },
              { href: '/features/collaboration',       label: 'Collaboration — mock interview with a partner' },
              { href: '/pricing',                      label: 'View Pro and Ultimate plans'                   },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-brand/30 hover:text-brand"
              >
                {l.label} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <FeatureCrossLinks exclude="/features/interview-mode" />
    </div>
  )
}

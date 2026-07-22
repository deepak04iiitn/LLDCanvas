import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, Flame, BarChart2, StickyNote, Pause, CalendarDays, Timer, Trophy, TrendingUp } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Interview Mode - Timed LLD Practice Sessions | LLDCanvas',
  description:
    'Practice Low-Level Design under real interview pressure with LLDCanvas Interview Mode. Timed sessions with a countdown clock, daily streaks, a 365-day activity calendar, and post-session analytics. Build the habit that gets you hired. Free for Pro and Ultimate users.',
  keywords: [
    'LLD interview practice', 'timed design interview', 'low level design timer',
    'interview preparation habit', 'system design practice sessions', 'LLD practice streak',
    'software interview prep', 'design interview simulation',
  ],
  alternates: { canonical: '/features/interview-mode' },
  openGraph: {
    title: 'Interview Mode - Timed LLD Practice - LLDCanvas',
    description: 'Timed practice sessions with daily streaks and analytics. Build the LLD habit that gets you hired.',
    type: 'website', url: '/features/interview-mode',
  },
}

const FAQ = [
  {
    q: 'What happens when I start an Interview Mode session?',
    a: 'You pick a duration (30, 45, 60, 90 minutes, or unlimited), and you\'re immediately dropped into a timed canvas session with a problem statement. The clock starts, your notes panel opens on the side, and you design just like you would in a real interview — blank canvas, countdown visible at all times.',
  },
  {
    q: 'What happens after the session ends?',
    a: 'Your session is logged automatically — time practiced, date, and completion status are added to your activity calendar and analytics dashboard. The streak counter increments if it\'s a new day. Your canvas and notes are preserved so you can review or continue later.',
  },
  {
    q: 'Can I pause mid-session?',
    a: 'Yes — the pause button stops the countdown and freezes your elapsed time. Resume when you\'re ready, and the clock picks up exactly where it left off. The paused time is not counted toward your session — so a 45-minute session always means 45 minutes of actual design work.',
  },
  {
    q: 'Is my streak broken if I miss a day?',
    a: 'Yes, like any streak system — missing a day resets the current streak to zero. Your longest streak is always preserved in your stats, so you can aim to beat your personal best.',
  },
  {
    q: 'What plan do I need for Interview Mode?',
    a: 'Interview Mode is a Pro and Ultimate feature. Pro includes 10 sessions per month with a basic score summary. Ultimate includes unlimited sessions and full analytics — time per session, improvement trends, and a personal best tracker.',
  },
  {
    q: 'Can I use my own diagram inside Interview Mode?',
    a: 'Interview Mode opens a fresh blank canvas by default, simulating a real interview. You can use any of the 23 design pattern skeletons from the command palette just like in the regular editor.',
  },
]

export default function InterviewModeFeaturePage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Interview Mode - Timed LLD Practice',
        url: 'https://lldcanvas.com/features/interview-mode',
        description: 'Timed practice sessions with streaks, activity calendar, and analytics for LLD interview preparation.',
      }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                <span className="text-gold">¶03</span> — Interview Mode
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Practice under{' '}
                <span className="text-brand">real pressure.</span>{' '}
                Watch it add up.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                Most candidates only ever practice untimed — then freeze when the clock
                starts in a real interview. Interview Mode puts a countdown on the canvas
                from day one, then tracks every session as a streak, an activity heatmap,
                and a practice-time graph so the habit builds itself.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Start your streak <ArrowRight size={15} />
                </Link>
                <Link
                  href="/features/interview-questions"
                  className="flex items-center gap-2 rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
                >
                  Browse practice problems
                </Link>
              </div>
            </div>

            {/* Right — Timer visual mockup */}
            <div className="flex flex-col gap-4">
              {/* Timer card */}
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Active Session</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">Design a Parking Lot System</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                    <Flame size={16} className="text-amber-500" />
                  </div>
                </div>
                {/* Big timer */}
                <div className="my-4 text-center">
                  <div className="font-mono text-5xl font-black tracking-tight text-brand">37:42</div>
                  <p className="mt-1 font-mono text-[11px] text-ink-faint">of 45:00 · 7:18 remaining</p>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-hairline">
                  <div className="h-full w-[84%] rounded-full bg-brand" />
                </div>
                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-hairline bg-paper py-2.5 text-xs font-medium text-ink-muted">
                    <Pause size={13} /> Pause
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-xs font-semibold text-brand-foreground">
                    End Session
                  </button>
                </div>
              </div>

              {/* Streak + stats mini */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-hairline bg-paper-elevated p-3 text-center">
                  <Flame size={16} className="mx-auto text-amber-500" />
                  <p className="mt-1 font-mono text-xl font-black text-ink">12</p>
                  <p className="font-mono text-[9px] text-ink-faint">day streak</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper-elevated p-3 text-center">
                  <Timer size={16} className="mx-auto text-brand" />
                  <p className="mt-1 font-mono text-xl font-black text-ink">48h</p>
                  <p className="font-mono text-[9px] text-ink-faint">total practice</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper-elevated p-3 text-center">
                  <Trophy size={16} className="mx-auto text-amber-400" />
                  <p className="mt-1 font-mono text-xl font-black text-ink">34</p>
                  <p className="font-mono text-[9px] text-ink-faint">sessions done</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-b border-hairline bg-paper-elevated/60">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: '5',     label: 'timer presets' },
              { value: '∞',     label: 'unlimited option' },
              { value: '365',   label: 'day activity calendar' },
              { value: '1-tap', label: 'pause & resume' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How a session works ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§1</span> — How it works
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          Four steps. From blank canvas to logged session.
        </h2>
        <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Interview Mode is designed to mirror the exact format of a real LLD interview — so
          when the real thing arrives, the pressure feels familiar, not foreign.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '01', title: 'Pick your duration', body: 'Choose 30, 45, 60, 90 minutes, or practice without a limit. All timers are full-screen visible.' },
            { n: '02', title: 'Design on the canvas', body: 'A blank canvas with the full editor — all nodes, patterns, and Draft Notation available. Just like a real interview.' },
            { n: '03', title: 'Take notes alongside', body: 'A dedicated notes panel for trade-offs, assumptions, and design decisions — the interviewer equivalent of "thinking out loud".' },
            { n: '04', title: 'Session logged automatically', body: 'End the session and your streak, practice time, and activity calendar update instantly — no manual tracking.' },
          ].map(step => (
            <div key={step.n} className="relative rounded-xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 font-mono text-sm font-bold text-brand">
                {step.n}
              </div>
              <p className="mb-1.5 text-sm font-semibold text-ink">{step.title}</p>
              <p className="text-[13px] leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's tracked ───────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§2</span> — What gets tracked
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
            Analytics that show progress, not just activity.
          </h2>
          <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Tracking that you practiced is table stakes. Interview Mode goes further — it shows
            whether you&apos;re getting faster, where your weak patterns are, and how your
            personal bests improve over time.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Flame, title: 'Daily streak',
                body: 'Current streak and longest streak. Practice every day to maintain it — miss one day and it resets, just like a real habit.',
              },
              {
                icon: CalendarDays, title: '365-day activity calendar',
                body: 'A GitHub-style heatmap of every session. See your consistency at a glance — which days you practiced and for how long.',
              },
              {
                icon: Clock, title: 'Total practice time',
                body: 'Cumulative hours practiced, broken down by week and month for Pro and Ultimate users.',
              },
              {
                icon: BarChart2, title: 'Sessions completed',
                body: 'Total session count, with a breakdown by duration bracket — how many 45-minute sessions vs 60-minute sessions.',
              },
              {
                icon: TrendingUp, title: 'Improvement trends',
                body: 'Ultimate only — see how your average time per problem evolves over weeks and months as you get faster.',
              },
              {
                icon: Trophy, title: 'Personal bests',
                body: 'Ultimate only — your fastest completion time for each problem category, updated after every relevant session.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <Icon size={14} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why timed practice matters ────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§3</span> — Why timed practice matters
        </p>
        <h2 className="mb-5 font-serif text-2xl font-medium text-ink">
          The difference between knowing and performing under pressure.
        </h2>
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-muted">
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
            <Link href="/features/interview-questions" className="text-brand hover:underline">100+ practice problems</Link>
            {' '}and{' '}
            <Link href="/features/revision-notes" className="text-brand hover:underline">revision notes</Link>
            {' '}for a complete preparation workflow.
          </p>
        </div>
      </section>

      {/* ── Session notes deep-dive ───────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper-elevated/40 py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                <span className="text-gold">§4</span> — Session notes
              </p>
              <h2 className="mb-4 font-serif text-2xl font-medium text-ink">
                A dedicated panel for your thought process.
              </h2>
              <p className="text-[15px] leading-relaxed text-ink-muted">
                In real LLD interviews, interviewers care as much about how you think as what
                you design. The session notes panel gives you a dedicated place to write down
                your trade-offs, assumptions, constraints, and design decisions as you go —
                the on-screen equivalent of &quot;thinking out loud.&quot;
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Notes are saved with the session and reviewable afterwards, so you can look back
                at past sessions and see how your reasoning has evolved.
              </p>
            </div>
            {/* Notes mockup */}
            <div className="rounded-2xl border border-hairline bg-paper p-5">
              <div className="mb-3 flex items-center gap-2">
                <StickyNote size={14} className="text-brand" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Session Notes</span>
              </div>
              <div className="space-y-2 font-mono text-[12px] leading-relaxed text-ink-muted">
                <p className="text-ink">Assumptions:</p>
                <p>- Single building, multiple floors</p>
                <p>- Support car, motorcycle, truck</p>
                <p>- Hourly billing strategy (can extend)</p>
                <p className="mt-2 text-ink">Design decisions:</p>
                <p>- Using Strategy for fee calculation</p>
                <p className="text-brand">  → allows adding new pricing models later</p>
                <p>- Level owns Spot (composition)</p>
                <p>- ParkingLot owns Level (composition)</p>
                <p className="mt-2 text-ink">Trade-offs:</p>
                <p>- Not handling concurrent reservations yet</p>
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-hairline" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureFaq items={FAQ} />

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/features/interview-questions', label: '100+ LLD practice problems' },
            { href: '/features/revision-notes',      label: 'Revision notes — design patterns and OOP' },
            { href: '/features/editor',              label: 'UML Editor — draw your designs' },
            { href: '/features/collaboration',       label: 'Collaboration — mock interview with a partner' },
            { href: '/pricing',                      label: 'View Pro and Ultimate plans' },
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

      <FeatureCrossLinks exclude="/features/interview-mode" />
    </div>
  )
}

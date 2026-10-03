'use client'

import Link from 'next/link'
import { ArrowRight, Zap, GitBranch, Ban, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONSTRAINTS = [
  {
    icon: Ban,
    label: 'No Undo',
    desc: 'Every choice is permanent. You live with what you decided.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
  },
  {
    icon: Zap,
    label: 'Live Pressure',
    desc: 'Resources drain in real time. Hesitation is a decision.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    icon: GitBranch,
    label: 'Branching Outcomes',
    desc: 'Each choice reshapes the system. No two runs are the same.',
    color: 'text-brand',
    bg: 'bg-brand-tint border-brand/20',
  },
  {
    icon: Shuffle,
    label: 'No Perfect Answer',
    desc: 'Every path has a cost. The goal is the best trade-off.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
  },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Choose your scenario',
    body: 'Pick a system and difficulty. Each scenario has a unique pressure profile, failure conditions, and decision tree.',
  },
  {
    n: '02',
    title: 'Make decisions under pressure',
    body: 'At each stage, choose how to handle the current pressure. Your resources and system health evolve based on your choices.',
  },
  {
    n: '03',
    title: 'Survive or fail — then learn',
    body: 'The run ends when your resources are exhausted or the system collapses. Review every decision and understand the trade-offs.',
  },
]

const SCENARIOS = [
  { label: 'Payment Gateway',   tags: ['Coupling', 'Retry storms'],    difficulty: 'Hard' },
  { label: 'Notification Fan-out', tags: ['Scaling', 'Backpressure'], difficulty: 'Medium' },
  { label: 'Auth Service',      tags: ['SPoF', 'Latency'],             difficulty: 'Easy' },
]

export default function LearnRoguelikePage() {
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-hairline px-6 pt-14 pb-0 sm:px-10">
        <div className="mx-auto max-w-4xl">

          {/* Kicker */}
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-5">
            007 ——— LLD Roguelike
          </p>

          {/* Headline */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between pb-10">
            <div className="min-w-0">
              <h1 className="font-serif text-[44px] sm:text-[54px] font-medium leading-[1.05] tracking-tight text-ink">
                Decisions are<br />
                <span className="text-ink-faint">permanent here.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                A live system under pressure. Limited resources. No undo button.
                Make real architectural decisions — and live with them.
              </p>
            </div>
            <Link
              href="/dashboard/learn/roguelike/problems"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink/80"
            >
              Browse Scenarios <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 constraints strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-hairline pt-8 pb-10">
            {CONSTRAINTS.map(c => {
              const Icon = c.icon
              return (
                <div key={c.label} className={cn('rounded-2xl border px-4 py-4', c.bg)}>
                  <Icon size={16} className={cn('mb-2.5', c.color)} />
                  <p className={cn('font-mono text-[11px] font-semibold tracking-wide', c.color)}>{c.label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-muted">{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10 space-y-20">

        {/* ── What it is ─────────────────────────────────────────────────── */}
        <section className="grid gap-10 sm:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">The premise</p>
          </div>
          <div className="space-y-4">
            <p className="text-[16px] leading-[1.85] text-ink">
              LLD Roguelike puts you in the role of the architect.
              A live system is under pressure and you must make a series
              of architectural decisions, each with real consequences.
            </p>
            <p className="text-[15px] leading-[1.85] text-ink-muted">
              Resources are limited. Time is short. Every choice matters —
              and there&apos;s no going back. The system evolves with your
              decisions, branching into outcomes you didn&apos;t expect.
            </p>
          </div>
        </section>

        {/* ── Sample scenarios ────────────────────────────────────────────── */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">Sample scenarios</p>
          <div className="divide-y divide-hairline border-y border-hairline">
            {SCENARIOS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 py-4">
                <span className="font-mono text-[11px] tabular-nums text-ink-faint w-6 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-serif text-[17px] text-ink flex-1">{s.label}</p>
                <div className="hidden sm:flex items-center gap-1.5">
                  {s.tags.map(t => (
                    <span key={t} className="rounded-full border border-hairline bg-paper-elevated px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                      {t}
                    </span>
                  ))}
                </div>
                <span className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold',
                  s.difficulty === 'Easy'   ? 'bg-emerald-100 text-emerald-700' :
                  s.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                              'bg-rose-100 text-rose-700',
                )}>
                  {s.difficulty}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-10">How it works</p>
          <div className="divide-y divide-hairline">
            {HOW_IT_WORKS.map(step => (
              <div key={step.n} className="flex items-start gap-8 py-8 first:pt-0 last:pb-0">
                <span className="shrink-0 font-mono text-[28px] font-bold leading-none tabular-nums text-hairline-strong select-none">
                  {step.n}
                </span>
                <div className="pt-1 min-w-0">
                  <h3 className="font-serif text-[17px] font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interview relevance ─────────────────────────────────────────── */}
        <section className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
          <div className="px-8 py-8 border-b border-hairline">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">
              Interview relevance
            </p>
            <blockquote className="font-serif text-[20px] leading-[1.6] text-ink">
              &ldquo;Senior interviewers don&apos;t want the perfect answer.
              They want to see how you think when there&apos;s no perfect answer.&rdquo;
            </blockquote>
          </div>
          <div className="px-8 py-5 bg-paper">
            <p className="text-[13px] leading-relaxed text-ink-muted">
              Roguelike trains the rarest interview skill: confident decision-making under
              ambiguity. Each run builds your instinct for architectural trade-offs that
              no flashcard deck can teach.
            </p>
          </div>
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-hairline pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-[24px] font-medium text-ink">Ready to run?</p>
            <p className="mt-1 text-[13px] text-ink-muted">Choose a scenario. There&apos;s no undo.</p>
          </div>
          <Link
            href="/dashboard/learn/roguelike/problems"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink/80"
          >
            Browse Scenarios <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const CONSTRAINTS = [
  { label: 'No Undo',            desc: 'Every choice is permanent' },
  { label: 'Live Pressure',      desc: 'Resources drain in real time' },
  { label: 'Branching Outcomes', desc: 'Your decisions shape the run' },
  { label: 'No Perfect Answer',  desc: 'Trade-offs, not solutions' },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Choose your scenario',
    body: 'Pick a system and difficulty. Each scenario has a unique pressure profile and decision tree.',
  },
  {
    n: '02',
    title: 'Make decisions under pressure',
    body: 'At each stage, choose how to handle the current pressure. Your resources and system health evolve based on your choices.',
  },
  {
    n: '03',
    title: 'Survive or fail',
    body: 'The run ends when your resources are exhausted or the system collapses. Review your decisions and learn from them.',
  },
]

export default function LearnRoguelikePage() {
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-hairline px-6 pb-10 pt-10 sm:px-10">
        <div className="mx-auto max-w-4xl">

          {/* Eyebrow */}
          <p className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Learn
          </p>

          {/* Title + CTA */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-serif text-[38px] font-medium leading-none tracking-tight text-ink sm:text-[46px]">
                LLD Roguelike
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                Make real architectural decisions under pressure — no undo button
              </p>
            </div>
            <Link
              href="/learn/roguelike/problems"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Browse Scenarios
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Constraint chips */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CONSTRAINTS.map(c => (
              <div
                key={c.label}
                className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3"
              >
                <p className="font-mono text-[11px] font-semibold text-ink">{c.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl space-y-16 px-6 py-14 sm:px-10">

        {/* Description */}
        <p className="max-w-2xl text-[16px] leading-[1.9] text-ink">
          LLD Roguelike puts you in the role of the architect. A live system is under pressure
          and you must make a series of architectural decisions, each with real consequences.
          Resources are limited. Time is short. Every choice matters — and there&apos;s no going back.
        </p>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section>
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            How it works
          </p>
          <div className="divide-y divide-hairline">
            {HOW_IT_WORKS.map(step => (
              <div key={step.n} className="flex items-start gap-8 py-7 first:pt-0 last:pb-0">
                <span className="shrink-0 select-none font-mono text-[32px] font-bold leading-none tabular-nums text-hairline-strong">
                  {step.n}
                </span>
                <div className="pt-1">
                  <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interview relevance ───────────────────────────────────────────── */}
        <section>
          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Interview relevance
          </p>
          <div className="flex gap-5">
            <div className="w-px shrink-0 self-stretch rounded-full bg-brand/30" />
            <p className="text-[14px] leading-[1.9] text-ink">
              Roguelike trains the rarest interview skill: confident decision-making under
              ambiguity. Senior interviewers don&apos;t want the perfect answer — they want to see
              how you think when there&apos;s no perfect answer. Each run builds your instinct for
              architectural trade-offs.
            </p>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-hairline pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-[22px] font-medium text-ink">Ready to run?</p>
            <p className="mt-1 text-[13px] text-ink-muted">Choose a scenario. There&apos;s no undo.</p>
          </div>
          <Link
            href="/learn/roguelike/problems"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse Scenarios
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

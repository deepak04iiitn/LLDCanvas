'use client'

import Link from 'next/link'
import { ArrowRight, Gamepad2, Users } from 'lucide-react'

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Choose your scenario',
    description:
      'Pick a system and difficulty. Each scenario has a unique pressure profile and decision tree.',
  },
  {
    step: 2,
    title: 'Make decisions under pressure',
    description:
      'At each stage, choose how to handle the current pressure. Your resources and system health evolve based on your choices.',
  },
  {
    step: 3,
    title: 'Survive or fail',
    description:
      'The run ends when your resources are exhausted or the system collapses. Review your decisions and learn from them.',
  },
]

export default function LearnRoguelikePage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-hairline/60 bg-linear-to-b from-brand-tint/35 to-paper px-6 pb-10 pt-10">
        <div className="mx-auto max-w-5xl">
          {/* Title row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
              <Gamepad2 size={26} className="text-brand" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                Learn
              </p>
              <h1 className="mb-1.5 font-serif text-3xl font-medium leading-tight text-ink">
                LLD Roguelike
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                Make real architectural decisions under pressure — no undo button
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 max-w-3xl text-[15px] leading-[1.8] text-ink">
            LLD Roguelike puts you in the role of the architect. A live system is under pressure
            and you must make a series of architectural decisions, each with real consequences.
            Resources are limited. Time is short. Every choice matters — and there&apos;s no going
            back.
          </p>

          {/* How it works */}
          <div className="mt-8">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink">How it works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS.map(step => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-hairline bg-paper-elevated p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[12px] font-bold text-white">
                      {step.step}
                    </div>
                    <h3 className="text-[14px] font-semibold leading-tight text-ink">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interview relevance */}
          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand-tint/20 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
                <Users size={14} className="text-brand" />
              </div>
              <h2 className="font-serif text-base font-medium text-ink">Interview relevance</h2>
            </div>
            <p className="text-[13px] leading-[1.75] text-ink">
              Roguelike trains the rarest interview skill: confident decision-making under
              ambiguity. Senior interviewers don&apos;t want the perfect answer — they want to see
              how you think when there&apos;s no perfect answer. Each run builds your instinct for
              architectural trade-offs.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/learn/roguelike/problems"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity group"
            >
              Browse Scenarios
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

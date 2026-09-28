'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Read the broken code',
    body: 'Study an implementation that compiles but has structural or logical errors.',
  },
  {
    n: '02',
    title: 'Identify the bug',
    body: 'Find the root cause — wrong pattern, broken abstraction, or misapplied principle.',
  },
  {
    n: '03',
    title: 'Fix and explain',
    body: 'Submit the corrected code and articulate why the original was wrong.',
  },
]

const SKILLS = [
  {
    label: 'Code-level pattern recognition',
    body: 'Spot broken or misapplied design patterns in real code.',
  },
  {
    label: 'Root cause analysis',
    body: 'Diagnose the structural reason behind a code-level bug.',
  },
  {
    label: 'Implementation review',
    body: 'Evaluate whether code correctly implements its stated design intent.',
  },
  {
    label: 'Fix articulation',
    body: 'Explain your fix clearly — the interviewer is always listening.',
  },
]

const SCENARIOS = [
  'Broken Singleton with thread safety issue',
  'Observer pattern with memory leaks',
  'Factory method that violates OCP',
  'Strategy pattern with leaking implementation details',
]

export default function CodeBugLabPage() {
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-hairline px-6 pb-10 pt-10 sm:px-10">
        <div className="mx-auto max-w-4xl">

          {/* Eyebrow */}
          <p className="mb-6 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Learn
          </p>

          {/* Title + CTA row */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-serif text-[38px] font-medium leading-none tracking-tight text-ink sm:text-[46px]">
                Code Bug Lab
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                Hunt bugs in real LLD implementations and sharpen your code analysis skills
              </p>
            </div>

            <Link
              href="/learn/debugger/problems"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Explore Problems
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl space-y-16 px-6 py-14 sm:px-10">

        {/* Description */}
        <p className="max-w-2xl text-[16px] leading-[1.9] text-ink">
          Each challenge gives you a broken implementation of a design pattern or LLD concept.
          The code compiles but has logical errors, wrong abstractions, or misapplied patterns.
          Find the bug, understand why it&apos;s wrong, and fix it. These are exactly the
          code-review questions interviewers ask.
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

        {/* ── Skills + Interview relevance ──────────────────────────────────── */}
        <div className="grid gap-14 lg:grid-cols-2">

          {/* Skills */}
          <section>
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              Skills you&apos;ll build
            </p>
            <ul className="space-y-5">
              {SKILLS.map(skill => (
                <li key={skill.label} className="flex gap-4">
                  <span className="mt-0.75 shrink-0 text-[13px] leading-none text-ink-faint">—</span>
                  <div>
                    <p className="text-[14px] font-medium text-ink">{skill.label}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{skill.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Interview relevance */}
          <section>
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              Interview relevance
            </p>
            <div className="flex gap-5">
              <div className="w-px shrink-0 self-stretch rounded-full bg-brand/30" />
              <p className="text-[14px] leading-[1.9] text-ink">
                Code review is a standard interview component at many companies.
                &ldquo;Here&apos;s an implementation of Observer pattern — what&apos;s wrong?&rdquo;
                is a question that directly tests whether you understand both the pattern and its
                correct implementation. Code Bug Lab trains this exact skill.
              </p>
            </div>
          </section>
        </div>

        {/* ── What you'll practice — terminal panel ────────────────────────── */}
        <section>
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            What you&apos;ll practice
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141922]">
            <div className="border-b border-white/5 px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
            </div>
            <div className="px-5 py-5">
              {SCENARIOS.map((s, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5">
                  <span className="mt-px shrink-0 font-mono text-[11px] text-emerald-400/60">›</span>
                  <p className="font-mono text-[12.5px] leading-relaxed text-emerald-100/75">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-hairline pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-[22px] font-medium text-ink">Ready to practice?</p>
            <p className="mt-1 text-[13px] text-ink-muted">Pick a problem and start solving.</p>
          </div>
          <Link
            href="/learn/debugger/problems"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Explore Problems
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

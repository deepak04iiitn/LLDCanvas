'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Interactive scenario preview ──────────────────────────────────────────────
const PATTERNS = [
  { id: 'factory',   label: 'Factory Method' },
  { id: 'strategy',  label: 'Strategy',       correct: true },
  { id: 'template',  label: 'Template Method' },
  { id: 'observer',  label: 'Observer' },
]

const CODE = `interface PricingStrategy {
  calculate(ride: Ride): Money;
}

class SurgePricing implements PricingStrategy {
  calculate(ride: Ride): Money { … }
}

class FlatRatePricing implements PricingStrategy {
  calculate(ride: Ride): Money { … }
}

class RideService {
  constructor(
    private pricing: PricingStrategy
  ) {}

  getPrice(ride: Ride) {
    return this.pricing.calculate(ride);
  }
}`

function ScenarioPreview() {
  const [chosen, setChosen] = useState<string | null>(null)
  const revealed = chosen !== null

  return (
    <div className="rounded-2xl border border-hairline bg-paper shadow-sm overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3 bg-paper-elevated">
        <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Pattern Detective · Scenario</span>
      </div>

      {/* Code block */}
      <div className="bg-[#1C1E26] px-5 py-4 overflow-x-auto">
        <pre className="font-mono text-[11.5px] leading-relaxed text-[#CDD6F4] whitespace-pre">{CODE}</pre>
      </div>

      {/* Question */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[13px] font-semibold text-ink mb-3">Which design pattern is being used?</p>
        <div className="grid grid-cols-2 gap-2">
          {PATTERNS.map(p => {
            const isChosen  = chosen === p.id
            const isCorrect = revealed && p.correct
            const isWrong   = revealed && isChosen && !p.correct
            return (
              <button
                key={p.id}
                onClick={() => !revealed && setChosen(p.id)}
                disabled={revealed}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-left text-[12px] font-medium transition-all',
                  !revealed && 'border-hairline hover:border-brand/40 hover:bg-brand-tint/15 cursor-pointer text-ink-muted',
                  isCorrect && 'border-brand/30 bg-brand-tint/30 text-ink',
                  isWrong   && 'border-red-200 bg-red-50/60 text-ink-muted line-through',
                  revealed && !isCorrect && !isWrong && 'border-hairline opacity-40 text-ink-faint',
                )}
              >
                <span className="flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 size={12} className="text-brand shrink-0" /> :
                   isWrong   ? <span className="text-red-400 text-[10px] shrink-0">✕</span> :
                   <Circle size={12} className="text-hairline-strong shrink-0" />}
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="mt-3 mb-3 rounded-xl border border-brand/20 bg-brand-tint/15 px-4 py-3">
            <p className="text-[11.5px] text-ink leading-relaxed">
              <span className="font-semibold text-brand">Strategy: </span>
              The <code className="font-mono text-[10.5px] bg-brand-tint/40 px-1 rounded">PricingStrategy</code> interface is injected into <code className="font-mono text-[10.5px] bg-brand-tint/40 px-1 rounded">RideService</code>, making the algorithm swappable at runtime without changing the client.
            </p>
          </div>
        )}
        {!revealed && (
          <p className="mt-2 mb-3 text-center text-[10px] text-ink-faint">← tap a pattern to reveal</p>
        )}
      </div>
    </div>
  )
}

// ── Skills ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { label: 'Pattern recognition',           desc: 'Identify GoF and architectural patterns on sight' },
  { label: 'Pattern justification',          desc: 'Explain why a pattern fits a specific scenario' },
  { label: 'Alternative pattern reasoning',  desc: 'Compare patterns and articulate trade-offs' },
  { label: 'Pattern vocabulary',             desc: 'Communicate clearly using standard terminology' },
]

const STEPS = [
  { n: '01', title: 'Study the scenario',     body: 'Read the code snippet, UML fragment, or system description. Look for structural signals — what role does each class play?' },
  { n: '02', title: 'Identify the pattern',   body: 'Select the design pattern you recognise and explain your reasoning. There are always plausible alternatives to consider.' },
  { n: '03', title: 'Understand alternatives', body: 'Review which patterns were close alternatives and why this one was the correct fit. This is where the real learning happens.' },
]

const EXAMPLES = [
  'Identify the pattern in a notification dispatch system',
  'Spot Strategy vs Template Method in a payment processor',
  'Recognise Facade in a complex API gateway',
  'Detect Decorator vs inheritance in a file processing pipeline',
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PatternDetectivePage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper relative">

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.3]"
        style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative z-10">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

            {/* Left: editorial copy */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand mb-6">Pattern Detective</p>

              <h1 className="font-serif font-medium tracking-tight leading-[0.9] mb-8">
                <span className="block text-[40px] sm:text-[52px] text-ink">Read the code.</span>
                <span className="block text-[40px] sm:text-[52px] text-brand">Name the pattern.</span>
              </h1>

              <p className="text-[15px] text-ink-muted leading-relaxed max-w-sm mb-10">
                Each challenge shows a real-world scenario — code, UML, or a system sketch.
                Your job: recognise the pattern, justify it, and understand why the alternatives don't quite fit.
              </p>

              {/* Stats vertical stack */}
              <div className="flex flex-col gap-0 mb-10 border-l-2 border-brand/20 pl-5">
                <div className="py-3 border-b border-hairline">
                  <p className="font-mono text-[28px] font-bold text-ink leading-none">20+</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">real-world scenarios to crack</p>
                </div>
                <div className="py-3 border-b border-hairline">
                  <p className="font-mono text-[28px] font-bold text-ink leading-none">23</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">GoF + architectural patterns covered</p>
                </div>
                <div className="py-3">
                  <p className="font-mono text-[28px] font-bold text-ink leading-none">3</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">steps from scenario to mastery</p>
                </div>
              </div>

              <Link
                href="/learn/detective/problems"
                className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-6 py-3.5 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity group"
              >
                Explore Problems
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right: interactive preview */}
            <div className="w-full lg:w-md shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <Circle size={7} className="fill-brand text-brand" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Live preview — try it</span>
              </div>
              <ScenarioPreview />
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── Skills ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="sm:w-40 shrink-0 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint leading-tight">
                Skills<br />you'll build
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-5">
              {SKILLS.map(({ label, desc }) => (
                <div key={label}>
                  <p className="text-[13px] font-semibold text-ink leading-tight">{label}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="sm:w-40 shrink-0 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint leading-tight">
                How<br />it works
              </p>
            </div>
            <div className="flex-1 flex flex-col divide-y divide-hairline">
              {STEPS.map(step => (
                <div key={step.n} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                  <p className="font-serif text-[32px] font-medium text-brand/15 leading-none pt-0.5 w-10 shrink-0 select-none">
                    {step.n}
                  </p>
                  <div>
                    <p className="text-[14px] font-semibold text-ink mb-1">{step.title}</p>
                    <p className="text-[13px] text-ink-muted leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── What you'll practice ────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="sm:w-40 shrink-0 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint leading-tight">
                What you'll<br />practice
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-3">
              {EXAMPLES.map((ex, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  <span className="font-mono text-[10px] text-brand/50 pt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-[13px] text-ink leading-snug">{ex}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── Pull-quote CTA ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="sm:w-40 shrink-0" />
            <blockquote className="flex-1">
              <p className="font-serif text-[22px] sm:text-[26px] font-medium text-ink leading-snug max-w-2xl">
                &ldquo;Pattern recognition isn't memorisation — it's seeing structure where others see noise.&rdquo;
              </p>
              <p className="mt-4 text-[12px] text-ink-faint font-mono uppercase tracking-widest">
                — LLDCanvas methodology
              </p>
              <Link
                href="/learn/detective/problems"
                className="mt-8 inline-flex items-center gap-2 text-brand text-[14px] font-semibold group"
              >
                Start detecting patterns
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </blockquote>
          </div>
        </section>

      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const SAMPLES = [
  'Scale a monolith with $50k engineering budget',
  'Improve a payment service under tight time constraints',
  'Harden a messaging system against failure modes',
  'Optimise a search service with limited infrastructure spend',
  'Modernise an e-commerce checkout under a sprint budget',
  'Reduce p99 latency with three engineering weeks',
]

export default function BudgetOverviewPage() {
  return (
    <div className="min-h-full bg-paper">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="border-b border-hairline px-6 py-14 sm:px-12 sm:py-20 max-w-5xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-6">
          005 ——— Architecture Budget
        </p>
        <h1 className="font-serif text-[42px] sm:text-[56px] leading-[1.05] text-ink tracking-tight">
          Budget is finite.<br />
          <span className="text-ink/40">Decisions aren&apos;t.</span>
        </h1>
        <p className="mt-6 text-[15px] text-ink-muted leading-relaxed max-w-lg">
          You have a fixed engineering budget and a system under pressure. Choose which
          architectural investments to make — and be ready to explain exactly why.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/design-studio/budget/problems"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper hover:bg-ink/80 transition-all active:scale-[0.98]">
            Browse problems <ArrowRight size={13} />
          </Link>
          <Link href="/design-studio/budget/problems"
            className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-hairline transition-all">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            View problems
          </Link>
        </div>
      </section>

      {/* ── Core concept ───────────────────────────────────────────── */}
      <section className="border-b border-hairline px-6 py-14 sm:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-16 items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-4">The hard part</p>
            <h2 className="font-serif text-[26px] text-ink leading-snug">
              Choosing one investment means<br />not choosing another.
            </h2>
            <p className="mt-4 text-[13px] text-ink-muted leading-relaxed">
              Most engineers can list improvements to a system. Very few can rank them under a real budget,
              defend their priorities, and articulate the opportunity cost of what they left behind.
            </p>
            <p className="mt-3 text-[13px] text-ink-muted leading-relaxed">
              That&apos;s the skill this mode trains — not knowledge of patterns, but the judgment to allocate
              limited engineering time to the investments that matter most for the specific pressure you&apos;re under.
            </p>
          </div>

          {/* Investment portfolio visual */}
          <div className="rounded-2xl border border-hairline overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline bg-paper-elevated">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Engineering budget</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="font-mono text-[22px] font-semibold text-ink">$50,000</span>
                <span className="font-mono text-[11px] text-ink-muted mb-1">allocated below</span>
              </div>
            </div>
            <div className="divide-y divide-hairline">
              {[
                { name: 'Read replica + caching layer', cost: 18000, selected: true,  tag: 'High ROI' },
                { name: 'Circuit breaker on payment svc', cost: 12000, selected: true,  tag: 'Risk' },
                { name: 'Database sharding',             cost: 32000, selected: false, tag: 'Over budget' },
                { name: 'Event sourcing refactor',       cost: 25000, selected: false, tag: 'Deferred' },
                { name: 'Rate limiting at API gateway',  cost: 8000,  selected: true,  tag: 'Quick win' },
              ].map(inv => (
                <div key={inv.name} className={`flex items-center gap-3 px-5 py-3 ${inv.selected ? 'bg-paper' : 'opacity-40'}`}>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${inv.selected ? 'bg-amber-400' : 'bg-ink-faint/30'}`} />
                  <p className={`flex-1 min-w-0 text-[12px] leading-snug ${inv.selected ? 'text-ink' : 'text-ink-muted line-through'}`}>
                    {inv.name}
                  </p>
                  <span className="font-mono text-[11px] text-ink-muted tabular-nums shrink-0">${(inv.cost / 1000).toFixed(0)}k</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${
                    inv.tag === 'High ROI'    ? 'bg-emerald-100 text-emerald-700' :
                    inv.tag === 'Risk'        ? 'bg-rose-100 text-rose-700' :
                    inv.tag === 'Quick win'   ? 'bg-sky-100 text-sky-700' :
                    'bg-hairline text-ink-faint'
                  }`}>{inv.tag}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-paper-elevated border-t border-hairline flex items-center justify-between">
              <p className="font-mono text-[10px] text-ink-faint">Spent</p>
              <p className="font-mono text-[13px] font-semibold text-ink tabular-nums">$38,000 / $50,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────────────── */}
      <section className="border-b border-hairline px-6 py-14 sm:px-12 max-w-5xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-10">How it works</p>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 border border-hairline rounded-2xl overflow-hidden">
          {[
            {
              n: '01', label: 'Receive',
              title: 'Budget + system under pressure',
              body: 'You get a fixed engineering budget and a real architectural scenario. The system has a specific bottleneck. Your job starts here.',
            },
            {
              n: '02', label: 'Evaluate',
              title: 'Browse and price investments',
              body: 'Explore available architectural improvements — each with a cost, a benefit, and a context-fit score. Not all investments are equal under every pressure.',
            },
            {
              n: '03', label: 'Justify',
              title: 'Submit your portfolio',
              body: 'Allocate your budget, then explain your rationale. What did you choose and why? What did you deliberately leave out, and at what cost?',
            },
          ].map((s, i) => (
            <div key={s.n} className={`px-6 py-6 bg-paper ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-hairline' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] text-ink-faint">{s.n}</span>
                <span className="h-px flex-1 bg-hairline" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">{s.label}</span>
              </div>
              <p className="font-serif text-[16px] text-ink mb-2">{s.title}</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <section className="border-b border-hairline px-6 py-14 sm:px-12 max-w-5xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-8">What you build</p>
        <div className="grid grid-cols-1 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden sm:grid-cols-2">
          {[
            { label: 'Trade-off reasoning',        body: 'Weigh the cost vs. benefit of architectural improvements under a specific pressure context.' },
            { label: 'Constraint-driven thinking', body: 'Adapt your strategy when the budget runs out — not all ideal solutions are affordable.' },
            { label: 'Investment articulation',    body: 'Explain why an architectural choice is worth its engineering cost in concrete terms.' },
            { label: 'Opportunity cost clarity',   body: 'Name what you deliberately skipped and why — a mark of senior-level architectural judgment.' },
          ].map(s => (
            <div key={s.label} className="bg-paper px-6 py-5">
              <p className="font-mono text-[11px] font-semibold text-ink mb-1.5">{s.label}</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interview angle ────────────────────────────────────────── */}
      <section className="border-b border-hairline px-6 py-14 sm:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_2fr] items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-3">Interview signal</p>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              The #1 differentiator between mid-level and senior engineers in system design interviews.
            </p>
          </div>
          <blockquote className="border-l-2 border-ink pl-6">
            <p className="font-serif text-[18px] text-ink leading-relaxed italic">
              &ldquo;If you could only make three improvements to this system, what would they be and why?&rdquo;
            </p>
            <p className="mt-4 text-[12px] text-ink-muted">
              This question — or a variant of it — appears in nearly every senior system design interview.
              Architecture Budget directly trains your ability to prioritise investments, justify your choices,
              and explain the trade-offs with precision.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── Sample problems ────────────────────────────────────────── */}
      <section className="px-6 py-14 sm:px-12 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Sample scenarios</p>
          <Link href="/design-studio/budget/problems" className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors">
            All problems →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden sm:grid-cols-2">
          {SAMPLES.map((s, i) => (
            <div key={i} className="bg-paper px-5 py-4 flex items-start gap-3">
              <span className="font-mono text-[10px] text-ink-faint mt-0.5 shrink-0 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-[13px] text-ink leading-snug">{s}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/design-studio/budget/problems"
            className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-hairline transition-all">
            Start a problem <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  )
}

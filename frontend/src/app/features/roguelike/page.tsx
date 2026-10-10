import type { Metadata } from 'next'
import Link from 'next/link'
import { Ban, Zap, GitBranch, Shuffle, BarChart2, RefreshCw, ArrowRight, Shield, Swords, Trophy } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Roguelike — Procedural LLD Runs Under Real Pressure | LLDCanvas',
  description: 'Procedurally generated LLD challenge runs with permanent decisions, live resource pressure, and branching outcomes. No two runs are the same. Built to expose the gap between knowing design theory and applying it under pressure.',
  keywords: ['gamified LLD practice', 'LLD challenge game', 'procedural LLD', 'LLD roguelike', 'interactive LLD practice', 'LLD design game', 'LLD under pressure', 'design decision making practice'],
  alternates: { canonical: '/features/roguelike' },
  openGraph: {
    title: 'Roguelike — Procedural LLD Runs Under Real Pressure | LLDCanvas',
    description: 'Procedurally generated LLD runs with permanent decisions, live resource pressure, and branching outcomes.',
    type: 'website',
    url: '/features/roguelike',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roguelike — Procedural LLD Runs Under Real Pressure | LLDCanvas',
    description: 'Procedurally generated LLD runs with permanent decisions, live resource pressure, and branching outcomes.',
  },
}

const FAQ = [
  { q: 'What makes it "roguelike"?', a: 'Roguelike games are characterised by procedural generation (different each run), permanent consequences (no save-scumming), and run-based progression (each run is self-contained). Roguelike on LLDCanvas uses exactly these mechanics for design practice: randomly generated scenarios, permanent decisions, and post-run evaluation rather than mid-run correction.' },
  { q: 'Can I repeat the same run?', a: 'Each run is procedurally generated, so no two runs are identical. However, you can start a new run as many times as you like — each will be a different scenario. There is no way to replay a specific past run exactly, which is intentional: the goal is to build adaptable instincts, not to memorise one scenario.' },
  { q: 'How long does one run take?', a: 'Most runs take 5–30 minutes, depending on the scenario complexity and how long you deliberate at each decision point. The post-run evaluation adds another 5–10 minutes if you read the full breakdown. This makes it suitable for a focused daily session.' },
  { q: 'What skills does the Roguelike mode build?', a: 'It specifically builds decision-making under uncertainty and constraint, the ability to reason about downstream consequences of design choices, and comfort with commitment — making a decision and living with it rather than endlessly deferring. These are the skills that separate engineers who perform well under interview pressure from those who freeze.' },
  { q: 'Is there a leaderboard?', a: 'Yes. Each run produces a score across extensibility, constraint efficiency, and correctness. Leaderboards are segmented by scenario type — you are compared against engineers who ran a comparable scenario, not an incomparable one.' },
  { q: 'What LLD concepts appear in runs?', a: 'Each run involves applying design patterns and SOLID principles to make decisions — you might choose between a Strategy and a simple conditional, or decide whether to introduce an Observer when requirements change. The concepts are applied in context, not tested in isolation, which is what makes the mode effective for interview prep.' },
]

export default function RoguelikePage() {
  return (
    <main>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Roguelike — Procedural LLD Runs Under Real Pressure', url: 'https://www.lldcanvas.in/features/roguelike', description: 'Procedurally generated LLD challenge runs with permanent decisions, live resource pressure, and branching outcomes.' }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' }, { '@type': 'ListItem', position: 2, name: 'Roguelike', item: 'https://www.lldcanvas.in/features/roguelike' }] }} />

      {/* ── Section 1: HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline bg-paper">
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(166,159,140,0.28) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 sm:py-12 lg:py-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">

            {/* Left column */}
            <div className="flex flex-col gap-6">
              {/* Mono eyebrow */}
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-gold uppercase">
                ROGUELIKE MODE · RUN #042
              </p>

              {/* H1 */}
              <h1 className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                Procedurally generated runs.{' '}
                <span className="text-red-600">No undo.</span>{' '}
                Real pressure.
              </h1>

              {/* Subtitle */}
              <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
                Each run is a new scenario, new constraints, and permanent decisions. Not a quiz — a pressure test.
              </p>

              {/* Run stats row */}
              <div className="flex flex-wrap gap-3">
                {[
                  { value: '18 min', label: 'avg run time' },
                  { value: '7', label: 'decisions made' },
                  { value: '43', label: 'extensibility score' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-0.5 rounded-lg border border-hairline bg-paper-elevated px-4 py-3 min-w-[100px]"
                  >
                    <span className="font-mono text-lg font-bold text-ink">{stat.value}</span>
                    <span className="font-mono text-[11px] text-ink-faint uppercase tracking-wide">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* NO UNDO badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-red-600" />
                <span className="font-mono text-sm font-bold text-red-700">DECISIONS ARE PERMANENT · NO UNDO</span>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4 pt-1">
                <Link
                  href="/dashboard/learn/roguelike"
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 font-mono text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover active:scale-95"
                >
                  Start a run <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="font-mono text-xs text-ink-faint">Procedurally generated · Scored at the end</span>
              </div>
            </div>

            {/* Right column — Decision stage map */}
            <div className="flex flex-col gap-3">
              {/* Stage header */}
              <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase mb-1">
                ACTIVE RUN — Notification System Design
              </p>

              {/* Stage 1 — completed */}
              <div className="rounded-lg border border-brand/25 bg-paper-elevated overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand/20 bg-brand-tint">
                  <span className="font-mono text-xs font-bold text-brand uppercase tracking-wide">STAGE 1 · Initial Architecture</span>
                  <span className="font-mono text-[10px] text-brand bg-paper-elevated border border-brand/30 rounded px-2 py-0.5">COMPLETE</span>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand flex-shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-ink-faint uppercase tracking-wide">Chosen</p>
                      <p className="font-mono text-sm text-ink mt-0.5">Layered Monolith — internal modules, deferred splitting</p>
                    </div>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-ink-muted pl-5">Downstream: microservice decomposition will require event contracts later</p>
                </div>
              </div>

              {/* Stage 2 — current */}
              <div className="rounded-lg border-2 border-brand bg-paper-elevated overflow-hidden ring-1 ring-brand/20">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand/20 bg-brand">
                  <span className="font-mono text-xs font-bold text-brand-foreground uppercase tracking-wide">STAGE 2 · Growth Requirement</span>
                  <span className="font-mono text-[10px] text-brand-foreground border border-brand-foreground/30 rounded px-2 py-0.5 animate-pulse">● ACTIVE</span>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-[11px] text-ink-faint mb-3 uppercase tracking-wide">Choose one · Decision is permanent</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'A', text: 'Add fan-out via message queue', risk: 'medium' },
                      { label: 'B', text: 'Direct HTTP callbacks to subscribers', risk: 'low' },
                      { label: 'C', text: 'Introduce event sourcing + replay', risk: 'high' },
                    ].map(opt => (
                      <div
                        key={opt.label}
                        className="flex items-center justify-between rounded border border-hairline bg-paper px-3 py-2 cursor-pointer hover:border-brand/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-brand bg-brand-tint rounded px-1.5 py-0.5">{opt.label}</span>
                          <span className="font-mono text-sm text-ink group-hover:text-brand transition-colors">{opt.text}</span>
                        </div>
                        <span className={`font-mono text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 ${opt.risk === 'high' ? 'text-red-700 bg-red-50' : opt.risk === 'medium' ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'}`}>
                          {opt.risk} risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage 3 — locked */}
              <div className="rounded-lg border border-hairline bg-paper-elevated overflow-hidden opacity-50">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline">
                  <span className="font-mono text-xs font-bold text-ink-muted uppercase tracking-wide">STAGE 3 · Scaling Crisis</span>
                  <span className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-2 py-0.5">🔒 LOCKED</span>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-[11px] text-ink-muted">Unlocked after Stage 2 decision · Scenario adapts to your choice</p>
                </div>
              </div>

              {/* Stage 4 — locked */}
              <div className="rounded-lg border border-hairline bg-paper-elevated overflow-hidden opacity-30">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-mono text-xs font-bold text-ink-muted uppercase tracking-wide">STAGE 4 · Post-Run Evaluation</span>
                  <span className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-2 py-0.5">🔒 LOCKED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: WHAT MAKES IT ROGUELIKE ──────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-16">
          <p className="mb-10 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase text-center">The three roguelike mechanics — applied to LLD</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Shuffle className="h-6 w-6" />,
                label: 'PROCEDURAL',
                accentText: 'text-blue-700',
                accentBg: 'bg-blue-50',
                borderClass: 'border-blue-200',
                desc: 'Every run generates a new scenario from a seeded system — different domain, different constraints, different scale. No two runs are the same.',
              },
              {
                icon: <Ban className="h-6 w-6" />,
                label: 'PERMANENT',
                accentText: 'text-red-700',
                accentBg: 'bg-red-50',
                borderClass: 'border-red-200',
                desc: 'Each decision you make is final. No backtracking, no undo, no "actually, let me try the other option." You live with your choices and see the consequences unfold.',
              },
              {
                icon: <BarChart2 className="h-6 w-6" />,
                label: 'EVALUATED',
                accentText: 'text-green-700',
                accentBg: 'bg-green-50',
                borderClass: 'border-green-200',
                desc: 'Runs end with a full breakdown — extensibility, constraint efficiency, correctness. Your score is compared across engineers who ran the same scenario type.',
              },
            ].map(item => (
              <div
                key={item.label}
                className={`rounded-xl border ${item.borderClass} bg-paper px-6 py-7 flex flex-col gap-4`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${item.accentBg} ${item.accentText}`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`font-mono text-sm font-bold mb-2 ${item.accentText}`}>{item.label}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: RUN ANATOMY ───────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-semibold text-ink">How a run unfolds.</h2>
          <p className="mb-12 text-base text-ink-muted max-w-xl">Three phases, one self-contained session. Start to finish in under 30 minutes.</p>

          <div className="relative">
            {/* Connector line — desktop only */}
            <div className="absolute left-[calc(16.66%-1px)] right-[calc(16.66%-1px)] top-6 hidden h-px bg-hairline lg:block" aria-hidden />

            <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
              {[
                {
                  step: '01',
                  heading: 'Start a run',
                  desc: 'A procedurally generated scenario drops you into a design problem — domain, scale, and constraints are all freshly seeded. No two runs share the same starting point.',
                  icon: <Shuffle className="h-5 w-5" />,
                  color: 'text-[#1F6FEB]',
                  bg: 'bg-[#E7F3FF]',
                },
                {
                  step: '02',
                  heading: 'Make design decisions',
                  desc: 'Navigate 5–10 decision points. Each choice is permanent — no going back. The scenario evolves based on what you picked earlier, so downstream stages adapt to your decisions.',
                  icon: <GitBranch className="h-5 w-5" />,
                  color: 'text-[#A6741C]',
                  bg: 'bg-[#FFF8ED]',
                },
                {
                  step: '03',
                  heading: 'See your outcome',
                  desc: 'The run ends with a full post-run evaluation — scored across extensibility, constraint efficiency, and design correctness. Compare your result to the leaderboard.',
                  icon: <Trophy className="h-5 w-5" />,
                  color: 'text-brand',
                  bg: 'bg-brand-tint',
                },
              ].map(item => (
                <div key={item.step} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`relative z-10 inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color} border border-hairline bg-paper`}>
                      {item.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-ink-faint">{item.step}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-ink">{item.heading}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: POST-RUN EVALUATION MOCKUP ───────────────────────── */}
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left: text */}
            <div className="lg:flex-1 flex flex-col gap-5">
              <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">After the run</p>
              <h2 className="font-serif text-3xl font-semibold text-ink leading-snug">Every decision has a score. Every score has a reason.</h2>
              <p className="text-base leading-relaxed text-ink-muted">
                After the final stage, you get a full breakdown of your choices — how each decision affected the overall design quality, and where the tradeoffs landed.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  'Extensibility score — how well your design handles the requirement changes introduced mid-run',
                  'Constraint efficiency — how wisely you used the budget, team, and time constraints',
                  'Correctness — structural validity of your choices against the problem domain',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: mockup card */}
            <div className="lg:flex-1 w-full max-w-lg mx-auto lg:mx-0">
              <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-sm">
                {/* Header */}
                <div className="border-b border-brand/20 bg-brand px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#7EC8A4] uppercase mb-1">RUN COMPLETE</p>
                    <p className="font-mono text-sm text-brand-foreground font-semibold">Notification System Design</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-mono text-xs text-brand-foreground/60">Overall</span>
                    <span className="font-mono text-2xl font-bold text-gold">77</span>
                    <span className="font-mono text-[10px] text-brand-foreground/60">/ 100</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-5 py-5 flex flex-col gap-5">
                  {[
                    { label: 'Extensibility', value: 80, color: '#3FB950', bg: '#1A3525' },
                    { label: 'Constraint Efficiency', value: 60, color: '#E3B341', bg: '#2D2510' },
                    { label: 'Correctness', value: 92, color: '#58A6FF', bg: '#0D1B2E' },
                  ].map(metric => (
                    <div key={metric.label} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-ink-muted">{metric.label}</span>
                        <span className="font-mono text-sm font-bold text-ink">{metric.value}<span className="text-ink-faint font-normal">/100</span></span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#F0EDE4] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${metric.value}%`, background: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-hairline bg-paper px-5 py-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-muted">Run #042 · 22 min</span>
                  <button className="font-mono text-xs font-semibold text-brand flex items-center gap-1 hover:underline">
                    <Trophy className="h-3.5 w-3.5" /> Compare to leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: FEATURE CARDS ─────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">What you get</p>
          <h2 className="mb-10 font-serif text-3xl font-semibold text-ink">Built for pressure, scored for depth.</h2>

          <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
            {[
              {
                icon: <Ban className="h-5 w-5" />,
                heading: 'No undo, no safety net',
                desc: 'Every choice commits immediately. The moment you pick an option, the scenario evolves based on it. No back button, no "actually…" — exactly like an interview.',
              },
              {
                icon: <Zap className="h-5 w-5" />,
                heading: 'Live resource pressure',
                desc: 'Runs introduce budget caps, team size constraints, and timeline pressure mid-run. Your design has to hold up not just in theory, but under the constraints given.',
              },
              {
                icon: <GitBranch className="h-5 w-5" />,
                heading: 'Branching outcomes',
                desc: 'Your early decisions shape what scenarios appear later. Choose a tightly-coupled architecture in Stage 1 and you will feel it in Stage 4 when the requirements change.',
              },
              {
                icon: <Shuffle className="h-5 w-5" />,
                heading: 'New scenario every run',
                desc: 'Procedural generation means you cannot memorise your way through. Each run tests adaptability — the actual skill that separates interview-ready engineers.',
              },
              {
                icon: <BarChart2 className="h-5 w-5" />,
                heading: 'Post-run evaluation',
                desc: 'A scored breakdown covers extensibility, constraint efficiency, and correctness. Leaderboards are segmented by scenario type so comparisons are meaningful.',
              },
              {
                icon: <RefreshCw className="h-5 w-5" />,
                heading: 'Replayability as a feature',
                desc: 'Each new run is a different scenario. Replay is intentional — the goal is to build adaptable design instincts across a wide variety of problems, not to master one.',
              },
            ].map(feature => (
              <div
                key={feature.heading}
                className="flex flex-col gap-3 bg-paper-elevated p-6"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-[17px] font-semibold text-ink">{feature.heading}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: WHO IT'S FOR ──────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">Who it's for</p>
          <h2 className="mb-10 font-serif text-3xl font-semibold text-ink">Roguelike is not for everyone. It's for these four.</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                label: 'Interview candidates 1–3 months out',
                desc: 'You know the theory but freeze under real interview pressure. Roguelike puts you in that exact state repeatedly — so when the real thing arrives, it feels familiar.',
              },
              {
                icon: <Swords className="h-5 w-5" />,
                label: 'Engineers who second-guess everything',
                desc: 'If you find yourself indefinitely deferring design decisions, Roguelike forces commitment. You will learn that a committed imperfect decision outperforms paralysis every time.',
              },
              {
                icon: <Trophy className="h-5 w-5" />,
                label: 'Competitive learners who need stakes',
                desc: 'If you learn better when something is on the line, the leaderboard and the permanent-decision mechanic create stakes that other practice modes simply do not have.',
              },
              {
                icon: <RefreshCw className="h-5 w-5" />,
                label: 'Engineers building daily habits',
                desc: 'A Roguelike run fits in a focused 20-minute session. Because every run is different, the daily practice stays fresh — no two sessions are the same problem.',
              },
            ].map(item => (
              <div
                key={item.label}
                className="flex gap-4 rounded-xl border border-hairline bg-paper-elevated p-5"
              >
                <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  {item.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-[16px] font-semibold text-ink">{item.label}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="font-serif text-xl text-ink">Ready to see how you hold up under pressure?</p>
            <Link
              href="/dashboard/learn/roguelike"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-mono text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Start a run <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="font-mono text-xs text-ink-faint">Procedurally generated · No two runs alike · Scored at the end</p>
          </div>
        </div>
      </section>

      {/* ── Section 7: FAQ ───────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper">
        <FeatureFaq items={FAQ} />
      </section>

      {/* ── Section 8: Cross-links ───────────────────────────────────────── */}
      <FeatureCrossLinks exclude="/features/roguelike" />
    </main>
  )
}

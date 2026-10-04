import type { Metadata } from 'next'
import Link from 'next/link'
import { GitBranch, AlertTriangle, TrendingUp, BarChart2, Clock, ArrowRight, Scale, ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Evolution — Multi-Stage System Design Growth | LLDCanvas',
  description:
    'Start with a small clean design, then evolve it through multiple growth stages — scaling requirements, tech debt accumulation, and trade-off decisions. See how long-lived systems age and compound.',
  keywords: [
    'system evolution LLD',
    'evolve system design',
    'multi-stage design practice',
    'design trade-offs practice',
    'LLD system growth',
    'scale a design LLD',
    'long term design thinking',
    'LLD for senior engineers',
  ],
  alternates: { canonical: '/features/evolution' },
  openGraph: {
    title: 'Evolution — Multi-Stage System Design Growth | LLDCanvas',
    description:
      'Start small, evolve through growth stages, and see how your trade-off decisions compound over time.',
    type: 'website',
    url: '/features/evolution',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evolution — Multi-Stage System Design Growth | LLDCanvas',
    description:
      'Start small, evolve through growth stages, and see how your trade-off decisions compound over time.',
  },
}

const FAQ = [
  {
    q: 'What is a system evolution problem?',
    a: 'A system evolution problem shows you a system at an early stage and asks how it should change as it grows. Unlike a standard LLD problem which asks for an initial design, an evolution problem asks you to make a series of design decisions over time — each building on and constrained by the previous one. It is the interview format used to distinguish engineers who design for now from those who design for the future.',
  },
  {
    q: 'How many stages does an evolution scenario have?',
    a: 'Most scenarios have three to five stages. Three-stage scenarios are suitable for engineers earlier in their LLD prep journey; five-stage scenarios are used for senior and staff-level preparation. Each stage introduces a meaningful constraint — not a trivial extension — so the design must substantively change rather than just grow.',
  },
  {
    q: 'What concepts does Evolution test?',
    a: 'Evolution specifically tests: understanding of tech debt (what it is, when it is worth taking on, and how it compounds), scalability trade-offs (coupling for speed vs. abstraction for flexibility), extensibility (designing for future requirements you can anticipate), and the ability to reason about decisions that have downstream consequences rather than just local correctness.',
  },
  {
    q: 'Is Evolution harder than other Design Studio modes?',
    a: 'It is the most cognitively demanding mode because it requires holding the full history of design decisions in mind while making each new choice. Other modes test depth within a single moment; Evolution tests judgment across time. Most engineers find it significantly harder than standard LLD problems — which is exactly the point for senior preparation.',
  },
  {
    q: 'What trade-off types appear in Evolution scenarios?',
    a: 'Common trade-offs include: speed of delivery vs. design cleanliness, tight coupling (simpler now, harder to change later) vs. abstraction (more setup now, easier to extend later), monolith vs. decomposed services at a scaling inflection point, and synchronous vs. asynchronous communication as throughput requirements grow.',
  },
]

export default function EvolutionPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Evolution — Multi-Stage System Design Growth',
          url: 'https://www.lldcanvas.in/features/evolution',
          description:
            'Start with a small clean design, evolve it through multiple growth stages, and see how tech debt and trade-off decisions compound over time.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Features',
              item: 'https://www.lldcanvas.in/features',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Evolution',
              item: 'https://www.lldcanvas.in/features/evolution',
            },
          ],
        }}
      />

      {/* ─── Section 1: HERO ─── */}
      <section className="bg-[#FBF9F4] pt-8 pb-0">
        <div className="mx-auto max-w-4xl px-6 text-center">
          {/* Eyebrow */}
          <p
            className="font-mono text-xs font-semibold tracking-widest uppercase text-[#A6741C] mb-4"
            style={{ fontFamily: 'Geist Mono, monospace' }}
          >
            16 · EVOLUTION
          </p>

          {/* H1 */}
          <h1
            className="font-serif text-4xl sm:text-5xl text-[#201F1C] leading-tight mb-6"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Grow a design through multiple stages of scale.
          </h1>

          {/* Subtitle */}
          <p className="text-[#74705F] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Start with a small clean system, evolve it through growth stages — new requirements,
            tech debt accumulation, scaling decisions. See how trade-offs compound.
          </p>

          {/* CTA */}
          <Link
            href="/dashboard/design-studio/evolution"
            className="inline-flex items-center gap-2 bg-[#234E3F] text-white px-7 py-3 text-base font-semibold hover:bg-[#1c3f33] transition-colors rounded-none"
          >
            Start evolving →
          </Link>
        </div>

        {/* ─── 4-STAGE EVOLUTION STRIP ─── */}
        <div className="mt-14 px-6 pb-0 max-w-7xl mx-auto">
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-stretch gap-0 border border-[#E7E2D6] rounded-2xl overflow-hidden bg-white min-w-[800px]"
              role="img"
              aria-label="4-stage evolution strip showing system growth from clean monolith to complex distributed system"
            >

              {/* ── Stage 1: Launch ── */}
              <div className="flex-1 min-w-[200px] border-r border-[#E7E2D6] p-5 bg-white flex flex-col gap-4">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase text-[#A69F8C]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  STAGE 1 · LAUNCH
                </p>

                {/* Mini system diagram */}
                <div className="flex flex-col items-center gap-2 flex-1 justify-center py-3">
                  <div
                    className="bg-[#E7F0EB] border border-[#234E3F] text-[#234E3F] text-xs font-mono px-3 py-2 rounded text-center w-full max-w-[140px]"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    OrderService
                  </div>
                </div>

                {/* Tech debt bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-mono text-[9px] text-[#A69F8C] uppercase tracking-wider"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Tech Debt
                    </p>
                    <p
                      className="font-mono text-[9px] text-[#A69F8C]"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      10%
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7E2D6] rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>

                {/* Decision */}
                <p
                  className="text-[#74705F] text-xs leading-snug"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  "Monolithic to start"
                </p>
              </div>

              {/* ── Stage 2: Growth ── */}
              <div className="flex-1 min-w-[200px] border-r border-[#E7E2D6] p-5 bg-[#FAFAF8] flex flex-col gap-4">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase text-[#A69F8C]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  STAGE 2 · GROWTH
                </p>

                {/* Mini system diagram — 3 services */}
                <div className="flex flex-col items-center gap-1.5 flex-1 justify-center py-1">
                  <div
                    className="bg-[#E7F0EB] border border-[#234E3F] text-[#234E3F] text-[10px] font-mono px-2 py-1.5 rounded text-center w-full max-w-[140px]"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    OrderService
                  </div>
                  {/* Arrow */}
                  <div className="flex gap-4 items-center" aria-hidden="true">
                    <span className="text-[#A69F8C] text-xs">↙</span>
                    <span className="text-[#A69F8C] text-xs">↘</span>
                  </div>
                  <div className="flex gap-2 w-full max-w-[160px]">
                    <div
                      className="flex-1 bg-blue-50 border border-blue-300 text-blue-700 text-[9px] font-mono px-1.5 py-1 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Payment
                    </div>
                    <div
                      className="flex-1 bg-purple-50 border border-purple-300 text-purple-700 text-[9px] font-mono px-1.5 py-1 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Notify
                    </div>
                  </div>
                </div>

                {/* Tech debt bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-mono text-[9px] text-[#A69F8C] uppercase tracking-wider"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Tech Debt
                    </p>
                    <p
                      className="font-mono text-[9px] text-[#A69F8C]"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      30%
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7E2D6] rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>

                {/* Decision */}
                <p
                  className="text-[#74705F] text-xs leading-snug"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  "Extracted payment &amp; notifications"
                </p>
              </div>

              {/* ── Stage 3: Scale ── */}
              <div className="flex-1 min-w-[200px] border-r border-[#E7E2D6] p-5 bg-[#F8F6F2] flex flex-col gap-4">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase text-[#A69F8C]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  STAGE 3 · SCALE
                </p>

                {/* Mini system diagram — 5 services with coupling */}
                <div className="flex flex-col items-center gap-1 flex-1 justify-center py-1">
                  <div
                    className="bg-[#E7F0EB] border border-[#234E3F] text-[#234E3F] text-[9px] font-mono px-2 py-1 rounded text-center w-full max-w-[140px]"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    OrderService
                  </div>
                  <div className="flex gap-1.5 w-full max-w-[160px]" aria-hidden="true">
                    <span className="text-[#A69F8C] text-[9px] flex-1 text-center">↙</span>
                    <span className="text-[#A69F8C] text-[9px] flex-1 text-center">↓</span>
                    <span className="text-[#A69F8C] text-[9px] flex-1 text-center">↘</span>
                  </div>
                  <div className="flex gap-1 w-full max-w-[160px]">
                    <div
                      className="flex-1 bg-blue-50 border border-blue-300 text-blue-700 text-[8px] font-mono px-1 py-0.5 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Pay
                    </div>
                    <div
                      className="flex-1 bg-purple-50 border border-purple-300 text-purple-700 text-[8px] font-mono px-1 py-0.5 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Notify
                    </div>
                    <div
                      className="flex-1 bg-teal-50 border border-teal-400 text-teal-700 text-[8px] font-mono px-1 py-0.5 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Inv
                    </div>
                  </div>
                  {/* Coupling lines in orange */}
                  <div className="flex gap-1 w-full max-w-[160px]" aria-hidden="true">
                    <span className="text-orange-400 text-[9px] flex-1 text-left">↗</span>
                    <span className="text-orange-400 text-[9px] flex-1 text-center">↕</span>
                    <span className="text-orange-400 text-[9px] flex-1 text-right">↖</span>
                  </div>
                  <div className="flex gap-1 w-full max-w-[160px]">
                    <div
                      className="flex-1 bg-orange-50 border border-orange-300 text-orange-700 text-[8px] font-mono px-1 py-0.5 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Cache
                    </div>
                    <div
                      className="flex-1 bg-orange-50 border border-orange-300 text-orange-700 text-[8px] font-mono px-1 py-0.5 rounded text-center"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Search
                    </div>
                  </div>
                </div>

                {/* Tech debt bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-mono text-[9px] text-[#A69F8C] uppercase tracking-wider"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Tech Debt
                    </p>
                    <p
                      className="font-mono text-[9px] text-[#A69F8C]"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      55%
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7E2D6] rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                {/* Decision */}
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <p
                    className="text-orange-700 text-xs leading-snug"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    "Quick coupling shortcut — tech debt added"
                  </p>
                </div>
              </div>

              {/* ── Stage 4: Crisis ── */}
              <div className="flex-1 min-w-[200px] p-5 bg-[#FBF6EF] flex flex-col gap-4">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase text-[#A69F8C]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  STAGE 4 · CRISIS
                </p>

                {/* Mini system diagram — 7+ services, messy arrows */}
                <div className="flex flex-col items-center gap-0.5 flex-1 justify-center py-1">
                  <div
                    className="bg-[#E7F0EB] border border-[#234E3F] text-[#234E3F] text-[8px] font-mono px-2 py-1 rounded text-center w-full max-w-[140px]"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    OrderService
                  </div>
                  {/* Criss-crossing arrows */}
                  <div className="flex gap-0.5 w-full max-w-[160px]" aria-hidden="true">
                    <span className="text-red-400 text-[8px] flex-1 text-center">↙</span>
                    <span className="text-red-400 text-[8px] flex-1 text-center">↓</span>
                    <span className="text-red-400 text-[8px] flex-1 text-center">↘</span>
                    <span className="text-red-300 text-[8px] flex-1 text-center">↙</span>
                  </div>
                  <div className="flex gap-0.5 w-full max-w-[160px]">
                    {['Pay', 'Ntf', 'Inv', 'Srch'].map((s) => (
                      <div
                        key={s}
                        className="flex-1 bg-red-50 border border-red-300 text-red-700 text-[7px] font-mono px-0.5 py-0.5 rounded text-center"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                  {/* More chaos arrows */}
                  <div className="flex gap-0.5 w-full max-w-[160px]" aria-hidden="true">
                    <span className="text-red-300 text-[8px] flex-1 text-center">↗</span>
                    <span className="text-red-400 text-[8px] flex-1 text-center">↕</span>
                    <span className="text-red-300 text-[8px] flex-1 text-center">↖</span>
                    <span className="text-red-400 text-[8px] flex-1 text-center">↗</span>
                  </div>
                  <div className="flex gap-0.5 w-full max-w-[160px]">
                    {['Auth', 'Cache', 'Log', 'Evt'].map((s) => (
                      <div
                        key={s}
                        className="flex-1 bg-red-100 border border-red-400 text-red-800 text-[7px] font-mono px-0.5 py-0.5 rounded text-center"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech debt bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-mono text-[9px] text-[#A69F8C] uppercase tracking-wider"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      Tech Debt
                    </p>
                    <p
                      className="font-mono text-[9px] text-red-500 font-bold"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      80%
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7E2D6] rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                {/* Decision */}
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <p
                    className="text-red-700 text-xs leading-snug"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    "Scaling wall hit — refactor needed"
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Strip legend */}
          <div className="mt-4 pb-14 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-4 flex-wrap">
              <span
                className="font-mono text-[10px] text-[#A69F8C] uppercase tracking-wider"
                style={{ fontFamily: 'Geist Mono, monospace' }}
              >
                Tech Debt:
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-2 bg-green-400 rounded-full" />
                <span
                  className="font-mono text-[10px] text-[#74705F]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  Low
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-2 bg-yellow-400 rounded-full" />
                <span
                  className="font-mono text-[10px] text-[#74705F]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  Medium
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-2 bg-red-400 rounded-full" />
                <span
                  className="font-mono text-[10px] text-[#74705F]"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  High
                </span>
              </span>
            </div>
            <p
              className="font-mono text-[10px] text-[#A69F8C] italic text-right"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Your choices at each stage determine this.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 2: STAGE DETAILS ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            What happens at each stage.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: '01',
                title: 'Initial design',
                subtitle: 'Stage 1 · Launch',
                desc: 'A clean slate. Single service, well-scoped, minimal dependencies. The initial design is intentionally small — you will not be evaluated on this state, only on how you evolve from it.',
                barWidth: '10%',
                barColor: 'bg-green-400',
                accent: 'text-[#234E3F]',
                accentBg: 'bg-[#E7F0EB]',
              },
              {
                n: '02',
                title: 'First evolution',
                subtitle: 'Stage 2 · Growth',
                desc: 'A new requirement arrives the initial design was not built for. First trade-off: extract quickly with coupling, or invest in abstraction? The first decision shapes everything downstream.',
                barWidth: '30%',
                barColor: 'bg-green-400',
                accent: 'text-blue-700',
                accentBg: 'bg-blue-50',
              },
              {
                n: '03',
                title: 'Complexity compounds',
                subtitle: 'Stage 3 · Scale',
                desc: 'A scaling requirement forces structural change. Shortcuts from Stage 2 now constrain your options. Coupling starts showing up as orange lines. Tech debt is accumulating visibly.',
                barWidth: '55%',
                barColor: 'bg-yellow-400',
                accent: 'text-orange-700',
                accentBg: 'bg-orange-50',
              },
              {
                n: '04',
                title: 'Final evaluation',
                subtitle: 'Stage 4 · Crisis',
                desc: 'The full history of decisions is analysed. Tech debt score, scalability ceiling, extensibility rating. Hindsight makes every shortcut obvious — the question is whether you saw it coming.',
                barWidth: '80%',
                barColor: 'bg-red-400',
                accent: 'text-red-700',
                accentBg: 'bg-red-50',
              },
            ].map(({ n, title, subtitle, desc, barWidth, barColor, accentBg }) => (
              <div
                key={n}
                className="border border-[#E7E2D6] bg-[#FBF9F4] p-6 rounded-none flex flex-col gap-4"
              >
                {/* Stage number */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`font-mono text-3xl font-black text-[#E7E2D6] leading-none`}
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                    aria-hidden="true"
                  >
                    {n}
                  </span>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-widest ${accentBg} px-2 py-1 rounded text-[#74705F]`}
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    {subtitle}
                  </span>
                </div>

                <h3
                  className="font-serif text-lg text-[#201F1C]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {title}
                </h3>

                <p className="text-[#74705F] text-sm leading-relaxed flex-1">{desc}</p>

                {/* Mini debt bar */}
                <div className="space-y-1">
                  <p
                    className="font-mono text-[9px] text-[#A69F8C] uppercase tracking-wider"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    Tech Debt at this stage
                  </p>
                  <div className="w-full h-1.5 bg-[#E7E2D6] rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: barWidth }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3: TECH DEBT ACCUMULATION CHART ─── */}
      <section className="bg-[#E7F0EB] py-14">
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-4"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            How shortcuts compound.
          </h2>
          <p className="text-[#74705F] text-center max-w-xl mx-auto mb-12">
            A single rushed decision in Stage 2 doesn&apos;t just affect Stage 2. It constrains every stage that follows.
          </p>

          {/* Bar chart */}
          <div
            className="bg-white border border-[#E7E2D6] rounded-none p-8"
            role="img"
            aria-label="Bar chart showing tech debt accumulation across 4 evolution stages: 10%, 30%, 55%, 80%"
          >
            {/* Y-axis label + chart body */}
            <div className="flex gap-4 items-end">
              {/* Y-axis label */}
              <div className="flex flex-col items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 180 }}>
                <p
                  className="font-mono text-[10px] text-[#A69F8C] uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  Tech Debt Score
                </p>
              </div>

              {/* Bars area */}
              <div className="flex-1">
                {/* Y-axis gridlines */}
                <div className="relative" style={{ height: 180 }}>
                  {/* Grid lines */}
                  {[100, 75, 50, 25].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-[#E7E2D6] flex items-center"
                      style={{ bottom: `${pct * 1.8}px` }}
                    >
                      <span
                        className="font-mono text-[9px] text-[#A69F8C] -translate-y-2.5 pr-1"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {pct}
                      </span>
                    </div>
                  ))}

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-4 gap-4">
                    {[
                      { label: 'Stage 1', pct: 10, color: 'bg-green-400', decision: 'Clean start' },
                      { label: 'Stage 2', pct: 30, color: 'bg-green-500', decision: 'First shortcuts' },
                      { label: 'Stage 3', pct: 55, color: 'bg-yellow-400', decision: 'Coupling added' },
                      { label: 'Stage 4', pct: 80, color: 'bg-red-400', decision: 'Scaling wall' },
                    ].map(({ label, pct, color, decision }) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1">
                        {/* Percentage label above bar */}
                        <span
                          className="font-mono text-[10px] font-bold text-[#201F1C]"
                          style={{ fontFamily: 'Geist Mono, monospace' }}
                        >
                          {pct}%
                        </span>
                        {/* Bar */}
                        <div
                          className={`w-full ${color} rounded-t-sm`}
                          style={{ height: `${pct * 1.55}px`, minHeight: 4 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis bottom border */}
                <div className="border-t-2 border-[#201F1C] mt-0" />

                {/* X-axis labels */}
                <div className="flex justify-around px-4 gap-4 mt-2">
                  {[
                    { label: 'Stage 1', decision: 'Clean start' },
                    { label: 'Stage 2', decision: 'First shortcuts' },
                    { label: 'Stage 3', decision: 'Coupling added' },
                    { label: 'Stage 4', decision: 'Scaling wall' },
                  ].map(({ label, decision }) => (
                    <div key={label} className="flex-1 text-center">
                      <p
                        className="font-mono text-[10px] font-semibold text-[#201F1C]"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {label}
                      </p>
                      <p
                        className="font-mono text-[9px] text-[#A69F8C] mt-0.5"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {decision}
                      </p>
                    </div>
                  ))}
                </div>

                {/* X-axis label */}
                <p
                  className="font-mono text-[10px] text-[#A69F8C] uppercase tracking-widest text-center mt-3"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  Evolution Stage
                </p>
              </div>
            </div>
          </div>

          {/* Callout note */}
          <div className="mt-6 bg-white border-l-4 border-[#A6741C] pl-5 pr-4 py-4">
            <p className="text-[#201F1C] text-sm leading-relaxed">
              <span className="font-semibold text-[#A6741C]">Note:</span>{' '}
              A 10% shortcut in Stage 2 becomes a 30% refactoring effort in Stage 4.
              The compounding effect is not linear — delayed decisions grow exponentially harder to unwind.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 4: FEATURES ─── */}
      <section className="bg-[#FBF9F4] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Everything built for long-horizon thinking.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                Icon: GitBranch,
                title: 'Multi-stage progression',
                desc: 'Evolution scenarios have three to five stages, each introducing a meaningful constraint that builds on the previous design state — not a trivial extension.',
              },
              {
                Icon: AlertTriangle,
                title: 'Tech debt accumulation visible',
                desc: "A running tech debt indicator shows how each stage's shortcuts and rushed decisions compound into a harder-to-maintain system over time.",
              },
              {
                Icon: Scale,
                title: 'Trade-off decision points',
                desc: 'At each stage you see the trade-off you are making — speed vs. cleanliness, coupling vs. flexibility. There is no pretending trade-offs do not exist.',
              },
              {
                Icon: TrendingUp,
                title: 'Scale, tech debt, and trade-offs focus',
                desc: 'Evolution specifically targets the concepts that come up in senior LLD follow-ups: how do you handle growth, and how do your early decisions age?',
              },
              {
                Icon: BarChart2,
                title: 'Post-evolution system analysis',
                desc: "A full analysis after all stages shows your final system's metrics — tech debt score, extensibility rating, and a comparison to the benchmark evolution path.",
              },
              {
                Icon: Clock,
                title: 'Long-term thinking training',
                desc: 'Most LLD practice focuses on the initial design. Evolution trains the harder skill: designing for a system that will grow, change teams, and accumulate shortcuts over years.',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-[#E7E2D6] p-6 rounded-none flex flex-col gap-3"
              >
                <div className="w-9 h-9 bg-[#E7F0EB] flex items-center justify-center rounded-none shrink-0">
                  <Icon className="w-5 h-5 text-[#234E3F]" />
                </div>
                <h3
                  className="font-serif text-lg text-[#201F1C]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {title}
                </h3>
                <p className="text-[#74705F] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5: WHO IT'S FOR ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Who should practice Evolution?
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                label: 'Senior engineers and SDE-2+ candidates',
                desc: 'Who need to demonstrate that their designs hold up over time, not just at inception. Evolution is the mode that separates senior-ready candidates from the rest.',
              },
              {
                label: 'Engineers preparing for "how would you evolve this?" follow-ups',
                desc: 'These questions appear in almost every senior LLD round. Evolution gives you structured reps at answering them with trade-off awareness, not just incremental feature additions.',
              },
              {
                label: 'Engineers who make clean initial designs but poor long-term decisions',
                desc: 'If your Stage 1 designs are clean but your Stage 3 and Stage 4 become unmanageable — this is the exact gap Evolution is designed to close.',
              },
              {
                label: 'Technical leads and staff-level candidates',
                desc: 'Preparing for rounds that assess long-term design thinking, cross-stage decision awareness, and the ability to reason about decisions with downstream consequences.',
              },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="border border-[#E7E2D6] bg-[#FBF9F4] p-6 rounded-none flex gap-4"
              >
                <div className="mt-1 shrink-0">
                  <ChevronRight className="w-4 h-4 text-[#234E3F]" />
                </div>
                <div>
                  <h3
                    className="font-serif text-lg text-[#201F1C] mb-2"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {label}
                  </h3>
                  <p className="text-[#74705F] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA STRIP ─── */}
      <section className="bg-[#234E3F] py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {/* Decorative stage pills */}
          <div className="flex gap-2 justify-center mb-6 flex-wrap" aria-hidden="true">
            <span
              className="font-mono text-[10px] font-bold text-green-400 border border-green-700 bg-green-950/30 px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Stage 1 · 10%
            </span>
            <span
              className="font-mono text-[10px] font-bold text-green-300 border border-green-600 bg-green-950/30 px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Stage 2 · 30%
            </span>
            <span
              className="font-mono text-[10px] font-bold text-yellow-400 border border-yellow-700 bg-yellow-950/30 px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Stage 3 · 55%
            </span>
            <span
              className="font-mono text-[10px] font-bold text-red-400 border border-red-700 bg-red-950/30 px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Stage 4 · 80%
            </span>
          </div>
          <h2
            className="font-serif text-2xl sm:text-3xl text-white mb-4"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Start small. Watch your decisions compound.
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            The initial design is already on the canvas. Your job is to evolve it well enough
            that a future engineer can still work with it.
          </p>
          <Link
            href="/dashboard/design-studio/evolution"
            className="inline-flex items-center gap-2 bg-white text-[#234E3F] px-8 py-3 text-base font-semibold hover:bg-[#E7F0EB] transition-colors rounded-none"
          >
            Start evolving
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Section 6: FAQ + Cross-links ─── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="/features/evolution" />
    </>
  )
}

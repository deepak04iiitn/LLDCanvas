import type { Metadata } from 'next'
import Link from 'next/link'
import { DollarSign, Scale, MessageSquare, Ban, BarChart2, Star, ArrowRight, AlertTriangle, Check, Clock, Users } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Budget Pressure — Design Within Real Constraints | LLDCanvas',
  description:
    'Design the best system you can afford — not the best system you can imagine. Fixed budget, sprint timeline, or headcount limit. Explicit trade-off tracking and justification prompts. Senior-role interview prep done properly.',
  keywords: [
    'budget constrained design LLD',
    'design trade-offs interview',
    'cost optimization system design',
    'LLD with constraints',
    'practical design decisions',
    'LLD budget problem',
    'design under pressure',
    'real world design constraints LLD',
  ],
  alternates: { canonical: '/features/budget-pressure' },
  openGraph: {
    title: 'Budget Pressure — Design Within Real Constraints | LLDCanvas',
    description:
      'Fixed budget, sprint timeline, or headcount limit. Design explicitly within them, justify every trade-off, and compare your allocation.',
    type: 'website',
    url: '/features/budget-pressure',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Pressure — Design Within Real Constraints | LLDCanvas',
    description:
      'Fixed budget, sprint timeline, or headcount limit. Design explicitly within them, justify every trade-off, and compare your allocation.',
  },
}

const FAQ = [
  {
    q: 'What constraint types appear in Budget Pressure?',
    a: 'Three constraint types: a fixed engineering budget measured in story points (you have N points total to spend), a sprint timeline (you have N days; each component costs time to build), and a headcount limit (you have N engineers; some components require more than one engineer to build safely in parallel). Each type stresses different design trade-offs.',
  },
  {
    q: 'How are solutions evaluated?',
    a: 'Solutions are evaluated on three dimensions: constraint adherence (did you stay within budget?), trade-off quality (were the things you cut the right things to cut, or did you sacrifice load-bearing design elements?), and justification clarity (did your reasoning demonstrate that you understood what you were giving up?). There is no single correct solution — the benchmark represents one strong solution, not the only one.',
  },
  {
    q: 'Can I go over budget?',
    a: 'No. The constraint is enforced. If your design exceeds the budget, you must trim it before submitting. This is what makes Budget Pressure meaningful — you genuinely have to choose. Any design can be built with unlimited time and people; the skill is in building the right subset within real constraints.',
  },
  {
    q: 'What is different about Budget Pressure compared to regular LLD problems?',
    a: 'Regular LLD problems ask you to design a correct system — the evaluation is primarily about structural quality. Budget Pressure adds a real constraint that makes some correct designs unaffordable, forcing you to choose between competing correct designs based on cost, priority, and trade-off reasoning. This is the engineering reality that senior roles require you to navigate.',
  },
  {
    q: 'How does Budget Pressure prepare me for senior interviews?',
    a: 'Senior and staff-level interviews evaluate whether you can make principled trade-offs under real-world constraints — not just design a perfect system on a blank slate. Budget Pressure specifically trains the three skills that differentiate senior candidates: prioritising the most load-bearing design elements, cutting gracefully without undermining the core system, and articulating the reasoning behind every trade-off clearly enough for a stakeholder to understand.',
  },
]

export default function BudgetPressurePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Budget Pressure — Design Within Real Constraints',
          url: 'https://www.lldcanvas.in/features/budget-pressure',
          description:
            'Design the best system you can afford — fixed budget, sprint timeline, or headcount limit. Explicit trade-off tracking, justification prompts, and benchmark comparison.',
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
              name: 'Budget Pressure',
              item: 'https://www.lldcanvas.in/features/budget-pressure',
            },
          ],
        }}
      />

      {/* ─── Section 1: HERO ─── */}
      <section className="bg-[#FBF9F4] pt-8 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div className="flex flex-col gap-6">
              {/* Eyebrow */}
              <p
                className="font-mono text-xs font-semibold tracking-widest uppercase text-[#A6741C]"
                style={{ fontFamily: 'Geist Mono, monospace' }}
              >
                17 · BUDGET PRESSURE
              </p>

              {/* H1 */}
              <h1
                className="font-serif text-4xl sm:text-5xl text-[#201F1C] leading-tight"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                The best design you can afford — not the best design you can imagine.
              </h1>

              {/* Subtitle */}
              <p className="text-[#74705F] text-lg leading-relaxed">
                Fixed budget, sprint timeline, or headcount limit. Design explicitly within them,
                justify every trade-off, compare your allocation to the benchmark.
              </p>

              {/* Senior callout */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span>Senior, staff, and principal interviews test exactly this skill.</span>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href="/dashboard/design-studio/budget"
                  className="inline-flex items-center gap-2 bg-[#234E3F] text-white px-7 py-3 text-base font-semibold rounded-none hover:bg-[#1c3f33] transition-colors"
                >
                  Start under pressure
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right — Budget Dashboard Mockup */}
            <div className="bg-white border border-[#E7E2D6] rounded-2xl overflow-hidden shadow-sm">
              {/* Header bar */}
              <div className="bg-[#234E3F] text-white px-5 py-3 flex items-center justify-between">
                <span
                  className="font-mono text-sm font-semibold"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  Ride-Hailing System
                </span>
                <span
                  className="font-mono text-xs bg-white/10 border border-white/20 text-white px-2.5 py-1 rounded-full"
                  style={{ fontFamily: 'Geist Mono, monospace' }}
                >
                  8 pts remaining
                </span>
              </div>

              {/* Budget bar */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#A69F8C] font-medium">Budget</span>
                  <span
                    className="font-mono text-xs text-[#74705F]"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    32 / 40 pts used
                  </span>
                </div>
                <div className="w-full h-3 bg-[#E7E2D6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '80%',
                      background: 'linear-gradient(to right, #4ade80, #facc15)',
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  Approaching limit — 8 pts remaining
                </p>
              </div>

              {/* Feature allocation table */}
              <div className="px-5 pb-5 flex flex-col gap-0.5">
                {/* Row header */}
                <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                  <span className="text-xs text-[#A69F8C] font-semibold uppercase tracking-wide">Component</span>
                  <span className="text-xs text-[#A69F8C] font-semibold uppercase tracking-wide">Cost</span>
                </div>

                {/* Row 1 */}
                <div className="flex items-center justify-between bg-[#E7F0EB]/40 border border-[#E7F0EB] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#234E3F]" />
                    <span className="text-sm text-[#201F1C]">User Authentication</span>
                  </div>
                  <span
                    className="font-mono text-xs text-[#234E3F] font-semibold"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    8 pts
                  </span>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between bg-white border border-[#E7E2D6] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#234E3F]" />
                    <span className="text-sm text-[#201F1C]">Trip Matching Engine</span>
                  </div>
                  <span
                    className="font-mono text-xs text-[#234E3F] font-semibold"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    10 pts
                  </span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between bg-white border border-[#E7E2D6] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#234E3F]" />
                    <span className="text-sm text-[#201F1C]">Real-time Tracking</span>
                  </div>
                  <span
                    className="font-mono text-xs text-[#234E3F] font-semibold"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    7 pts
                  </span>
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-between bg-white border border-[#E7E2D6] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#234E3F]" />
                    <span className="text-sm text-[#201F1C]">Payment Processing</span>
                  </div>
                  <span
                    className="font-mono text-xs text-[#234E3F] font-semibold"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    7 pts
                  </span>
                </div>

                {/* Row 5 — CUT */}
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm text-red-400 line-through">Driver Rating System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs text-red-400 line-through"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      6 pts
                    </span>
                    <span className="text-xs text-red-500 font-semibold">CUT — budget exhausted</span>
                  </div>
                </div>

                {/* Row 6 — CUT */}
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm text-red-400 line-through">Surge Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs text-red-400 line-through"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      8 pts
                    </span>
                    <span className="text-xs text-red-500 font-semibold">CUT</span>
                  </div>
                </div>

                {/* Footer note */}
                <p className="text-xs text-[#A69F8C] italic mt-2 text-center">
                  Trade-off justification required for each cut →
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: CONSTRAINT TYPES ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-10"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Three real-world constraint types.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 — Engineering Budget */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-amber-600 uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Geist Mono, monospace' }}>
                  Story points
                </p>
                <h3
                  className="font-serif text-xl text-[#201F1C] mb-2"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  Engineering Budget
                </h3>
                <p className="text-sm text-[#74705F] leading-relaxed mb-3">
                  Each component costs story points. Stay under the limit.
                </p>
                <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-0.5">Trade-off forced</p>
                  <p className="text-sm text-amber-800">Speed vs. completeness — which features survive the cut?</p>
                </div>
              </div>
            </div>

            {/* Card 2 — Sprint Timeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Geist Mono, monospace' }}>
                  Working days
                </p>
                <h3
                  className="font-serif text-xl text-[#201F1C] mb-2"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  Sprint Timeline
                </h3>
                <p className="text-sm text-[#74705F] leading-relaxed mb-3">
                  Each decision costs implementation days. Ship by the deadline.
                </p>
                <div className="bg-blue-100 border border-blue-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-0.5">Trade-off forced</p>
                  <p className="text-sm text-blue-800">Quality vs. velocity — where do you take shortcuts?</p>
                </div>
              </div>
            </div>

            {/* Card 3 — Headcount Limit */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 bg-purple-100 border border-purple-200 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-purple-600 uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Geist Mono, monospace' }}>
                  Available engineers
                </p>
                <h3
                  className="font-serif text-xl text-[#201F1C] mb-2"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  Headcount Limit
                </h3>
                <p className="text-sm text-[#74705F] leading-relaxed mb-3">
                  Some components need multiple engineers to build safely in parallel.
                </p>
                <div className="bg-purple-100 border border-purple-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-purple-700 font-semibold uppercase tracking-wide mb-0.5">Trade-off forced</p>
                  <p className="text-sm text-purple-800">Parallelization vs. sequencing — what can you build alone?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: TRADE-OFF JUSTIFICATION ─── */}
      <section className="bg-[#E7F0EB] py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] mb-3"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            You can&apos;t cut without explaining why.
          </h2>
          <p className="text-[#74705F] text-base mb-10">
            Every removed component triggers a justification prompt. The reasoning is the work.
          </p>

          {/* Justification UI mockup */}
          <div className="bg-white border border-[#E7E2D6] rounded-xl overflow-hidden shadow-sm text-left">
            {/* Cut notice */}
            <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center gap-3">
              <Ban className="w-4 h-4 text-red-500 shrink-0" />
              <span
                className="font-mono text-sm text-red-600 font-semibold"
                style={{ fontFamily: 'Geist Mono, monospace' }}
              >
                You cut: Driver Rating System <span className="text-red-400 font-normal">(-6 pts)</span>
              </span>
            </div>

            {/* Prompt */}
            <div className="px-5 pt-4 pb-3">
              <label className="block text-sm font-semibold text-[#201F1C] mb-2">
                Why did you cut this? What are you accepting as a consequence?
              </label>
              {/* Textarea mockup */}
              <div className="bg-[#FBF9F4] border border-[#E7E2D6] rounded-lg p-4 min-h-[80px]">
                <p className="text-sm text-[#74705F] italic leading-relaxed">
                  Rating system can be shipped in Sprint 2 once core trip flow is stable.
                  Risk: drivers may game the system in the first sprint without any accountability
                  mechanism in place. Acceptable short-term given that the core user journey is
                  unblocked…
                </p>
              </div>
            </div>

            {/* Evaluator note */}
            <div className="bg-[#E7F0EB] border-t border-[#D0E4D6] px-5 py-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#234E3F]" />
              <p className="text-sm text-[#234E3F] font-semibold">
                This reasoning is what senior interviewers are evaluating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: ALLOCATION COMPARISON ─── */}
      <section className="bg-[#FBF9F4] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2
              className="font-serif text-3xl sm:text-4xl text-[#201F1C] mb-3"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              See where the benchmark invested differently.
            </h2>
            <p className="text-[#74705F] text-base max-w-2xl mx-auto">
              Side-by-side allocation reveals what experienced engineers prioritise versus what
              candidates consistently miss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your allocation */}
            <div className="bg-white border border-[#E7E2D6] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#74705F]" />
                <h3 className="text-sm font-semibold text-[#201F1C] uppercase tracking-wide">Your allocation</h3>
                <span className="ml-auto font-mono text-xs text-[#A69F8C]" style={{ fontFamily: 'Geist Mono, monospace' }}>
                  32 pts
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Core flow', pts: 20, max: 40 },
                  { label: 'Resilience', pts: 4, max: 40 },
                  { label: 'Observability', pts: 0, max: 40 },
                  { label: 'Feature completeness', pts: 8, max: 40 },
                ].map(({ label, pts, max }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#201F1C]">{label}</span>
                      <span
                        className="font-mono text-xs text-[#74705F]"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {pts} pts
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E7E2D6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#74705F] rounded-full transition-all"
                        style={{ width: `${(pts / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark allocation */}
            <div className="bg-[#E7F0EB] border border-[#C8DDD0] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#234E3F]" />
                <h3 className="text-sm font-semibold text-[#201F1C] uppercase tracking-wide">Benchmark allocation</h3>
                <span className="ml-auto font-mono text-xs text-[#74705F]" style={{ fontFamily: 'Geist Mono, monospace' }}>
                  40 pts
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Core flow', pts: 18, max: 40, delta: null },
                  { label: 'Resilience', pts: 10, max: 40, delta: '+6 pts' },
                  { label: 'Observability', pts: 4, max: 40, delta: '+4 pts' },
                  { label: 'Feature completeness', pts: 8, max: 40, delta: null },
                ].map(({ label, pts, max, delta }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#201F1C]">{label}</span>
                        {delta && (
                          <span className="text-xs font-mono text-[#234E3F] bg-[#234E3F]/10 px-1.5 py-0.5 rounded font-semibold"
                            style={{ fontFamily: 'Geist Mono, monospace' }}>
                            {delta}
                          </span>
                        )}
                      </div>
                      <span
                        className="font-mono text-xs text-[#234E3F]"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        {pts} pts
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#C8DDD0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#234E3F] rounded-full transition-all"
                        style={{ width: `${(pts / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight note */}
              <div className="mt-5 pt-4 border-t border-[#C8DDD0]">
                <p className="text-xs text-[#234E3F] leading-relaxed">
                  <span className="font-semibold">The pattern:</span> experienced engineers protect
                  resilience and observability first. Candidates optimise for feature completeness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: FEATURES ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-10"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            What Budget Pressure includes.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <DollarSign className="w-5 h-5 text-amber-600" />,
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                title: 'Real constraint types',
                desc: 'Story points, sprint days, or headcount — each forcing a distinct class of engineering trade-off.',
              },
              {
                icon: <Scale className="w-5 h-5 text-blue-600" />,
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                title: 'Explicit trade-off tracking',
                desc: 'Every component is costed. Every cut is recorded. The budget bar depletes in real time as you design.',
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
                bg: 'bg-purple-50',
                border: 'border-purple-100',
                title: 'Justification prompts',
                desc: 'Cutting a component triggers a structured prompt. You explain what you\'re sacrificing and why it\'s acceptable.',
              },
              {
                icon: <Ban className="w-5 h-5 text-red-600" />,
                bg: 'bg-red-50',
                border: 'border-red-100',
                title: 'No gold-plating',
                desc: 'The constraint is enforced — you cannot submit a design that exceeds budget. The skill is choosing well, not just designing well.',
              },
              {
                icon: <BarChart2 className="w-5 h-5 text-[#234E3F]" />,
                bg: 'bg-[#E7F0EB]',
                border: 'border-[#C8DDD0]',
                title: 'Allocation comparison',
                desc: 'After submission, see how the benchmark allocated the same budget — and where your priorities diverged.',
              },
              {
                icon: <Star className="w-5 h-5 text-[#A6741C]" />,
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                title: 'Senior interview format',
                desc: 'Problems are calibrated to the constraint reasoning expected at senior, staff, and principal engineering levels.',
              },
            ].map(({ icon, bg, border, title, desc }) => (
              <div
                key={title}
                className={`${bg} border ${border} rounded-xl p-5 flex gap-4`}
              >
                <div className={`w-9 h-9 ${bg} border ${border} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#201F1C] mb-1">{title}</h3>
                  <p className="text-sm text-[#74705F] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 6: WHO IT'S FOR ─── */}
      <section className="bg-[#FBF9F4] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-10"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Who Budget Pressure is for.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                badge: 'Senior candidates',
                badgeBg: 'bg-[#E7F0EB] text-[#234E3F]',
                desc: 'Preparing for roles where the interview explicitly evaluates trade-off reasoning and constraint-aware design — not just structural correctness.',
              },
              {
                badge: 'Mid-level engineers',
                badgeBg: 'bg-blue-50 text-blue-700',
                desc: 'Building the skill to think beyond "what\'s the ideal design" toward "what\'s the right design given these real constraints."',
              },
              {
                badge: 'Product engineers',
                badgeBg: 'bg-purple-50 text-purple-700',
                desc: 'Practitioners who already navigate sprint planning and resource allocation — and want to practice articulating those decisions in an interview setting.',
              },
              {
                badge: 'Tech leads',
                badgeBg: 'bg-amber-50 text-amber-700',
                desc: 'Engineers who regularly make build-vs-cut decisions in practice but want to sharpen the precision and clarity with which they communicate the reasoning.',
              },
            ].map(({ badge, badgeBg, desc }) => (
              <div
                key={badge}
                className="bg-white border border-[#E7E2D6] rounded-xl p-5"
              >
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${badgeBg}`}>
                  {badge}
                </span>
                <p className="text-sm text-[#74705F] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 7: FAQ + Cross-links ─── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks />
    </>
  )
}

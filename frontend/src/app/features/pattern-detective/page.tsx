import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Layers, MessageSquare, BarChart2, CheckCircle2, Eye, ArrowRight, Search } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Pattern Detective — Identify Design Patterns in Real Code | LLDCanvas',
  description:
    'Read production-style code, identify the design pattern it implements, and explain why — no hints, four options, one correct answer. Build the pattern-recognition instinct interviewers test.',
  keywords: [
    'design pattern identification',
    'identify design patterns from code',
    'design pattern recognition',
    'OOP pattern practice',
    'LLD pattern detective',
    'learn design patterns by example',
    'design patterns for interview',
  ],
  alternates: { canonical: '/features/pattern-detective' },
  openGraph: {
    title: 'Pattern Detective — Identify Design Patterns in Real Code | LLDCanvas',
    description:
      'Real production-style code, no hints, one correct pattern to identify. Covers all 23 Gang-of-Four patterns.',
    type: 'website',
    url: '/features/pattern-detective',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pattern Detective — Identify Design Patterns in Real Code | LLDCanvas',
    description:
      'Real production-style code, no hints, one correct pattern to identify. Covers all 23 Gang-of-Four patterns.',
  },
}

const FAQ = [
  {
    q: 'How is Pattern Detective different from reading about patterns?',
    a: 'Reading teaches you the canonical definition. Pattern Detective trains the reverse skill: given real code with no label, identify what pattern it implements and why the alternatives do not fit. This is the exact skill tested in interviews — your interviewer will not announce what pattern you should use; you have to see it yourself.',
  },
  {
    q: 'What patterns are covered?',
    a: 'All 23 Gang-of-Four patterns: the 5 Creational patterns (Singleton, Factory Method, Abstract Factory, Builder, Prototype), 7 Structural patterns (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy), and 11 Behavioral patterns (Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter).',
  },
  {
    q: 'Does Pattern Detective give hints?',
    a: 'No. There are no hints, labels, or visual highlights. The code snippet is shown as-is, and you must identify the pattern from the structure alone. This is harder and more effective than hint-assisted learning — you build the instinct, not just the knowledge.',
  },
  {
    q: 'Can I attempt the same scenario multiple times?',
    a: 'Yes. You can revisit any scenario you have previously completed. This is useful for spaced repetition — returning to a scenario a week later and seeing if you still identify it correctly without remembering the answer.',
  },
  {
    q: 'What if I disagree with the answer?',
    a: 'Each scenario is authored by LLD practitioners and reviewed for unambiguity — the code is deliberately structured to implement exactly one pattern. If you disagree, the explanation section walks through the structural reasoning in detail. You can also flag a scenario for review from within the explanation view.',
  },
]

const CREATIONAL = ['Singleton', 'Factory Method', 'Abstract Factory', 'Builder', 'Prototype']
const STRUCTURAL = ['Adapter', 'Bridge', 'Composite', 'Decorator', 'Facade', 'Flyweight', 'Proxy']
const BEHAVIORAL = [
  'Chain of Responsibility',
  'Command',
  'Iterator',
  'Mediator',
  'Memento',
  'Observer',
  'State',
  'Strategy',
  'Template Method',
  'Visitor',
  'Interpreter',
]

const FEATURES = [
  {
    Icon: Code2,
    label: 'Real production-style code',
    desc: 'Scenarios are modeled on real systems — not abstract textbook examples. You learn to spot patterns in the kind of code you actually encounter in interviews and on the job.',
  },
  {
    Icon: Layers,
    label: '23 patterns covered',
    desc: 'All 23 Gang-of-Four patterns — Creational, Structural, Behavioral — appear across the scenario library, from beginner Singleton to advanced Visitor.',
  },
  {
    Icon: MessageSquare,
    label: 'Wrong-answer explanations',
    desc: 'The explanation covers all four options, including the ones you did not pick. Understanding why an Observer is not a Mediator is as important as knowing what an Observer is.',
  },
  {
    Icon: BarChart2,
    label: 'Difficulty levels',
    desc: 'Scenarios range from beginner (Singleton, Factory) to advanced (Visitor, Interpreter). You can filter by difficulty or cycle through all levels.',
  },
  {
    Icon: CheckCircle2,
    label: 'One unambiguous answer',
    desc: 'Every scenario has exactly one correct pattern. There are no "it depends" scenarios — the code is authored to implement a single pattern clearly and without ambiguity.',
  },
  {
    Icon: Eye,
    label: 'Structural cue training',
    desc: 'Explanations teach you what to look for — not just that a pattern is present, but which specific class relationships and method signatures signal it.',
  },
]

const FOR_WHO = [
  'Engineers who have read about design patterns in books but freeze when asked "what pattern is this?" during an interview.',
  'Candidates preparing for OOP design rounds where pattern identification is explicitly tested.',
  'Anyone who understands patterns in isolation but struggles to recognise them in non-trivially structured real code.',
  'Engineers who can name patterns but cannot articulate why a specific piece of code is or is not a particular pattern.',
]

export default function PatternDetectivePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Pattern Detective — Identify Design Patterns in Real Code',
          url: 'https://www.lldcanvas.in/features/pattern-detective',
          description:
            'Read production-style code, identify the design pattern it implements, and explain why.',
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
              name: 'Pattern Detective',
              item: 'https://www.lldcanvas.in/features/pattern-detective',
            },
          ],
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-paper px-6 pt-8 pb-0 sm:px-8 sm:pt-10 lg:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">

            {/* LEFT — Investigation brief */}
            <div className="flex flex-col gap-6 pt-2 lg:pt-4">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-gold" strokeWidth={2.5} />
                <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-gold uppercase">
                  CASE FILE · 10
                </span>
              </div>

              {/* H1 */}
              <h1 className="font-serif text-4xl font-semibold leading-[1.12] text-ink sm:text-5xl">
                Read code. Name the pattern. Explain&nbsp;why.
              </h1>

              {/* Subtitle */}
              <p className="text-base leading-relaxed text-ink-muted sm:text-[17px]">
                Real production-style code, no hints, four options. Build the pattern-recognition
                instinct interviewers actually test.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-mono text-[11px] font-medium text-red-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  No hints given
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 font-mono text-[11px] font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  One correct answer
                </span>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/dashboard/learn/detective"
                  className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-mono text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Start detecting
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="font-mono text-[11px] text-ink-faint">
                  23 Gang-of-Four patterns · All difficulty levels
                </p>
              </div>
            </div>

            {/* RIGHT — Code investigation panel */}
            <div className="w-full overflow-hidden rounded-xl border border-[#333] bg-[#1E1E1E] shadow-2xl shadow-ink/20 lg:mt-0">

              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-[#333] bg-[#2D2D2D] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="ml-2 flex items-center gap-1.5 rounded border border-[#444] bg-[#1E1E1E] px-3 py-0.5">
                  <span className="font-mono text-[11px] text-[#858585]">PaymentService.java</span>
                </div>
              </div>

              {/* Code block */}
              <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#D4D4D4] sm:text-sm">
                <code>
                  <span className="text-[#569CD6]">public interface</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentProcessor</span>
                  {' {\n'}
                  {'    '}
                  <span className="text-[#569CD6]">void</span>
                  {' process('}
                  <span className="text-[#4EC9B0]">Payment</span>
                  {' payment);\n'
                  + '}\n\n'}
                  <span className="text-[#569CD6]">public class</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PayPalProcessor</span>
                  {' '}
                  <span className="text-[#569CD6]">implements</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentProcessor</span>
                  {' {\n'}
                  {'    '}
                  <span className="text-[#569CD6]">public void</span>
                  {' process('}
                  <span className="text-[#4EC9B0]">Payment</span>
                  {' payment) {\n'}
                  {'        '}
                  <span className="text-[#6A9955]">{'// PayPal-specific processing logic'}</span>
                  {'\n    }\n}\n\n'}
                  <span className="text-[#569CD6]">public class</span>
                  {' '}
                  <span className="text-[#4EC9B0]">StripeProcessor</span>
                  {' '}
                  <span className="text-[#569CD6]">implements</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentProcessor</span>
                  {' {\n'}
                  {'    '}
                  <span className="text-[#569CD6]">public void</span>
                  {' process('}
                  <span className="text-[#4EC9B0]">Payment</span>
                  {' payment) {\n'}
                  {'        '}
                  <span className="text-[#6A9955]">{'// Stripe-specific processing logic'}</span>
                  {'\n    }\n}\n\n'}
                  <span className="text-[#569CD6]">public class</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentService</span>
                  {' {\n'}
                  {'    '}
                  <span className="text-[#569CD6]">private</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentProcessor</span>
                  {' processor;\n\n'}
                  {'    '}
                  <span className="text-[#569CD6]">public</span>
                  {' '}
                  <span className="text-[#4EC9B0]">PaymentService</span>
                  {'('}
                  <span className="text-[#4EC9B0]">PaymentProcessor</span>
                  {' p) {\n'}
                  {'        '}
                  <span className="text-[#569CD6]">this</span>
                  {'.processor = p;\n    }\n}'}
                </code>
              </pre>

              {/* Answer options */}
              <div className="border-t border-[#333] bg-[#252526] p-4">
                <p className="mb-3 font-mono text-[11px] text-[#858585]">
                  Which pattern does this implement?
                </p>
                <div className="flex flex-col gap-2">
                  {/* A — Factory Method */}
                  <div className="flex cursor-pointer items-center gap-3 rounded-md border border-[#444] bg-[#2D2D2D] px-3 py-2.5 transition-colors hover:border-[#555] hover:bg-[#333]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#3D3D3D] font-mono text-[10px] font-bold text-[#858585]">
                      A
                    </span>
                    <span className="font-mono text-[12.5px] text-[#D4D4D4]">Factory Method</span>
                  </div>

                  {/* B — Strategy Pattern (CORRECT) */}
                  <div className="flex cursor-pointer items-center gap-3 rounded-md border border-[#234E3F] bg-[#1B3D31] px-3 py-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#234E3F] font-mono text-[10px] font-bold text-[#7EC8A4]">
                      B
                    </span>
                    <span className="flex-1 font-mono text-[12.5px] text-[#7EC8A4]">
                      Strategy Pattern
                    </span>
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#7EC8A4]" />
                  </div>

                  {/* C — Observer Pattern */}
                  <div className="flex cursor-pointer items-center gap-3 rounded-md border border-[#444] bg-[#2D2D2D] px-3 py-2.5 transition-colors hover:border-[#555] hover:bg-[#333]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#3D3D3D] font-mono text-[10px] font-bold text-[#858585]">
                      C
                    </span>
                    <span className="font-mono text-[12.5px] text-[#D4D4D4]">Observer Pattern</span>
                  </div>

                  {/* D — Decorator Pattern */}
                  <div className="flex cursor-pointer items-center gap-3 rounded-md border border-[#444] bg-[#2D2D2D] px-3 py-2.5 transition-colors hover:border-[#555] hover:bg-[#333]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#3D3D3D] font-mono text-[10px] font-bold text-[#858585]">
                      D
                    </span>
                    <span className="font-mono text-[12.5px] text-[#D4D4D4]">Decorator Pattern</span>
                  </div>
                </div>
              </div>
            </div>
            {/* end right */}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-12">
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
              Investigation procedure
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Three steps. No shortcuts.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:divide-x sm:divide-hairline">
            {/* Step 01 */}
            <div className="flex flex-col gap-4 border-b border-hairline px-0 py-8 sm:border-b-0 sm:px-8 sm:py-0 sm:first:pl-0">
              <span className="font-mono text-5xl font-bold leading-none text-ink-faint/40">01</span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">Read the system code</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Study the code structure — the classes, interfaces, and the relationships between
                  them. No labels, no category hints. Just evidence.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col gap-4 border-b border-hairline px-0 py-8 sm:border-b-0 sm:px-8 sm:py-0">
              <span className="font-mono text-5xl font-bold leading-none text-ink-faint/40">02</span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">Identify the pattern</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Four options, all plausible. The distractors are patterns that share surface-level
                  similarity with the correct answer — close enough to be genuinely challenging.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col gap-4 px-0 py-8 sm:px-8 sm:py-0">
              <span className="font-mono text-5xl font-bold leading-none text-ink-faint/40">03</span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">Reveal the explanation</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Why the correct answer fits. Why each wrong option does not. Which specific
                  structural cues in the code were the giveaways.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PATTERN COVERAGE ─────────────────────────────────────────────── */}
      <section className="bg-brand-tint px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
              Evidence catalogue
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              All 23 Gang-of-Four patterns covered.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Every scenario is drawn from the canonical GoF library — no pattern is missing, no
              pattern is repeated beyond what the difficulty spread requires.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* CREATIONAL */}
            <div>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                Creational
              </p>
              <div className="flex flex-wrap gap-2">
                {CREATIONAL.map(p => (
                  <span
                    key={p}
                    className="rounded border border-hairline bg-paper-elevated px-2.5 py-1 font-mono text-xs text-ink"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* STRUCTURAL */}
            <div>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                Structural
              </p>
              <div className="flex flex-wrap gap-2">
                {STRUCTURAL.map(p => (
                  <span
                    key={p}
                    className="rounded border border-hairline bg-paper-elevated px-2.5 py-1 font-mono text-xs text-ink"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* BEHAVIORAL */}
            <div>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                Behavioral
              </p>
              <div className="flex flex-wrap gap-2">
                {BEHAVIORAL.map(p => (
                  <span
                    key={p}
                    className="rounded border border-hairline bg-paper-elevated px-2.5 py-1 font-mono text-xs text-ink"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="bg-paper px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
              Investigation report
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              What the evidence shows.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-2">
            {FEATURES.map(({ Icon, label, desc }) => (
              <div key={label} className="group flex items-start gap-5 bg-paper-elevated p-6 transition-colors hover:bg-paper">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-hairline bg-brand-tint">
                  <Icon className="h-4 w-4 text-brand" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-serif text-[15px] font-semibold text-ink">{label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                Candidate profile
              </span>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                Built for engineers who recognise patterns in books — not yet in code.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                The gap between knowing what a Strategy Pattern is and recognising it in a real
                PaymentService is wider than most engineers expect. Pattern Detective closes
                that gap with deliberate, high-repetition exposure to real-structured code.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {FOR_WHO.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" strokeWidth={2} />
                  <span className="text-sm leading-relaxed text-ink-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <div className="bg-paper">
        <FeatureFaq items={FAQ} />
      </div>

      {/* ─── CROSS LINKS ──────────────────────────────────────────────────── */}
      <FeatureCrossLinks exclude="/features/pattern-detective" />
    </>
  )
}

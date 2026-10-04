import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, Bug, CheckCircle2, BookOpen, Layers, Code2, ArrowRight, X, Check, ArrowRightLeft } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Debug & Fix — Restructure Broken Designs in LLD | LLDCanvas',
  description: 'Not just annotate — fix. Given a design with real violations like God Class and SRP issues, restructure it, extract classes, apply the right pattern, and validate against the expected corrected design.',
  keywords: ['fix design problems LLD', 'design refactoring exercise', 'apply design patterns to fix code', 'LLD debugging exercise', 'fix SRP violations', 'restructure broken design', 'LLD design fix practice'],
  alternates: { canonical: '/features/debug-and-fix' },
  openGraph: {
    title: 'Debug & Fix — Restructure Broken Designs in LLD | LLDCanvas',
    description: 'Active design fixing — detect violations, plan your restructuring, apply the fix, and validate against the expected clean design.',
    type: 'website',
    url: '/features/debug-and-fix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debug & Fix — Restructure Broken Designs in LLD | LLDCanvas',
    description: 'Active design fixing — detect violations, plan your restructuring, apply the fix, and validate against the expected clean design.',
  },
}

const FAQ = [
  { q: 'How is Debug & Fix different from Debug Lab?', a: 'Debug Lab asks you to annotate what is wrong — identify and describe violations. Debug & Fix asks you to fix it — restructure the design, apply the correct pattern, and validate against the expected clean output. Debug Lab is critique practice; Debug & Fix is remediation practice. They address different interview moments.' },
  { q: 'Do I have to fix in code or UML?', a: "You fix in UML on the LLDCanvas canvas. This is deliberate — LLD interviews primarily assess your structural design thinking, not your code-writing speed. The canvas lets you focus on class responsibilities, relationships, and pattern application without getting bogged down in syntax." },
  { q: 'Is there one right fix?', a: 'Not always. Some scenarios have a single clearly correct restructuring. Others have two or three valid approaches that each have different trade-offs. The validator accepts any of the known-good fixes and explains the reasoning behind each one, so you understand the design space rather than just the single expected answer.' },
  { q: 'What violation types appear in Debug & Fix?', a: 'God Class, SRP violation, tight coupling, wrong inheritance, wrong aggregation, Liskov Substitution Principle violation, and interface segregation issues. Each scenario focuses on one or two violation types to keep the exercise tractable and the learning specific.' },
  { q: 'How are my fixes evaluated?', a: 'The validator compares your restructured design against the expected clean design structurally — it checks whether key classes are extracted, whether the correct pattern is applied, whether interfaces are in the right places, and whether the original violation is actually resolved. It is not a pixel-perfect comparison; it is a structural diff.' },
]

export default function DebugAndFixPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Debug & Fix — Restructure Broken Designs in LLD', url: 'https://www.lldcanvas.in/features/debug-and-fix', description: 'Not just annotate — fix. Given a design with real violations, restructure it, extract classes, apply the right pattern, and validate against the expected corrected design.' }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' }, { '@type': 'ListItem', position: 2, name: 'Debug & Fix', item: 'https://www.lldcanvas.in/features/debug-and-fix' }] }} />

      {/* ─── SECTION 1: HERO ──────────────────────────────────────────── */}
      <section className="px-6 pt-8 pb-0 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-5xl">

          {/* Text block — centered */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-mono text-[11px] font-bold tracking-[0.25em] text-gold uppercase">
              13 · DEBUG &amp; FIX
            </p>
            <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Don&rsquo;t just spot the flaw &mdash; fix it.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Where Debug Lab asks you to annotate, Debug &amp; Fix asks you to restructure. Apply the pattern, extract the class, validate against the expected clean design.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/design-studio/debugger"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start fixing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-hairline px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-elevated"
              >
                How it works
              </a>
            </div>
          </div>

          {/* ── SPLIT PANEL: BEFORE / AFTER ── */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-hairline shadow-sm">

            {/* Top bar */}
            <div className="flex items-center justify-between gap-2 border-b border-hairline bg-paper-elevated px-4 py-2.5">
              <span className="font-mono text-xs font-semibold text-ink-muted">
                SCENARIO #04: UserManager.java
              </span>
              <span className="rounded bg-brand-tint px-2 py-0.5 font-mono text-xs font-semibold text-brand">
                GOD CLASS · SRP VIOLATION
              </span>
            </div>

            {/* Split panels */}
            <div className="flex flex-col md:flex-row">

              {/* ── LEFT: BEFORE (broken) ── */}
              <div className="flex-1 bg-red-50 px-5 py-6 sm:px-7">
                {/* Label */}
                <div className="mb-5 flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-600" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-red-700 uppercase">Before</span>
                </div>

                {/* God Class box */}
                <div className="relative rounded-lg border-2 border-red-300 bg-red-100">
                  {/* Class header */}
                  <div className="rounded-t-md bg-red-300 px-3 py-1.5 text-center">
                    <span className="font-mono text-xs font-bold text-red-900">UserManager</span>
                  </div>
                  {/* Methods list */}
                  <div className="divide-y divide-red-200 px-3 py-2">
                    {[
                      'createUser()',
                      'updateProfile()',
                      'sendEmail()',
                      'validatePassword()',
                      'hashPassword()',
                      'sendSMS()',
                      'generateReport()',
                      'cacheUser()',
                      'queryDB()',
                    ].map(m => (
                      <p key={m} className="py-0.5 font-mono text-[11px] text-red-800">+ {m}</p>
                    ))}
                  </div>
                  {/* Violation badge */}
                  <div className="m-3 mt-1 rounded border border-red-300 bg-red-200 px-2 py-1 text-center">
                    <span className="font-mono text-[10px] font-bold text-red-700 uppercase tracking-wider">
                      GOD CLASS · 9 responsibilities
                    </span>
                  </div>
                </div>

                {/* Violation annotations */}
                <div className="mt-4 space-y-2">
                  {[
                    'Too many responsibilities',
                    'Untestable in isolation',
                    'SRP violation',
                  ].map(note => (
                    <div key={note} className="flex items-center gap-2">
                      <X className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                      <span className="font-mono text-[11px] text-red-700">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CENTER: TRANSFORMATION ARROW ── */}
              <div className="hidden flex-col items-center justify-center gap-2 border-x border-hairline bg-paper-elevated px-4 py-6 md:flex">
                <ArrowRightLeft className="h-6 w-6 text-brand" />
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">Restructure</span>
              </div>

              {/* ── MOBILE: TRANSFORMATION DIVIDER ── */}
              <div className="flex items-center justify-center gap-3 border-y border-hairline bg-paper-elevated py-3 md:hidden">
                <div className="h-px flex-1 bg-hairline" />
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft className="h-4 w-4 text-brand" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">Restructure</span>
                </div>
                <div className="h-px flex-1 bg-hairline" />
              </div>

              {/* ── RIGHT: AFTER (fixed) ── */}
              <div className="flex-1 bg-green-50 px-5 py-6 sm:px-7">
                {/* Label */}
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-green-700 uppercase">After</span>
                </div>

                {/* 4 clean service boxes */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'UserService',   methods: ['createUser()', 'updateProfile()'] },
                    { name: 'AuthService',   methods: ['validatePassword()', 'hashPassword()'] },
                    { name: 'EmailService',  methods: ['sendEmail()', 'sendSMS()'] },
                    { name: 'ReportService', methods: ['generateReport()'] },
                  ].map(cls => (
                    <div key={cls.name} className="rounded-lg border border-green-300 bg-green-100">
                      <div className="rounded-t-md bg-green-300 px-2 py-1 text-center">
                        <span className="font-mono text-[10px] font-bold text-green-900">{cls.name}</span>
                      </div>
                      <div className="px-2 py-1.5">
                        {cls.methods.map(m => (
                          <p key={m} className="font-mono text-[10px] text-green-800">+ {m}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Success annotations */}
                <div className="mt-4 space-y-2">
                  {[
                    'SRP followed',
                    'Testable in isolation',
                    'Single responsibility each',
                  ].map(note => (
                    <div key={note} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                      <span className="font-mono text-[11px] text-green-700">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: 4-STEP PROCESS ────────────────────────────────── */}
      <section id="how-it-works" className="border-y border-hairline bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            How it works
          </p>
          <h2 className="mb-10 font-serif text-3xl font-medium text-ink">
            From diagnosis to clean design.
          </h2>

          {/* Desktop: horizontal flow */}
          <div className="hidden items-start gap-0 md:flex">
            {[
              { step: '01', icon: Bug,           label: 'Detect',   desc: 'Identify violations in the broken diagram' },
              { step: '02', icon: Layers,        label: 'Plan',     desc: 'Decide your restructuring approach' },
              { step: '03', icon: Wrench,        label: 'Fix',      desc: 'Restructure classes on the canvas' },
              { step: '04', icon: CheckCircle2,  label: 'Validate', desc: 'Compare to the expected clean design' },
            ].map((item, idx, arr) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="flex flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-paper shadow-sm">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <p className="mb-0.5 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">{item.step}</p>
                    <p className="mb-1 font-mono text-sm font-bold text-ink">{item.label}</p>
                    <p className="text-xs leading-relaxed text-ink-muted">{item.desc}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="mt-6 flex flex-shrink-0 items-center px-1">
                      <ArrowRight className="h-4 w-4 text-ink-faint" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile: vertical list */}
          <div className="space-y-4 md:hidden">
            {[
              { step: '01', icon: Bug,           label: 'Detect',   desc: 'Identify violations in the broken diagram' },
              { step: '02', icon: Layers,        label: 'Plan',     desc: 'Decide your restructuring approach' },
              { step: '03', icon: Wrench,        label: 'Fix',      desc: 'Restructure classes on the canvas' },
              { step: '04', icon: CheckCircle2,  label: 'Validate', desc: 'Compare to the expected clean design' },
            ].map((item, idx, arr) => {
              const Icon = item.icon
              return (
                <div key={item.step}>
                  <div className="flex items-start gap-4 rounded-xl border border-hairline bg-paper p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <p className="mb-0.5 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">{item.step}</p>
                      <p className="mb-0.5 font-mono text-sm font-bold text-ink">{item.label}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{item.desc}</p>
                    </div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="h-4 w-4 rotate-90 text-ink-faint" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: VALIDATION DIFF PREVIEW ──────────────────────── */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            Validation
          </p>
          <h2 className="mb-3 font-serif text-3xl font-medium text-ink">
            Your fix, scored.
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-ink-muted">
            The validator compares your restructured design against the expected clean design structurally — a structural diff, not pixel-perfect comparison.
          </p>

          <div className="overflow-hidden rounded-xl border border-hairline">
            {/* Header row */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="border-r border-hairline bg-paper px-5 py-3">
                <p className="font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                  Your restructured design
                </p>
              </div>
              <div className="bg-brand-tint px-5 py-3">
                <p className="font-mono text-[10px] font-bold tracking-widest text-brand/70 uppercase">
                  Expected clean design
                </p>
              </div>
            </div>

            {/* Row 1 — match */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-center gap-3 border-r border-hairline px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">UserService</span> extracted
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-tint/30 px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">UserService</span> extracted
                </p>
              </div>
            </div>

            {/* Row 2 — match */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-center gap-3 border-r border-hairline px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">AuthService</span> extracted
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-tint/30 px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">AuthService</span> extracted
                </p>
              </div>
            </div>

            {/* Row 3 — miss */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-center gap-3 border-r border-hairline bg-red-50/60 px-5 py-3.5">
                <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-700 italic">
                  PasswordHasher not extracted
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-tint/30 px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">PasswordHasher</span> separate class
                </p>
              </div>
            </div>

            {/* Row 4 — match */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-center gap-3 border-r border-hairline px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">EmailService</span> separated
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-tint/30 px-5 py-3.5">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">EmailService</span> separated
                </p>
              </div>
            </div>

            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-paper px-5 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 font-mono text-xs font-bold text-green-700">
                  83% structural match
                </span>
                <span className="rounded-full bg-red-100 px-3 py-1 font-mono text-xs font-bold text-red-700">
                  1 missed extraction
                </span>
              </div>
              <span className="font-mono text-xs text-ink-faint">
                explanation provided →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FEATURES ──────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            Features
          </p>
          <h2 className="mb-10 font-serif text-3xl font-medium text-ink">
            Built for active remediation.
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Wrench,
                label: 'Fix mode, not annotate mode',
                desc: 'You restructure the design on the canvas rather than just marking what is wrong. This is hands-on practice, not passive critique.',
              },
              {
                icon: Bug,
                label: 'Real authored scenarios',
                desc: 'Each scenario is based on real system archetypes — notification pipelines, auth modules, booking engines — deliberately designed with specific violations.',
              },
              {
                icon: CheckCircle2,
                label: 'Validation against the clean design',
                desc: 'Your fix is compared structurally against the expected clean design. You see exactly what you got right and what you missed.',
              },
              {
                icon: BookOpen,
                label: 'Explanation per diff',
                desc: 'Every structural difference is explained — why it matters, what the correct reasoning is, and what the clean alternative looks like.',
              },
              {
                icon: Layers,
                label: 'Multiple valid fixes accepted',
                desc: 'Where more than one correct restructuring exists, the validator accepts all known-good approaches and explains the trade-offs between them.',
              },
              {
                icon: Code2,
                label: 'Pattern application focus',
                desc: 'Scenarios are designed around applying specific patterns — SRP extraction, Facade, Repository — so practice builds real pattern vocabulary.',
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-xl border border-hairline bg-paper p-5"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint">
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-brand" />
                </div>
                <div>
                  <p className="mb-1 font-mono text-xs font-bold text-ink">{label}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHO IT'S FOR ──────────────────────────────────── */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            Who it&rsquo;s for
          </p>
          <h2 className="mb-8 font-serif text-3xl font-medium text-ink">
            Built for engineers who want to fix, not just find.
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: 'The hands-on learner',
                desc: 'Engineers who understand design principles in theory but need deliberate practice actually applying them to broken designs.',
              },
              {
                label: 'The refactoring candidate',
                desc: 'Interview candidates preparing for rounds where they are handed an existing design and asked to improve it on the spot.',
              },
              {
                label: 'The Debug Lab graduate',
                desc: 'Anyone who has practised spotting violations in Debug Lab and is now ready to practise fixing them — the natural next step.',
              },
              {
                label: 'The pattern applier',
                desc: 'Engineers who know design pattern names but struggle to recognise when and how to apply them to resolve a real structural problem.',
              },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-5"
              >
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand/40" />
                <div>
                  <p className="mb-1 font-mono text-xs font-bold text-ink">{label}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FAQ + CROSS LINKS ─────────────────────────────── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="/features/debug-and-fix" />
    </main>
  )
}

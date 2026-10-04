import type { Metadata } from 'next'
import Link from 'next/link'
import { Layers, AlertTriangle, GitBranch, CheckCircle2, Shield, ArrowRightLeft, ArrowRight, Pencil } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Refactor — Break Apart Monolithic Designs in LLD | LLDCanvas',
  description:
    'Given a working but poorly structured monolithic design, identify the smells, break it apart, extract services and classes, apply separation of concerns — while keeping it functionally equivalent.',
  keywords: [
    'design refactoring LLD',
    'refactor monolithic design',
    'refactor code for interviews',
    'LLD refactoring practice',
    'separation of concerns practice',
    'extract class exercise',
    'software design refactoring',
  ],
  alternates: { canonical: '/features/refactor' },
  openGraph: {
    title: 'Refactor — Break Apart Monolithic Designs in LLD | LLDCanvas',
    description:
      'Identify design smells, break apart monolithic structures, and apply clean design principles — keeping the system functionally equivalent.',
    type: 'website',
    url: '/features/refactor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refactor — Break Apart Monolithic Designs in LLD | LLDCanvas',
    description:
      'Identify design smells, break apart monolithic structures, and apply clean design principles — keeping the system functionally equivalent.',
  },
}

const FAQ = [
  {
    q: 'What is a refactoring interview question?',
    a: "A refactoring interview question gives you an existing, working system design — usually described as 'legacy code' or 'the current implementation' — and asks you to improve it without changing its external behaviour. The interviewer is testing whether you can identify the structural problems in someone else's design and execute a clean fix under pressure.",
  },
  {
    q: 'How do I know when I am done refactoring?',
    a: 'The validator provides structural feedback that indicates when the key refactoring targets have been addressed. In practice, refactoring has diminishing returns — the goal is to eliminate the identified smells and enforce clean boundaries, not to achieve perfection. The feedback will show when you have addressed the substantive issues.',
  },
  {
    q: 'What smell types appear in Refactor challenges?',
    a: 'The four smell categories are Monolithic (a class or module that handles too many distinct responsibilities), Rigid (a design where a single change requires modifications in many places), Bloated (excessive complexity or unnecessary abstraction), and Fragile (a design where changes frequently break seemingly unrelated parts). Real scenarios typically exhibit two or three of these simultaneously.',
  },
  {
    q: 'Do I refactor in code or UML?',
    a: 'In UML on the LLDCanvas canvas. This keeps the focus on structural design decisions — class boundaries, responsibility allocation, interface placement — rather than implementation syntax. The same structural reasoning applies whether you end up writing Java, Python, or TypeScript.',
  },
  {
    q: 'Is Refactor the same as Debug & Fix?',
    a: 'No. Debug & Fix starts from a broken design — one that violates design principles. Refactor starts from a working design that is merely poorly structured. In Debug & Fix, the system is incorrect; in Refactor, the system works but is hard to maintain, extend, or reason about. The violation types and the correction strategies are different.',
  },
]

export default function RefactorPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Refactor — Break Apart Monolithic Designs in LLD',
          url: 'https://www.lldcanvas.in/features/refactor',
          description:
            'Given a working but poorly structured monolithic design, identify the smells, break it apart, and apply separation of concerns while keeping it functionally equivalent.',
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
              name: 'Refactor',
              item: 'https://www.lldcanvas.in/features/refactor',
            },
          ],
        }}
      />

      {/* ─── Section 1: HERO ─── */}
      <section className="bg-[#FBF9F4] pt-8 pb-0">
        <div className="mx-auto max-w-4xl px-6 text-center">
          {/* Eyebrow */}
          <p className="font-mono text-sm font-semibold tracking-widest uppercase text-[#A6741C] mb-4">
            14 · REFACTOR
          </p>

          {/* H1 */}
          <h1
            className="font-serif text-4xl sm:text-5xl text-[#201F1C] leading-tight mb-6"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Take a monolith apart without breaking it.
          </h1>

          {/* Subtitle */}
          <p className="text-[#74705F] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            A working but bloated design lands in front of you. Identify the smells,
            restructure to clean boundaries, apply separation of concerns — while keeping
            the system functionally equivalent.
          </p>

          {/* CTA */}
          <Link
            href="/dashboard/design-studio/refactor"
            className="inline-flex items-center gap-2 bg-[#234E3F] text-white px-7 py-3 text-base font-semibold hover:bg-[#1c3f33] transition-colors"
          >
            Start refactoring
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ─── 4 Smell Stamps ─── */}
        <div className="flex gap-4 items-center justify-center flex-wrap mt-14 px-6 pb-14">

          {/* Stamp 1: MONOLITHIC */}
          <div
            className="-rotate-3 border-4 border-red-500 bg-red-50 px-6 py-5 rounded-none shadow-sm select-none"
            aria-label="Code smell: Monolithic"
          >
            <p
              className="font-mono font-black uppercase tracking-widest text-xl text-red-500 leading-none"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              MONOLITHIC
            </p>
            <p
              className="font-mono text-xs uppercase tracking-widest text-red-400 mt-1.5"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              does too much
            </p>
          </div>

          {/* Stamp 2: RIGID */}
          <div
            className="rotate-2 border-4 border-orange-500 bg-orange-50 px-6 py-5 rounded-none shadow-sm select-none"
            aria-label="Code smell: Rigid"
          >
            <p
              className="font-mono font-black uppercase tracking-widest text-xl text-orange-500 leading-none"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              RIGID
            </p>
            <p
              className="font-mono text-xs uppercase tracking-widest text-orange-400 mt-1.5"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              hard to change
            </p>
          </div>

          {/* Stamp 3: BLOATED */}
          <div
            className="-rotate-1 border-4 border-amber-500 bg-amber-50 px-6 py-5 rounded-none shadow-sm select-none"
            aria-label="Code smell: Bloated"
          >
            <p
              className="font-mono font-black uppercase tracking-widest text-xl text-amber-500 leading-none"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              BLOATED
            </p>
            <p
              className="font-mono text-xs uppercase tracking-widest text-amber-400 mt-1.5"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              unnecessary complexity
            </p>
          </div>

          {/* Stamp 4: FRAGILE */}
          <div
            className="rotate-3 border-4 border-yellow-600 bg-yellow-50 px-6 py-5 rounded-none shadow-sm select-none"
            aria-label="Code smell: Fragile"
          >
            <p
              className="font-mono font-black uppercase tracking-widest text-xl text-yellow-700 leading-none"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              FRAGILE
            </p>
            <p
              className="font-mono text-xs uppercase tracking-widest text-yellow-600 mt-1.5"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              breaks easily
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 2: MONOLITH BEFORE/AFTER ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            From one tangled class to clean boundaries.
          </h2>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

            {/* BEFORE */}
            <div className="flex-1 max-w-md w-full">
              <div className="bg-orange-50 border-2 border-orange-200 p-5 rounded-none">
                {/* Class header */}
                <div className="bg-orange-200 px-4 py-2 mb-0 -mx-5 -mt-5 border-b-2 border-orange-300">
                  <p
                    className="font-mono font-bold text-orange-900 text-sm"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    &laquo;class&raquo; OrderManager
                  </p>
                </div>
                <div className="mt-4 space-y-1">
                  {[
                    'createOrder()',
                    'cancelOrder()',
                    'sendConfirmation()',
                    'processPayment()',
                    'updateInventory()',
                    'generateInvoice()',
                    'cacheOrder()',
                    'validateAddress()',
                    'applyDiscount()',
                    'logAction()',
                  ].map((method) => (
                    <p
                      key={method}
                      className="font-mono text-xs text-orange-800 py-0.5 border-b border-orange-100 last:border-0"
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      + {method}
                    </p>
                  ))}
                </div>
                {/* Noise arrows */}
                <div className="mt-4 flex flex-wrap gap-1" aria-hidden="true">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="text-orange-300 text-xs font-mono">
                      {i % 2 === 0 ? '→' : '↗'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-mono text-xs text-[#74705F] text-center mt-3" style={{ fontFamily: 'Geist Mono, monospace' }}>
                1 class, 10 responsibilities
              </p>
            </div>

            {/* CENTER ARROW */}
            <div className="flex items-center justify-center lg:pt-24 py-2">
              <div className="flex flex-col items-center gap-2">
                <ArrowRightLeft className="w-8 h-8 text-[#234E3F]" />
                <span className="font-mono text-xs text-[#A69F8C] uppercase tracking-wider" style={{ fontFamily: 'Geist Mono, monospace' }}>
                  refactor
                </span>
              </div>
            </div>

            {/* AFTER */}
            <div className="flex-1 max-w-md w-full">
              <div className="space-y-3">
                {[
                  {
                    name: 'OrderService',
                    methods: ['createOrder()', 'cancelOrder()'],
                    color: 'bg-[#E7F0EB] border-[#234E3F]',
                    header: 'bg-[#234E3F]',
                    text: 'text-white',
                    body: 'text-[#234E3F]',
                  },
                  {
                    name: 'PaymentService',
                    methods: ['processPayment()', 'applyDiscount()'],
                    color: 'bg-blue-50 border-blue-400',
                    header: 'bg-blue-400',
                    text: 'text-white',
                    body: 'text-blue-800',
                  },
                  {
                    name: 'NotificationService',
                    methods: ['sendConfirmation()'],
                    color: 'bg-purple-50 border-purple-400',
                    header: 'bg-purple-400',
                    text: 'text-white',
                    body: 'text-purple-800',
                  },
                  {
                    name: 'InventoryService',
                    methods: ['updateInventory()'],
                    color: 'bg-teal-50 border-teal-500',
                    header: 'bg-teal-500',
                    text: 'text-white',
                    body: 'text-teal-800',
                  },
                ].map((svc) => (
                  <div key={svc.name} className={`border-2 ${svc.color} rounded-none`}>
                    <div className={`${svc.header} px-3 py-1.5`}>
                      <p
                        className={`font-mono font-bold text-xs ${svc.text}`}
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      >
                        &laquo;class&raquo; {svc.name}
                      </p>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      {svc.methods.map((m) => (
                        <p
                          key={m}
                          className={`font-mono text-xs ${svc.body}`}
                          style={{ fontFamily: 'Geist Mono, monospace' }}
                        >
                          + {m}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-mono text-xs text-[#74705F] text-center mt-3" style={{ fontFamily: 'Geist Mono, monospace' }}>
                4 services, 1 responsibility each
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: HOW SMELL TAGGING WORKS ─── */}
      <section className="bg-[#E7F0EB] py-14">
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-4"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Tag what you find before you fix it.
          </h2>
          <p className="text-[#74705F] text-center max-w-xl mx-auto mb-10">
            Structured refactoring starts with diagnosis. Apply smell tags to elements in the
            canvas — then restructure with purpose.
          </p>

          {/* Tag palette demo */}
          <div className="bg-white border border-[#E7E2D6] p-6 rounded-none max-w-2xl mx-auto">
            <p
              className="font-mono text-xs text-[#A69F8C] uppercase tracking-widest mb-4"
              style={{ fontFamily: 'Geist Mono, monospace' }}
            >
              Smell Tags — apply to any canvas element
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 border border-red-300 px-3 py-1.5 rounded-full font-mono text-xs font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                MONOLITHIC
              </span>
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 border border-orange-300 px-3 py-1.5 rounded-full font-mono text-xs font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                RIGID
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-600 border border-amber-300 px-3 py-1.5 rounded-full font-mono text-xs font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                BLOATED
              </span>
              <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1.5 rounded-full font-mono text-xs font-semibold" style={{ fontFamily: 'Geist Mono, monospace' }}>
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                FRAGILE
              </span>
            </div>

            {/* Annotated element mockup */}
            <div className="border-2 border-red-300 bg-red-50 p-4 rounded-none relative">
              <div className="absolute -top-3 -right-2">
                <span className="-rotate-2 inline-block border-2 border-red-500 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-black text-red-500 uppercase tracking-widest rounded-none" style={{ fontFamily: 'Geist Mono, monospace' }}>
                  MONOLITHIC
                </span>
              </div>
              <p className="font-mono font-bold text-xs text-red-800 mb-2" style={{ fontFamily: 'Geist Mono, monospace' }}>
                &laquo;class&raquo; OrderManager
              </p>
              <p className="font-mono text-[11px] text-red-600" style={{ fontFamily: 'Geist Mono, monospace' }}>
                + createOrder() · + cancelOrder() · + processPayment()&hellip;
              </p>
            </div>
          </div>

          {/* Rationale quote */}
          <blockquote className="mt-10 border-l-4 border-[#234E3F] pl-5 max-w-2xl mx-auto">
            <p className="text-[#201F1C] text-lg italic leading-relaxed">
              "Naming the problem before jumping to a fix is what separates structured
              refactoring from blind restructuring."
            </p>
          </blockquote>
        </div>
      </section>

      {/* ─── Section 4: 4-STEP PROCESS ─── */}
      <section className="bg-[#FBF9F4] py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Structured, not scattered.
          </h2>

          <ol className="relative border-l-2 border-[#234E3F] space-y-10 ml-4">
            {[
              {
                step: '01',
                title: 'Study the monolithic design',
                desc: 'Read the existing class diagram carefully. Understand what the system currently does — every method, every relationship, every dependency.',
              },
              {
                step: '02',
                title: 'Identify refactoring opportunities',
                desc: 'Tag elements with smell labels. Mark which classes are MONOLITHIC, which relationships make the design RIGID, where BLOAT accumulates, and what makes it FRAGILE.',
              },
              {
                step: '03',
                title: 'Restructure the design',
                desc: 'Extract classes and services. Define new boundaries. Allocate responsibilities cleanly. Apply Single Responsibility, Dependency Inversion, and Interface Segregation as you go.',
              },
              {
                step: '04',
                title: 'Validate your refactored design',
                desc: 'Run the structural validator. It checks that your refactored design is functionally equivalent, smell-free, and adheres to clean design principles.',
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="pl-8 relative">
                {/* Timeline dot */}
                <span className="absolute -left-[1.15rem] top-0 flex items-center justify-center w-8 h-8 bg-[#234E3F] border-2 border-[#234E3F] rounded-none">
                  <span
                    className="font-mono text-[10px] font-black text-white"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  >
                    {step}
                  </span>
                </span>
                <h3
                  className="font-serif text-xl text-[#201F1C] mb-2"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {title}
                </h3>
                <p className="text-[#74705F] leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Section 5: FEATURES ─── */}
      <section className="bg-white border-y border-[#E7E2D6] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Everything you need to restructure with confidence.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                Icon: Layers,
                title: 'Real monolithic starting points',
                desc: 'Each challenge begins with a realistic, densely-packed monolithic design — not a toy example. The starting design actually works; your job is to make it clean.',
              },
              {
                Icon: AlertTriangle,
                title: 'Smell identification tags',
                desc: 'Apply MONOLITHIC, RIGID, BLOATED, and FRAGILE tags directly to canvas elements. Tagging is part of the exercise — diagnosis before surgery.',
              },
              {
                Icon: GitBranch,
                title: 'Free-form restructuring',
                desc: 'No prescribed path. Extract classes, define interfaces, create new service boundaries — the canvas gives you full structural freedom.',
              },
              {
                Icon: CheckCircle2,
                title: 'Validation feedback',
                desc: 'The validator checks structural health: smell resolution, responsibility allocation, and functional equivalence. Specific, actionable, non-prescriptive.',
              },
              {
                Icon: Shield,
                title: 'SOLID principles naturally applied',
                desc: 'Refactoring well is applying SOLID. SRP emerges from extracting classes. DIP from introducing interfaces. OCP from decoupling change paths.',
              },
              {
                Icon: ArrowRightLeft,
                title: 'Functional equivalence constraint',
                desc: "The refactored design must do everything the original did — just structured better. The constraint keeps you honest: you can't delete functionality to simplify.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#FBF9F4] border border-[#E7E2D6] p-6 rounded-none flex flex-col gap-3"
              >
                <div className="w-9 h-9 bg-[#E7F0EB] flex items-center justify-center rounded-none">
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

      {/* ─── Section 6: WHO IT'S FOR ─── */}
      <section className="bg-[#FBF9F4] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="font-serif text-3xl sm:text-4xl text-[#201F1C] text-center mb-12"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Who should practice Refactor?
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                label: 'Mid-level engineers moving to senior',
                desc: "Senior interviews test whether you can critique and improve existing designs — not just build green-field. Refactor trains exactly that skill: seeing what's wrong and fixing it precisely.",
              },
              {
                label: 'Engineers targeting FAANG / top-tier companies',
                desc: 'Structured refactoring under time pressure is a proxy signal for senior and staff-level engineering judgement. Top companies test it because legacy improvement is real daily work.',
              },
              {
                label: 'Backend engineers practicing system design',
                desc: 'If your system design rounds are strong but your LLD rounds are weak, Refactor is the gap-filler. It bridges the two: structural thinking at the code level.',
              },
              {
                label: 'Self-taught engineers learning design principles',
                desc: "SOLID principles taught through textbooks are abstract. Refactor makes them visceral — you see exactly what breaks when SRP is violated, and you fix it yourself.",
              },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="border border-[#E7E2D6] bg-white p-6 rounded-none flex gap-4"
              >
                <div className="mt-1 shrink-0">
                  <Pencil className="w-4 h-4 text-[#234E3F]" />
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
          {/* Mini stamps — decorative */}
          <div className="flex gap-3 justify-center mb-6 flex-wrap" aria-hidden="true">
            <span className="-rotate-3 border-2 border-red-400 bg-red-950/30 px-2.5 py-1 font-mono text-[10px] font-black text-red-400 uppercase tracking-widest rounded-none" style={{ fontFamily: 'Geist Mono, monospace' }}>MONOLITHIC</span>
            <span className="rotate-2 border-2 border-orange-400 bg-orange-950/30 px-2.5 py-1 font-mono text-[10px] font-black text-orange-400 uppercase tracking-widest rounded-none" style={{ fontFamily: 'Geist Mono, monospace' }}>RIGID</span>
            <span className="-rotate-1 border-2 border-amber-400 bg-amber-950/30 px-2.5 py-1 font-mono text-[10px] font-black text-amber-400 uppercase tracking-widest rounded-none" style={{ fontFamily: 'Geist Mono, monospace' }}>BLOATED</span>
            <span className="rotate-3 border-2 border-yellow-500 bg-yellow-950/30 px-2.5 py-1 font-mono text-[10px] font-black text-yellow-400 uppercase tracking-widest rounded-none" style={{ fontFamily: 'Geist Mono, monospace' }}>FRAGILE</span>
          </div>
          <h2
            className="font-serif text-2xl sm:text-3xl text-white mb-4"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Tag the smells. Untangle the design.
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            The monolith is already on the canvas. Your job is to make it something
            a future engineer can actually work with.
          </p>
          <Link
            href="/dashboard/design-studio/refactor"
            className="inline-flex items-center gap-2 bg-white text-[#234E3F] px-8 py-3 text-base font-semibold hover:bg-[#E7F0EB] transition-colors rounded-none"
          >
            Start refactoring
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Section 7: FAQ + Cross-links ─── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="refactor" />
    </>
  )
}

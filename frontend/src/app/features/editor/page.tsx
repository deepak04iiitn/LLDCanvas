import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Shapes, GitBranch, Layers, Download, Keyboard, Palette } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'UML Class Diagram Editor for LLD Interviews | LLDCanvas',
  description:
    'A UML class diagram editor built specifically for Low-Level Design interviews - 5 node types, 7 relationship types, 23 Gang-of-Four design pattern skeletons, 13 class-role stereotypes, and export to PNG, SVG, PlantUML, Mermaid, and Draft Notation. Free to use, no sign-in required.',
  keywords: [
    'UML class diagram editor', 'UML editor online', 'low level design diagram', 'design patterns UML',
    'class diagram tool', 'LLD diagram editor', 'PlantUML alternative', 'Mermaid alternative',
    'software design tool', 'architecture diagram',
  ],
  alternates: { canonical: '/features/editor' },
  openGraph: {
    title: 'UML Class Diagram Editor - LLDCanvas',
    description: '5 node types, 7 relationship types, 23 design patterns. Built for LLD interviews.',
    type: 'website', url: '/features/editor',
  },
}

const NODE_TYPES = [
  { name: 'Class',         desc: 'Standard OOP class with fields and methods',                  color: 'bg-brand/10 text-brand border-brand/20' },
  { name: 'Interface',     desc: 'Contract definition with method signatures',                   color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { name: 'Enum',          desc: 'Finite set of named constants',                               color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Abstract Class',desc: 'Class with unimplemented abstract methods',                   color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Note',          desc: 'Annotation or comment anchored to the canvas',                color: 'bg-sky-50 text-sky-700 border-sky-200' },
]

const RELATIONSHIP_TYPES = [
  { name: 'Association',    desc: 'A general "uses" link between two classes', line: 'solid',  marker: 'arrow',         ex: 'Order → Customer' },
  { name: 'Aggregation',    desc: '"Has-a" — the part can outlive the whole',  line: 'solid',  marker: 'diamond-open',  ex: 'Team ◇→ Player' },
  { name: 'Composition',   desc: '"Owns-a" — the part dies with the whole',   line: 'solid',  marker: 'diamond-filled', ex: 'House ◆→ Room' },
  { name: 'Inheritance',   desc: 'Subclass extends a superclass',              line: 'solid',  marker: 'triangle',      ex: 'Dog ▷ Animal' },
  { name: 'Realization',   desc: 'Class implements an interface',              line: 'dashed', marker: 'triangle',      ex: 'List ▷ Collection' },
  { name: 'Dependency',    desc: 'Temporary usage between classes',            line: 'dashed', marker: 'arrow',         ex: 'UserService → Email' },
  { name: 'Bidirectional', desc: 'Two-way association',                        line: 'solid',  marker: 'both',          ex: 'User ↔ Address' },
]

const EXPORT_FORMATS = [
  { name: 'PNG',           desc: 'Perfect for slide decks, docs, and Notion pages.' },
  { name: 'SVG',           desc: 'Scales to any size — ideal for technical blog posts.' },
  { name: 'PlantUML',      desc: 'Paste into any tool that accepts PlantUML syntax.' },
  { name: 'Mermaid',       desc: 'Drop straight into GitHub, GitLab, or Notion.' },
  { name: 'Draft Notation', desc: 'Round-trip back to plain-English text.' },
]

const DESIGN_PATTERN_CATEGORIES = [
  { name: 'Creational', count: 5, patterns: ['Singleton', 'Factory Method', 'Abstract Factory', 'Builder', 'Prototype'] },
  { name: 'Structural', count: 7, patterns: ['Adapter', 'Bridge', 'Composite', 'Decorator', 'Facade', 'Flyweight', 'Proxy'] },
  { name: 'Behavioral', count: 11, patterns: ['Chain of Responsibility', 'Command', 'Iterator', 'Mediator', 'Memento', 'Observer', 'State', 'Strategy', 'Template Method', 'Visitor', 'Interpreter'] },
]

const FAQ = [
  {
    q: 'Does the editor work offline or without signing in?',
    a: 'Yes — you can open /editor/local and start drawing immediately with no account. Your diagram is saved to localStorage. Sign in if you want cloud saves, sharing, and collaboration.',
  },
  {
    q: 'How are the 23 design patterns inserted?',
    a: 'Through a command palette. Press Ctrl+K (or ⌘K on Mac) inside the editor, search for a pattern by name, and the correct class skeleton drops into your canvas — all nodes pre-connected with the right relationship types.',
  },
  {
    q: 'What does "correct relationship semantics" mean?',
    a: 'A filled diamond (◆) always means composition — the contained object cannot outlive its container. An open diamond (◇) always means aggregation. An open triangle always means inheritance. LLDCanvas never lets you draw an ambiguous arrow that could be misread as any of those — which is the mistake generic diagramming tools all make.',
  },
  {
    q: 'What are class-role stereotypes?',
    a: 'Labels like «entity», «service», «repository», «factory», or «controller» that annotate a class\'s architectural role. LLDCanvas supports 13 stereotypes rendered in standard UML angle-bracket notation — the same way «interface» is typically shown.',
  },
  {
    q: 'Can I import a diagram from PlantUML or Mermaid?',
    a: 'You can import Draft Notation (our native text format). PlantUML and Mermaid import is on the roadmap.',
  },
  {
    q: 'What happens to my diagram when I export it?',
    a: 'Export renders a pixel-perfect snapshot or the equivalent text syntax — nothing is transmitted to a server. PNG and SVG exports are generated in your browser from the live canvas state.',
  },
]

export default function EditorFeaturePage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'LLDCanvas UML Class Diagram Editor',
        url: 'https://lldcanvas.com/features/editor',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          '5 UML node types', '7 relationship types', '23 design patterns',
          '13 class-role stereotypes', 'Export to PNG SVG PlantUML Mermaid Draft Notation',
        ],
      }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                <span className="text-gold">¶01</span> — The Editor
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
                A UML editor that speaks{' '}
                <span className="text-brand">Low-Level Design.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                Not a generic diagramming tool with UML bolted on — every node type, arrow style, and
                design pattern skeleton is built for the specific vocabulary your interviewer expects.
                Draw the way interviewers think, not the way a project manager thinks.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/editor/local"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Open editor free <ArrowRight size={15} />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            {/* Right — CSS UML diagram mockup */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-xl">
              {/* Toolbar mockup */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-hairline bg-paper px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-400/70" />
                <div className="h-2 w-2 rounded-full bg-amber-400/70" />
                <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
                <div className="mx-2 h-3 w-px bg-hairline-strong" />
                <span className="font-mono text-[10px] text-ink-faint">parking-lot-design.lld</span>
              </div>
              {/* Diagram boxes */}
              <div className="relative space-y-3">
                {/* ParkingLot */}
                <div className="rounded-lg border border-hairline bg-white shadow-sm">
                  <div className="border-b border-hairline bg-brand/5 px-3 py-1.5 text-center font-mono text-[11px] font-bold text-ink">ParkingLot</div>
                  <div className="border-b border-hairline px-3 py-1.5">
                    <p className="font-mono text-[10px] text-ink-muted">- levels: List&lt;Level&gt;</p>
                    <p className="font-mono text-[10px] text-ink-muted">- capacity: int</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="font-mono text-[10px] text-ink-muted">+ getAvailableSpot(): Spot</p>
                    <p className="font-mono text-[10px] text-ink-muted">+ park(vehicle: Vehicle): Ticket</p>
                  </div>
                </div>
                {/* Relationship indicator */}
                <div className="flex items-center gap-2 px-4">
                  <div className="h-px flex-1 border-b border-dashed border-brand/40" />
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[9px] text-brand">◆ owns</span>
                  <div className="h-px flex-1 border-b border-dashed border-brand/40" />
                </div>
                {/* Level */}
                <div className="mx-6 rounded-lg border border-hairline bg-white shadow-sm">
                  <div className="border-b border-hairline bg-violet-50 px-3 py-1.5 text-center font-mono text-[11px] font-bold text-ink">Level</div>
                  <div className="border-b border-hairline px-3 py-1.5">
                    <p className="font-mono text-[10px] text-ink-muted">- spots: List&lt;Spot&gt;</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="font-mono text-[10px] text-ink-muted">+ getFreeSpot(): Spot</p>
                  </div>
                </div>
                {/* Stats strip on mockup */}
                <div className="mt-2 flex items-center justify-between rounded-lg border border-hairline bg-paper px-4 py-2">
                  <span className="font-mono text-[9px] text-ink-faint">5 nodes · 3 edges</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] text-emerald-600">Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-b border-hairline bg-paper-elevated/60">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: '5',  label: 'node types' },
              { value: '7',  label: 'relationship types' },
              { value: '23', label: 'design patterns' },
              { value: '13', label: 'class-role stereotypes' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Node types ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§1</span> — Node types
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          Five node types. Every UML class diagram need covered.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Each node renders its stereotype in standard UML notation — «interface», «abstract»,
          «enum» — so your diagram communicates the same vocabulary your interviewer uses,
          without manual formatting.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NODE_TYPES.map(n => (
            <div key={n.name} className={`rounded-xl border p-4 ${n.color}`}>
              <div className="mb-1 flex items-center gap-2">
                <Shapes size={14} />
                <span className="font-mono text-xs font-bold">{n.name}</span>
              </div>
              <p className="text-[12px] opacity-80">{n.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Relationship types ────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§2</span> — Relationship types
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
            Seven relationship types. Drawn correctly, every time.
          </h2>
          <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            The most common mistake in LLD interviews is confusing aggregation and composition,
            or drawing dependency as a plain arrow. LLDCanvas enforces the correct arrowhead
            for each relationship — you choose the type, we render the right symbol.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="pb-3 pr-4 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Relationship</th>
                  <th className="pb-3 pr-4 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Meaning</th>
                  <th className="pb-3 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {RELATIONSHIP_TYPES.map(r => (
                  <tr key={r.name} className="group transition-colors hover:bg-paper-elevated/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-0.5 w-6 ${r.line === 'dashed' ? 'border-t border-dashed border-ink-muted' : 'bg-ink-muted'}`} />
                        <span className="font-mono text-[12px] font-semibold text-ink">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-ink-muted">{r.desc}</td>
                    <td className="py-3 font-mono text-[11px] text-brand">{r.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              <strong className="font-semibold text-ink">Pro tip:</strong> You don&apos;t need to memorize the arrowheads.
              When you draw a connection in LLDCanvas, a tooltip shows the relationship options — select one and the
              correct symbol renders automatically. This is also how you practice remembering them.
            </p>
          </div>
        </div>
      </section>

      {/* ── Design patterns ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§3</span> — Design patterns
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          All 23 Gang-of-Four patterns, pre-wired and interview-ready.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Press Ctrl+K, type the pattern name, and the full class skeleton — with all nodes correctly
          connected — drops onto your canvas. No more manually drawing the Observer pattern from
          memory under interview pressure.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {DESIGN_PATTERN_CATEGORIES.map(cat => (
            <div key={cat.name} className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink-faint">{cat.name}</h3>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand">{cat.count}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.patterns.map(p => (
                  <span key={p} className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-muted">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-ink-muted">
          Looking for a deep-dive on any of these?{' '}
          <Link href="/features/revision-notes" className="text-brand hover:underline">
            Browse the revision notes →
          </Link>
        </p>
      </section>

      {/* ── Export formats ────────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§4</span> — Export formats
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
            Five export formats. Your diagram goes where you go.
          </h2>
          <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Export for a blog post, a PR description, a Notion doc, or a slide deck — whichever
            format your next audience expects, LLDCanvas has you covered.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPORT_FORMATS.map(f => (
              <div key={f.name} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-4">
                <Download size={14} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="font-mono text-sm font-bold text-ink">{f.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-ink-muted">
            Export is a{' '}
            <Link href="/pricing" className="text-brand hover:underline">Pro and Ultimate</Link>
            {' '}feature. Free accounts can export as Draft Notation.
          </p>
        </div>
      </section>

      {/* ── Editor capabilities ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§5</span> — Built for speed
        </p>
        <h2 className="mb-8 font-serif text-2xl font-medium text-ink">
          Keyboard-first, drag-to-connect, and blazing fast.
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Keyboard, title: 'Command palette', body: 'Ctrl+K opens pattern search, shape insertion, and quick commands — no menu hunting.' },
            { icon: GitBranch, title: 'Drag-to-connect', body: 'Drag from any port on a node to create a relationship. The correct arrow renders as you drop.' },
            { icon: Layers, title: 'Alignment guides', body: 'Smart snapping and alignment guides keep your diagram clean, even on large canvases.' },
            { icon: Palette, title: 'Three canvas themes', body: 'Light, dark, and blueprint themes — switch any time without altering your diagram.' },
            { icon: Check, title: 'Undo / redo', body: 'Full history stack. Ctrl+Z / Ctrl+Shift+Z — works the way you expect it to.' },
            { icon: ArrowRight, title: 'Multiple select', body: 'Box-select a group of nodes, move them together, or delete them in one action.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <Icon size={14} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark CTA ──────────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-[#14130f] py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left lg:gap-12">
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-medium text-white">
                Open the editor and draw your first diagram now.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                No sign-in required. Saves to your browser. Upgrade later if you want cloud saves,
                design pattern templates, and export formats.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 lg:justify-start justify-center">
                <Link
                  href="/editor/local"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-hover"
                >
                  Open editor free <ArrowRight size={14} />
                </Link>
                <Link
                  href="/features/draft-notation"
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white"
                >
                  Try Draft Notation
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-sm">
                <p className="text-emerald-400">// Ctrl+K → "Observer"</p>
                <p className="mt-2 text-white/40">class <span className="text-amber-300">EventEmitter</span> {'{'}</p>
                <p className="ml-4 text-white/40">- listeners: Map</p>
                <p className="ml-4 text-white/60">+ subscribe(event, fn)</p>
                <p className="ml-4 text-white/60">+ emit(event, data)</p>
                <p className="text-white/40">{'}'}</p>
                <p className="mt-2 text-white/40">class <span className="text-amber-300">EventListener</span> {'{'}</p>
                <p className="ml-4 text-white/60">+ onEvent(data)</p>
                <p className="text-white/40">{'}'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureFaq items={FAQ} />

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/features/draft-notation',    label: 'Draft Notation — write UML in plain English' },
            { href: '/features/interview-mode',     label: 'Interview Mode — timed practice sessions' },
            { href: '/features/interview-questions', label: 'Practice Problems — 100+ LLD questions' },
            { href: '/features/code-execution',     label: 'Code Execution — run code next to your diagram' },
            { href: '/features/collaboration',      label: 'Collaboration — design with teammates' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-brand/30 hover:text-brand"
            >
              {l.label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      </section>

      <FeatureCrossLinks exclude="/features/editor" />
    </div>
  )
}

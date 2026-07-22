import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, ArrowLeftRight, GitBranch, Cpu, FileText } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Draft Notation - Plain-English UML Diagramming Language | LLDCanvas',
  description:
    'Draft Notation is LLDCanvas\'s own plain-English UML language. Write "User has many Order" and get a proper class diagram with arrows and multiplicity drawn live. No drag-and-drop, no angle brackets, no learning curve. Try it free in the Playground.',
  keywords: [
    'plain english UML', 'UML text language', 'code to diagram', 'text based UML',
    'UML DSL', 'diagram as code', 'Draft Notation', 'PlantUML alternative',
    'UML class diagram from text', 'LLD diagramming language',
  ],
  alternates: { canonical: '/features/draft-notation' },
  openGraph: {
    title: 'Draft Notation — Plain-English UML - LLDCanvas',
    description: 'Write "User has many Order" and see a UML diagram draw itself in real time.',
    type: 'website', url: '/features/draft-notation',
  },
}

const SYNTAX_TABS = [
  {
    label: 'Relationships',
    code: `User has many Order
Order owns OrderItem
Payment implements Payable
Delivery extends BaseShipping`,
    note: 'has many → 1-to-many, owns → composition, implements → realization, extends → inheritance',
  },
  {
    label: 'Fields',
    code: `User knows id, name: String, email: String, age: int
Product knows sku: String, price: float, stock: int
Order knows id: UUID, status: OrderStatus, total: Money`,
    note: '"knows" declares fields. Type annotations are optional but recommended.',
  },
  {
    label: 'Methods',
    code: `User can login(), logout(), getProfile(): Profile
Order can place(), cancel(), getTotal(): Money
Product can isAvailable(): bool, restock(qty: int)`,
    note: '"can" declares methods. Return types follow the colon.',
  },
  {
    label: 'Interfaces',
    code: `interface Repository
  findById(id: String): Entity
  save(entity: Entity): void
  delete(id: String): void`,
    note: 'Interfaces are rendered with the «interface» stereotype in correct UML notation.',
  },
  {
    label: 'Enums',
    code: `enum OrderStatus
  PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

enum PaymentMethod
  CARD, UPI, NETBANKING, WALLET`,
    note: 'Enum members are auto-spaced in the rendered diagram.',
  },
]

const RELATIONSHIP_KEYWORDS = [
  { keyword: 'has',        semantic: 'Association',   ex: 'User has Address' },
  { keyword: 'has many',   semantic: 'One-to-many',   ex: 'User has many Order' },
  { keyword: 'owns',       semantic: 'Composition',   ex: 'Order owns OrderItem' },
  { keyword: 'uses',       semantic: 'Dependency',    ex: 'Controller uses Service' },
  { keyword: 'implements', semantic: 'Realization',   ex: 'List implements Collection' },
  { keyword: 'extends',    semantic: 'Inheritance',   ex: 'Dog extends Animal' },
  { keyword: 'includes',   semantic: 'Aggregation',   ex: 'Team includes Player' },
]

const FAQ = [
  {
    q: 'Is Draft Notation the same as PlantUML or Mermaid?',
    a: 'No — and that\'s the point. PlantUML and Mermaid require you to learn their specific syntax (colons, arrows, pipe characters). Draft Notation uses natural English: "User has many Order" is the entire line. There are no brackets, no prefix characters, and no boilerplate — just the sentence you\'d say out loud.',
  },
  {
    q: 'Does Draft Notation replace the drag-and-drop editor?',
    a: 'No — it\'s a second way in. Use Draft Notation when you\'re faster at typing than clicking (common in interviews, or when describing a design verbally). Use the drag-and-drop editor when you want fine-grained control over layout. Both produce the same internal diagram representation and both can be exported.',
  },
  {
    q: 'Can I convert an existing drag-and-drop diagram back to Draft Notation text?',
    a: 'Yes — Draft Notation round-trips both ways. Any diagram you\'ve built visually (or rearranged on the canvas) can be exported back to its plain-English source at any time using the Export → Draft Notation option.',
  },
  {
    q: 'Do I need to create an account to try Draft Notation?',
    a: 'No — the Playground runs the exact same parser with zero sign-in required. Try the full syntax before deciding whether to create an account.',
  },
  {
    q: 'How fast does it render?',
    a: 'Under a millisecond for parsing, with a 400ms debounce so it doesn\'t re-render on every keystroke while you\'re mid-sentence. In practice it feels instant — not like a build step.',
  },
  {
    q: 'Can I write a complex design pattern in Draft Notation?',
    a: 'Yes — every Gang-of-Four pattern can be expressed in Draft Notation. The Observer pattern, for instance, is four lines: "EventEmitter has many EventListener", "EventListener implements Observer", and the two field lines. The editor also lets you insert patterns from the command palette and export them to Draft Notation to learn the syntax.',
  },
]

export default function DraftNotationFeaturePage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Draft Notation — Plain-English UML',
        url: 'https://lldcanvas.com/features/draft-notation',
        description: 'LLDCanvas\'s own plain-English UML diagramming language. Write diagrams in natural language.',
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
                <span className="text-gold">¶02</span> — Draft Notation
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Say it in English.{' '}
                <span className="text-brand">See it as UML.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                No angle brackets, no special syntax, no learning curve. Write the sentence you&apos;d
                say out loud in an interview — Draft Notation parses every keystroke and draws a
                proper UML class diagram with correct relationship semantics, live.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/playground"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Try in Playground <ArrowRight size={15} />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
                >
                  Full syntax reference
                </Link>
              </div>
            </div>

            {/* Right — before/after transformation visual */}
            <div className="flex flex-col gap-3">
              {/* Input */}
              <div className="overflow-hidden rounded-xl border border-hairline-strong shadow-lg">
                <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#1a1916] px-4 py-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 font-mono text-[10px] text-white/30">design.draft</span>
                </div>
                <pre className="bg-[#14130f] px-5 py-4 font-mono text-[13px] leading-[2] text-emerald-300/90">
{`User has many Order
Order owns OrderItem
Payment implements Payable`}
                </pre>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5">
                  <Zap size={12} className="text-brand" />
                  <span className="font-mono text-[10px] font-bold text-brand uppercase tracking-wider">renders instantly</span>
                </div>
              </div>

              {/* Output — CSS diagram */}
              <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
                <div className="space-y-2">
                  {/* User box */}
                  <div className="mx-auto w-32 rounded border border-hairline bg-white shadow-sm">
                    <div className="border-b border-hairline bg-brand/5 px-2 py-1 text-center font-mono text-[10px] font-bold">User</div>
                    <div className="px-2 py-1 font-mono text-[9px] text-ink-muted">+ id: String</div>
                  </div>
                  {/* 1..* arrow */}
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-px w-12 bg-ink-muted/30" />
                    <span className="font-mono text-[9px] text-ink-faint">1..*</span>
                    <div className="h-px w-12 bg-ink-muted/30" />
                  </div>
                  {/* Order box */}
                  <div className="mx-auto w-36 rounded border border-hairline bg-white shadow-sm">
                    <div className="border-b border-hairline bg-violet-50 px-2 py-1 text-center font-mono text-[10px] font-bold">Order</div>
                    <div className="border-b border-hairline px-2 py-1 font-mono text-[9px] text-ink-muted">+ id: UUID</div>
                    <div className="px-2 py-1 font-mono text-[9px] text-ink-muted">+ place()</div>
                  </div>
                  {/* Composition arrow */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[9px] text-ink-faint">◆</span>
                    <div className="h-px w-10 border-t border-dashed border-ink-muted/30" />
                    <span className="font-mono text-[9px] text-ink-faint">owns</span>
                    <div className="h-px w-10 border-t border-dashed border-ink-muted/30" />
                  </div>
                  {/* OrderItem box */}
                  <div className="mx-auto w-28 rounded border border-hairline bg-white shadow-sm">
                    <div className="px-2 py-1 text-center font-mono text-[10px] font-bold">OrderItem</div>
                  </div>
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
              { value: '7',     label: 'relationship keywords' },
              { value: '<1ms',  label: 'parse time per keystroke' },
              { value: '2-way', label: 'round-trip export' },
              { value: '0',     label: 'sign-ins to try it' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Relationship keywords ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§1</span> — Relationship keywords
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          Seven keywords. Every UML relationship covered.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Each keyword maps directly to a precise UML relationship type — the arrow, arrowhead, and
          line style are all determined by the word you choose, not by a separate UI selection step.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="pb-3 pr-6 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Keyword</th>
                <th className="pb-3 pr-6 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">UML Relationship</th>
                <th className="pb-3 text-left font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {RELATIONSHIP_KEYWORDS.map(r => (
                <tr key={r.keyword} className="group hover:bg-paper-elevated/40">
                  <td className="py-3 pr-6">
                    <code className="rounded-md border border-hairline bg-paper px-2.5 py-1 font-mono text-[12px] font-bold text-brand">{r.keyword}</code>
                  </td>
                  <td className="py-3 pr-6 text-sm text-ink-muted">{r.semantic}</td>
                  <td className="py-3 font-mono text-[12px] text-emerald-600">{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Syntax reference ──────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-[#14130f] py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-emerald-400/60 uppercase">
            <span className="text-emerald-400">§2</span> — Syntax reference
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-white">
            The complete syntax, in five patterns.
          </h2>
          <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-white/50">
            Draft Notation covers five core patterns. Once you know these, you can describe any class diagram
            from memory — which is exactly what you need in an interview.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SYNTAX_TABS.map(tab => (
              <div key={tab.label} className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">{tab.label}</span>
                <pre className="font-mono text-[12px] leading-[1.9] whitespace-pre-wrap text-emerald-300/90">{tab.code}</pre>
                <p className="text-[11px] leading-relaxed text-white/30 border-t border-white/[0.06] pt-3">{tab.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/playground"
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Try it live <ArrowRight size={14} />
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:border-white/20 hover:text-white"
            >
              Full docs <FileText size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why text beats drag-and-drop ──────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§3</span> — Why text-first diagramming works
        </p>
        <h2 className="mb-8 font-serif text-2xl font-medium text-ink">
          Three reasons engineers reach for Draft Notation first.
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Cpu,
              title: 'Speed of thought',
              body: 'Typing "User has many Order" takes two seconds. Dragging a 1-to-many association between two nodes in a UI takes ten. In a 45-minute interview, that gap compounds quickly.',
            },
            {
              icon: ArrowLeftRight,
              title: 'Round-trip editing',
              body: 'Start in Draft Notation, switch to the visual editor to rearrange nodes, then export back to text. Both modes stay in sync — no lock-in, no information loss.',
            },
            {
              icon: GitBranch,
              title: 'Version-control friendly',
              body: 'Plain text diffs cleanly. Paste a Draft Notation diagram into a git commit, a Notion page, or a Slack message — it\'s readable anywhere, even without the renderer.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                <Icon size={16} className="text-brand" />
              </div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-[13px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§4</span> — How it compares
          </p>
          <h2 className="mb-8 font-serif text-2xl font-medium text-ink">
            Draft Notation vs other text-to-diagram tools.
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="pb-3 pr-6 text-left font-mono text-[10px] text-ink-faint uppercase">Feature</th>
                  <th className="pb-3 pr-6 text-center font-mono text-[10px] text-brand uppercase">Draft Notation</th>
                  <th className="pb-3 pr-6 text-center font-mono text-[10px] text-ink-faint uppercase">PlantUML</th>
                  <th className="pb-3 text-center font-mono text-[10px] text-ink-faint uppercase">Mermaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-[13px]">
                {[
                  { feature: 'Natural language syntax',     draft: '✓', plant: '✗', mermaid: '✗' },
                  { feature: 'Live preview',                draft: '✓', plant: '~', mermaid: '✓' },
                  { feature: 'No installation required',    draft: '✓', plant: '✗', mermaid: '✓' },
                  { feature: 'Round-trip to visual editor', draft: '✓', plant: '✗', mermaid: '✗' },
                  { feature: 'Integrated with code runner', draft: '✓', plant: '✗', mermaid: '✗' },
                  { feature: 'Design pattern skeletons',    draft: '✓', plant: '✗', mermaid: '✗' },
                ].map(row => (
                  <tr key={row.feature} className="hover:bg-paper-elevated/60">
                    <td className="py-3 pr-6 text-ink-muted">{row.feature}</td>
                    <td className="py-3 pr-6 text-center font-bold text-brand">{row.draft}</td>
                    <td className="py-3 pr-6 text-center text-ink-faint">{row.plant}</td>
                    <td className="py-3 text-center text-ink-faint">{row.mermaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FeatureFaq items={FAQ} />

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/features/editor',             label: 'UML Editor — drag-and-drop diagramming' },
            { href: '/playground',                   label: 'Playground — try Draft Notation now' },
            { href: '/features/code-execution',      label: 'Code Execution — implement your design' },
            { href: '/features/interview-questions', label: 'Practice Problems — apply your skills' },
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

      <FeatureCrossLinks exclude="/features/draft-notation" />
    </div>
  )
}

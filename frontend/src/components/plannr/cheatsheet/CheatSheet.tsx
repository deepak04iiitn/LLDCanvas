'use client'

import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'

const SECTIONS = [
  {
    title: '🔍 Phase 1 — Clarify Requirements (2–3 min)',
    color: 'border-blue-200 bg-blue-50',
    titleColor: 'text-blue-800',
    items: [
      'Ask: "What is the core use-case I need to design for?"',
      'Ask: "Who are the primary actors / users?"',
      'Ask: "What scale should I assume — small/medium/large?"',
      'Confirm: "Am I designing the full system or one component?"',
      'Repeat back your understanding before designing.',
    ],
  },
  {
    title: '📦 Phase 2 — Identify Entities (2 min)',
    color: 'border-violet-200 bg-violet-50',
    titleColor: 'text-violet-800',
    items: [
      'Write out every noun in the problem statement.',
      'Each noun is a candidate class.',
      'Group related nouns into single classes.',
      'Separate data-holders from behaviour-owners.',
      'Identify which entity is the "entry point" (main class).',
    ],
  },
  {
    title: '🏗️ Phase 3 — Design Classes (5–7 min)',
    color: 'border-amber-200 bg-amber-50',
    titleColor: 'text-amber-800',
    items: [
      'For each entity: define fields (data) and methods (behaviour).',
      'Apply SRP: one class → one reason to change.',
      'Use encapsulation: keep fields private, expose via methods.',
      'Prefer composition over inheritance where possible.',
      'Add interfaces/abstractions for things that vary.',
    ],
  },
  {
    title: '🔗 Phase 4 — Define Relationships (2–3 min)',
    color: 'border-green-200 bg-green-50',
    titleColor: 'text-green-800',
    items: [
      'Inheritance (IS-A): only when there\'s a true parent-child.',
      'Composition (HAS-A): strong ownership — child dies with parent.',
      'Aggregation (HAS-A): weak ownership — child lives independently.',
      'Association: two classes know about each other.',
      'Draw arrows in your head; explain each relationship aloud.',
    ],
  },
  {
    title: '🧩 Phase 5 — Apply Patterns (2 min)',
    color: 'border-rose-200 bg-rose-50',
    titleColor: 'text-rose-800',
    items: [
      'Factory: when object creation logic is complex.',
      'Singleton: when only one instance is needed (e.g. Registry).',
      'Observer: when one event triggers many listeners.',
      'Strategy: when behaviour needs to be swappable at runtime.',
      'State: when an object has distinct modes (e.g. Order status).',
    ],
  },
  {
    title: '⚖️ Phase 6 — Discuss Trade-offs (2 min)',
    color: 'border-teal-200 bg-teal-50',
    titleColor: 'text-teal-800',
    items: [
      'Always state what you sacrificed and why.',
      '"I chose composition over inheritance because…"',
      '"This design doesn\'t scale to X because…"',
      '"If requirements change, I would modify Y to…"',
      'Show awareness: coupling, cohesion, extensibility.',
    ],
  },
  {
    title: '💬 PDTB Framework — For Every Decision',
    color: 'border-indigo-200 bg-indigo-50',
    titleColor: 'text-indigo-800',
    items: [
      'P — Problem: "The problem here is…"',
      'D — Decision: "I decided to use…"',
      'T — Trade-off: "The trade-off is…"',
      'B — Benefit: "The benefit is…"',
      'Practice saying this out loud until it\'s automatic.',
    ],
  },
  {
    title: '🚫 Common Mistakes to Avoid',
    color: 'border-red-200 bg-red-50',
    titleColor: 'text-red-800',
    items: [
      'Starting to code before clarifying requirements.',
      'Using inheritance when composition is better.',
      'Making everything public (breaks encapsulation).',
      'Not mentioning patterns even when you use them.',
      'Staying silent — narrate your thought process always.',
      'Over-engineering: YAGNI (You Aren\'t Gonna Need It).',
    ],
  },
  {
    title: '✅ Interview Checklist',
    color: 'border-gray-200 bg-gray-50',
    titleColor: 'text-gray-800',
    items: [
      '☐ Clarified requirements and repeated them back',
      '☐ Identified all entities / classes',
      '☐ Defined attributes and methods for each class',
      '☐ Explained relationships (IS-A vs HAS-A)',
      '☐ Applied at least one design pattern with justification',
      '☐ Discussed trade-offs and extensibility',
      '☐ Handled at least one follow-up question',
    ],
  },
]

export function CheatSheet() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
          {/* Header */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Pre-Interview Cheat Sheet</h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
              Read this 10 minutes before your interview. Covers the full LLD process in one page.
            </p>
          </div>

          {/* Print button */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-hairline text-[13px] text-ink-muted hover:bg-paper-elevated transition-colors"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>

          {/* Sections grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {SECTIONS.map(s => (
              <div key={s.title} className={`rounded-2xl border p-5 space-y-3 ${s.color}`}>
                <h2 className={`font-medium text-[14px] ${s.titleColor}`}>{s.title}</h2>
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-ink-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Good luck */}
          <div className="rounded-2xl bg-brand-tint/30 border border-brand/20 p-6 text-center">
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-serif text-xl font-medium text-ink">You've got this!</p>
            <p className="text-[13px] text-ink-muted mt-1">Remember: narrate your thinking, clarify before designing, and always discuss trade-offs.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

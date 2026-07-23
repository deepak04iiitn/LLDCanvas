'use client'

import Link from 'next/link'
import { ArrowRight, MousePointer2 } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { Reveal } from '@/components/features/Reveal'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CREDITS = [
  { title: 'Live cursors and presence',  credit: 'Starring everyone'          },
  { title: '@mention comments',          credit: "Director's cut included"     },
  { title: 'Invite by email or link',    credit: 'Opens in seconds'            },
  { title: 'Instant canvas sync',        credit: 'Under 100ms · WebSocket'     },
  { title: 'Role-based access',          credit: 'Enforced server-side'        },
  { title: 'Collaboration dashboard',    credit: 'Full activity history'       },
]

const ACTS = [
  {
    roman: 'I',
    tag: 'Most popular',
    title: 'The Mock Interview',
    subtitle: 'Design under observation. Get feedback in real time.',
    body: "One person designs on the canvas — timed, with Interview Mode — while a friend or mentor watches via a Viewer link and leaves feedback through @mention comments. Identical to a real interview observation format. The observer can't modify the canvas, but their presence and comments are felt in real time.",
    participants: [
      { name: 'You',    role: 'Designer · Editor', color: 'bg-brand'       },
      { name: 'Mentor', role: 'Observer · Viewer',  color: 'bg-violet-500' },
    ],
  },
  {
    roman: 'II',
    tag: 'Teams',
    title: 'The Design Review',
    subtitle: 'The whole team. The same canvas. No PNG exports.',
    body: "Share a diagram with your tech team. Everyone joins as a Viewer or Editor. Comments, annotations, and design changes happen in real time — no need to export a PNG and paste it into Slack. Async feedback and live discussion in the same thread. The canvas is the single source of truth.",
    participants: [
      { name: 'You',  role: 'Owner · Editor',          color: 'bg-brand'       },
      { name: 'Team', role: 'Reviewers · Mixed roles',  color: 'bg-amber-500'  },
    ],
  },
  {
    roman: 'III',
    tag: 'Mentorship',
    title: 'The Guided Session',
    subtitle: 'A senior engineer, same canvas, guiding in real time.',
    body: "A senior engineer joins as an Editor alongside a junior. They can guide by adding nodes, correcting relationships, and leaving detailed comments — working on exactly the same canvas, together, without friction or lag. No screenshare, no out-of-sync copies.",
    participants: [
      { name: 'Junior', role: 'Learner · Editor', color: 'bg-amber-500' },
      { name: 'Senior', role: 'Guide · Editor',   color: 'bg-brand'      },
    ],
  },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Create invite',          detail: 'Enter email, pick Editor or Viewer role. Invitation sent immediately.' },
  { step: '2', title: 'Collaborator accepts',   detail: 'They open the link, authenticate, and join the canvas.'               },
  { step: '3', title: 'Live session',           detail: 'Cursors appear, edits sync in real time via WebSocket.'               },
  { step: '4', title: 'Comment and review',     detail: '@mention comments appear in all panels instantly.'                    },
]

const FAQ = [
  {
    q: 'How many people can collaborate on one diagram?',
    a: 'Pro plans support up to 3 collaborators per diagram. Ultimate supports unlimited collaborators per diagram.',
  },
  {
    q: 'How do I invite someone to collaborate?',
    a: "Click the Collaborate button in the editor toolbar. Enter their email address and assign a viewer or editor role. They receive an invitation link — the moment they accept, they appear in the live presence stack and their cursor becomes visible on the canvas.",
  },
  {
    q: 'Can I control who can edit vs. who can only view?',
    a: "Yes — two roles are available per invitation: Editor (can modify nodes and relationships) and Viewer (can view and comment, but not modify the canvas). Role changes take effect instantly without a re-invite.",
  },
  {
    q: 'Do comments stay attached to the diagram?',
    a: "Yes — comments in the Discussion panel are tied to the diagram session. You can @mention any collaborator and they'll see a badge count on the Comments button in real time.",
  },
  {
    q: 'Is this useful for mock interviews?',
    a: "Yes — a very common use case is one person designing on the canvas while a friend, mentor, or senior engineer watches live and leaves questions or feedback via @mention comments — simulating a real whiteboard interview with an observer.",
  },
  {
    q: 'What happens if the collaboration connection drops?',
    a: "The canvas autosaves your work continuously. If a collaborator disconnects, they can rejoin from the same link — their cursor reappears and the canvas state re-syncs immediately.",
  },
  {
    q: 'Can I use collaboration for a team design review?',
    a: "Yes — invite your whole team (Ultimate plan), share the canvas link, and have everyone annotate via comments simultaneously. It's the same workflow as a Figma review session, but for LLD class diagrams.",
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function CollaborationPageClient() {
  return (
    <div className="overflow-hidden">

      {/* ════════════════════ HERO — The Stage ════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-hairline">

        {/* Spotlight cone from above */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 55% at 50% -8%, rgba(35,78,63,0.065) 0%, transparent 62%)' }}
          aria-hidden
        />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-12 sm:px-8 sm:pt-16">

          {/* Headline — centered, theatrical */}
          <Reveal>
            <p className="mb-5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">¶07</span>&nbsp;—&nbsp;Collaboration
            </p>
            <h1 className="mb-4 text-center font-serif text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.06] tracking-tight text-ink">
              Design under the spotlight.<br />
              <span className="italic text-brand">That&apos;s an LLD interview.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-center text-[15px] leading-[1.8] text-ink-muted">
              Real LLD interviews are observed events. Collaboration lets you practice exactly
              that dynamic — invite a teammate or mentor, design while they watch, and get
              live @mention feedback. No refresh. No lag.
            </p>
          </Reveal>

          {/* Canvas "on stage" */}
          <Reveal delay={0.12}>
            <div className="mx-auto max-w-3xl">
              {/* The stage mockup */}
              <div
                className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper"
                style={{ boxShadow: '0 20px 80px rgba(35,78,63,0.10), 0 4px 20px rgba(0,0,0,0.06)' }}
              >
                {/* Canvas toolbar */}
                <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-5 py-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                    Parking Lot Design
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Presence stack */}
                    <div className="flex">
                      {[
                        { initial: 'D', bg: 'bg-brand' },
                        { initial: 'P', bg: 'bg-violet-500' },
                        { initial: 'A', bg: 'bg-amber-500' },
                      ].map(({ initial, bg }, i) => (
                        <div
                          key={initial}
                          className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-bold text-white ring-2 ring-paper-elevated ${bg} ${i > 0 ? '-ml-1.5' : ''}`}
                        >
                          {initial}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="font-mono text-[9px] font-bold text-emerald-600">3 live</span>
                    </div>
                  </div>
                </div>

                {/* Canvas area */}
                <div className="relative h-44 bg-paper">
                  {/* UML nodes */}
                  <div className="absolute left-5 top-4 w-28 overflow-hidden rounded border border-hairline bg-white shadow-sm">
                    <div className="border-b border-hairline bg-brand/5 px-2 py-1 text-center font-mono text-[9px] font-bold text-brand">
                      ParkingLot
                    </div>
                    <div className="px-2 py-1.5 font-mono text-[8px] text-ink-muted">
                      + getSpot(): Spot
                    </div>
                  </div>
                  <div className="absolute right-5 top-5 w-24 overflow-hidden rounded border border-hairline bg-white shadow-sm">
                    <div className="border-b border-hairline bg-violet-50 px-2 py-1 text-center font-mono text-[9px] font-bold text-violet-700">
                      Level
                    </div>
                    <div className="px-2 py-1.5 font-mono text-[8px] text-ink-muted">
                      - spots: List
                    </div>
                  </div>
                  {/* Live cursors */}
                  <div className="absolute left-36 top-8 flex items-center gap-1">
                    <MousePointer2 size={12} className="text-brand" />
                    <span className="rounded bg-brand px-1.5 py-0.5 font-mono text-[8px] font-bold text-white">Deepak</span>
                  </div>
                  <div className="absolute bottom-8 right-14 flex items-center gap-1">
                    <MousePointer2 size={12} className="text-violet-500" />
                    <span className="rounded bg-violet-500 px-1.5 py-0.5 font-mono text-[8px] font-bold text-white">Priya</span>
                  </div>
                  <div className="absolute bottom-4 left-8 flex items-center gap-1">
                    <MousePointer2 size={12} className="text-amber-500" />
                    <span className="rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[8px] font-bold text-white">Arjun</span>
                  </div>
                </div>

                {/* @mention comment strip */}
                <div className="border-t border-hairline bg-paper-elevated px-5 py-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 font-mono text-[8px] font-bold text-white">
                      P
                    </div>
                    <p className="font-mono text-[10px] text-ink-muted">
                      <span className="font-bold text-violet-700">@Deepak</span>
                      {' '}shouldn&apos;t this be composition, not aggregation?
                    </p>
                  </div>
                </div>
              </div>

              {/* Audience seat badges below the canvas */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: 'You · Editor',       cls: 'border-brand/30 bg-brand/5 text-brand'           },
                  { label: 'Mentor · Viewer',     cls: 'border-violet-200 bg-violet-50 text-violet-700'  },
                  { label: 'Teammate · Editor',   cls: 'border-amber-200 bg-amber-50 text-amber-700'     },
                ].map(s => (
                  <span
                    key={s.label}
                    className={`rounded-full border px-3 py-1 font-mono text-[9px] font-bold ${s.cls}`}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
              >
                Start collaborating <ArrowRight size={14} />
              </Link>
              <Link
                href="/features/interview-mode"
                className="flex items-center gap-2 rounded-xl border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
              >
                Try Interview Mode
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ STATS ═══════════════════════════════════════ */}
      <Reveal>
        <section className="border-b border-hairline bg-paper-elevated/60">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
              {[
                { value: '∞',  label: 'collaborators (Ultimate)' },
                { value: '0',  label: 'refreshes needed'         },
                { value: '2',  label: 'roles — viewer & editor'  },
                { value: 'ws', label: 'WebSocket real-time sync' },
              ].map(s => (
                <div key={s.label} className="px-6 py-8 text-center">
                  <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                  <p className="mt-1 font-mono text-[12px] text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ CREDITS — capabilities ══════════════════════ */}
      <section className="border-b border-hairline py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§01</span>&nbsp;—&nbsp;Featuring
            </p>
            <h2 className="mb-10 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
              Everything you need for a real design session with others.
            </h2>
          </Reveal>

          {/* Show credits — dotted leader lines */}
          <div className="mx-auto max-w-2xl divide-y divide-hairline">
            {CREDITS.map(({ title, credit }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <div className="flex items-baseline gap-0 py-4">
                  <span className="shrink-0 font-serif text-[16px] text-ink">{title}</span>
                  {/* Dotted leader */}
                  <span
                    className="mx-3 mb-1 flex-1 border-b border-dotted border-ink/15"
                    aria-hidden
                  />
                  <span className="shrink-0 font-mono text-[11px] text-brand">{credit}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ THREE ACTS — use cases ══════════════════════ */}
      <section>
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <div className="border-b border-hairline py-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
                <span className="text-gold">§02</span>&nbsp;—&nbsp;Three acts
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
                Three ways engineers use collaboration for LLD prep.
              </h2>
            </div>
          </Reveal>
        </div>

        {ACTS.map((act, i) => (
          <Reveal key={act.roman} delay={i * 0.06}>
            <div className="relative overflow-hidden border-b border-hairline py-16">
              {/* Giant watermark roman numeral */}
              <span
                className="pointer-events-none absolute right-4 top-2 select-none font-serif font-black leading-none text-ink/[0.038] sm:right-10"
                style={{ fontSize: 'clamp(7rem,18vw,13rem)' }}
                aria-hidden
              >
                {act.roman}
              </span>

              <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
                <div className="grid items-start gap-8 lg:grid-cols-2">
                  {/* Left — editorial description */}
                  <div>
                    <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-ink-faint/50">
                      Act {act.roman}&nbsp;&nbsp;—&nbsp;&nbsp;
                      <span className="text-gold">{act.tag}</span>
                    </p>
                    <h3 className="mb-1 font-serif text-[1.65rem] font-medium leading-tight text-ink">
                      {act.title}
                    </h3>
                    <p className="mb-4 font-serif text-[0.95rem] italic text-ink-muted">
                      {act.subtitle}
                    </p>
                    <p className="text-[14px] leading-[1.85] text-ink-muted">{act.body}</p>
                  </div>

                  {/* Right — participant cards */}
                  <div className="flex flex-col gap-3">
                    {act.participants.map(p => (
                      <div
                        key={p.name}
                        className="flex items-center gap-4 rounded-xl border border-hairline bg-paper-elevated p-4"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold text-white ${p.color}`}
                        >
                          {p.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{p.name}</p>
                          <p className="font-mono text-[11px] text-ink-faint">{p.role}</p>
                        </div>
                        <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          <span className="font-mono text-[9px] font-bold text-emerald-600">live</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§03</span>&nbsp;—&nbsp;How it works
            </p>
            <h2 className="mb-8 font-serif text-[clamp(1.4rem,3vw,2rem)] font-medium text-ink">
              Built on WebSockets for zero-latency sync.
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.07}>
                <div className="rounded-xl border border-hairline bg-paper p-5">
                  <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 font-mono text-xs font-bold text-brand">
                    {s.step}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-ink">{s.title}</p>
                  <p className="text-[12px] leading-relaxed text-ink-muted">{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════ FAQ ════════════════════════════════════════ */}
      <FeatureFaq items={FAQ} />

      {/* ════════════════════ RELATED FEATURES ══════════════════════════ */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            Related features
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/features/editor',          label: 'UML Editor — the shared canvas'            },
              { href: '/features/interview-mode',   label: 'Interview Mode — practice with a watcher'  },
              { href: '/features/code-execution',   label: 'Code Execution — implement together'       },
              { href: '/pricing',                   label: 'Compare Pro and Ultimate plans'             },
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
      </Reveal>

      <FeatureCrossLinks exclude="/features/collaboration" />
    </div>
  )
}

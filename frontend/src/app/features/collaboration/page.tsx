import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MousePointer2, MessageSquareText, UserPlus, Users, Wifi, Lock, Star } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Real-Time Collaboration for LLD - Work Together on UML Diagrams | LLDCanvas',
  description:
    'Design Low-Level Systems together, in real time. LLDCanvas Collaboration lets you invite teammates or mentors to your UML diagram - live cursors, @mention comments, instant canvas sync, and role-based access. No refresh needed. Perfect for mock interviews, team design reviews, and mentored practice.',
  keywords: [
    'collaborative UML diagram', 'real-time diagram collaboration', 'LLD mock interview',
    'shared whiteboard design', 'live cursor diagram tool', 'collaborative system design',
    'team LLD practice', 'design review tool', 'pair programming design',
    'remote design interview',
  ],
  alternates: { canonical: '/features/collaboration' },
  openGraph: {
    title: 'Real-Time Collaboration — LLDCanvas',
    description: 'Design together, live. Invite teammates to your UML diagram with live cursors, @mentions, and instant sync.',
    type: 'website', url: '/features/collaboration',
  },
}

const FAQ = [
  {
    q: 'How many people can collaborate on one diagram?',
    a: 'Pro plans support up to 3 collaborators per diagram. Ultimate supports unlimited collaborators per diagram.',
  },
  {
    q: 'How do I invite someone to collaborate?',
    a: 'Click the Collaborate button in the editor toolbar. Enter their email address and assign a viewer or editor role. They receive an invitation link — the moment they accept, they appear in the live presence stack and their cursor becomes visible on the canvas.',
  },
  {
    q: 'Can I control who can edit vs. who can only view?',
    a: 'Yes — two roles are available per invitation: Editor (can modify nodes and relationships) and Viewer (can view and comment, but not modify the canvas). Role changes take effect instantly without a re-invite.',
  },
  {
    q: 'Do comments stay attached to specific parts of the diagram?',
    a: 'Yes — comments in the Discussion panel are tied to the diagram session, not to a separate chat log. You can @mention any collaborator and they\'ll see a badge count on the Comments button in real time.',
  },
  {
    q: 'Is this useful for mock interviews?',
    a: 'Yes — a very common use case is one person designing on the canvas while a friend, mentor, or senior engineer watches live and leaves questions or feedback via @mention comments — simulating a real whiteboard interview with an observer.',
  },
  {
    q: 'What happens if the collaboration connection drops?',
    a: 'The canvas autosaves your work continuously. If a collaborator disconnects, they can rejoin from the same link — their cursor reappears and the canvas state re-syncs immediately.',
  },
  {
    q: 'Can I use collaboration for a team design review?',
    a: 'Yes — invite your whole team (Ultimate plan), share the canvas link, and have everyone annotate via comments simultaneously. It\'s the same workflow as a Figma review session, but for LLD class diagrams.',
  },
]

export default function CollaborationFeaturePage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Real-Time Collaboration - LLDCanvas',
        url: 'https://lldcanvas.com/features/collaboration',
        description: 'Real-time collaboration for UML class diagrams with live cursors, @mention comments, and role-based access.',
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
                <span className="text-gold">¶07</span> — Collaboration
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
                You don&apos;t design in isolation.{' '}
                <span className="text-brand">Why practice like it?</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                Real LLD interviews are observed events — an interviewer is watching your
                every move. Collaboration lets you practice exactly that dynamic: invite a
                teammate or mentor, design while they watch, and get live feedback through
                pinned @mention comments — no refresh, no lag, no context loss.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Start collaborating <ArrowRight size={15} />
                </Link>
                <Link
                  href="/features/interview-mode"
                  className="flex items-center gap-2 rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
                >
                  Try Interview Mode
                </Link>
              </div>
            </div>

            {/* Right — Collaboration presence mockup */}
            <div className="flex flex-col gap-4">
              {/* Canvas header with presence */}
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Parking Lot Design</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {/* Avatars */}
                      {[
                        { name: 'Deepak', color: 'bg-brand', textColor: 'text-white' },
                        { name: 'Priya',  color: 'bg-violet-500', textColor: 'text-white' },
                        { name: 'Arjun',  color: 'bg-amber-500', textColor: 'text-white' },
                      ].map((u, i) => (
                        <div
                          key={u.name}
                          title={u.name}
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-paper-elevated ${u.color} ${u.textColor} ${i > 0 ? '-ml-2' : ''}`}
                        >
                          {u.name[0]}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="font-mono text-[9px] font-bold text-emerald-600">3 live</span>
                    </div>
                  </div>
                </div>

                {/* Canvas mockup with cursors */}
                <div className="relative h-40 rounded-xl border border-hairline bg-paper">
                  {/* Node */}
                  <div className="absolute left-4 top-4 w-28 rounded border border-hairline bg-white text-center shadow-sm">
                    <div className="border-b border-hairline bg-brand/5 px-2 py-1 font-mono text-[9px] font-bold">ParkingLot</div>
                    <div className="px-2 py-1 font-mono text-[8px] text-ink-muted">+ getSpot(): Spot</div>
                  </div>
                  {/* Node 2 */}
                  <div className="absolute right-4 top-6 w-24 rounded border border-hairline bg-white text-center shadow-sm">
                    <div className="border-b border-hairline bg-violet-50 px-2 py-1 font-mono text-[9px] font-bold">Level</div>
                    <div className="px-2 py-1 font-mono text-[8px] text-ink-muted">- spots: List</div>
                  </div>
                  {/* Cursor 1 - brand */}
                  <div className="absolute top-8 left-36 flex items-center gap-1">
                    <MousePointer2 size={14} className="text-brand" />
                    <span className="rounded-md bg-brand px-1.5 py-0.5 font-mono text-[9px] text-white">Deepak</span>
                  </div>
                  {/* Cursor 2 - violet */}
                  <div className="absolute bottom-6 right-12 flex items-center gap-1">
                    <MousePointer2 size={14} className="text-violet-500" />
                    <span className="rounded-md bg-violet-500 px-1.5 py-0.5 font-mono text-[9px] text-white">Priya</span>
                  </div>
                  {/* Cursor 3 - amber */}
                  <div className="absolute bottom-3 left-10 flex items-center gap-1">
                    <MousePointer2 size={14} className="text-amber-500" />
                    <span className="rounded-md bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] text-white">Arjun</span>
                  </div>
                </div>

                {/* Comment notification */}
                <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2.5">
                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 font-mono text-[8px] font-bold text-white">P</div>
                    <div>
                      <span className="font-mono text-[9px] font-bold text-violet-700">@Deepak</span>
                      <span className="ml-1 font-mono text-[10px] text-violet-600"> shouldn&apos;t this be composition, not aggregation?</span>
                    </div>
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
              { value: '∞',  label: 'collaborators (Ultimate)' },
              { value: '0',  label: 'refreshes needed' },
              { value: '2',  label: 'roles — viewer & editor' },
              { value: 'ws', label: 'WebSocket real-time sync' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core capabilities ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§1</span> — What you get
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          Everything you need for a real design session with others.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Collaboration on LLDCanvas is designed for a specific use case — practicing and
          reviewing LLD diagrams together. Every feature serves that purpose.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: MousePointer2, title: 'Live cursors and presence',
              body: 'Every collaborator\'s cursor is visible on the canvas in their unique color, with their name label. The presence stack in the top bar shows who\'s connected. No polling — updates are instant via WebSocket.',
            },
            {
              icon: MessageSquareText, title: '@mention comments',
              body: 'The Comments panel is a real-time discussion thread visible to all collaborators. Type @ to mention someone — they\'ll see a badge counter on the Comments button that resets when they open the panel.',
            },
            {
              icon: UserPlus, title: 'Invite by email or link',
              body: 'Enter an email address to send a direct invite, or generate a public collaboration link. Assign a viewer or editor role at the time of invite — changeable later without re-inviting.',
            },
            {
              icon: Wifi, title: 'Instant canvas sync',
              body: 'Every node creation, edit, move, or deletion syncs to all connected collaborators in under 100ms. No "refresh to see changes." No merge conflicts. Last-write-wins per node, so edits don\'t collide.',
            },
            {
              icon: Lock, title: 'Role-based access',
              body: 'Editors can modify the canvas. Viewers can see everything and comment, but cannot add or edit nodes. Roles are enforced server-side, not just in the UI.',
            },
            {
              icon: Users, title: 'Collaboration dashboard',
              body: 'See all your active collaborations, activity timelines, and collaborator lists in the dedicated Collaborations tab in your dashboard.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <Icon size={15} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use cases ─────────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§2</span> — Use cases
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
            Three ways engineers use collaboration for LLD prep.
          </h2>
          <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Collaboration isn&apos;t just for teams. Some of the most effective uses are solo engineers
            with a single mentor or practice partner.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: Star, title: 'Mock interview simulation',
                body: 'One person designs on the canvas — timed, with Interview Mode — while a friend or mentor watches via a Viewer link and leaves feedback through @mention comments. Identical to a real interview observation format.',
                tag: 'Most popular',
              },
              {
                icon: Users, title: 'Team design review',
                body: 'Share a diagram with your tech team. Everyone joins as a Viewer or Editor. Comments, annotations, and design changes happen in real time — no need to export a PNG and paste it into Slack.',
                tag: 'Teams',
              },
              {
                icon: UserPlus, title: 'Mentored practice',
                body: 'A senior engineer joins as an Editor alongside a junior. They can guide by adding nodes, correcting relationships, and leaving detailed comments — exactly the same canvas, no friction.',
                tag: 'Mentorship',
              },
            ].map(({ icon: Icon, title, body, tag }) => (
              <div key={title} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                    <Icon size={15} className="text-brand" />
                  </div>
                  <span className="rounded-full border border-hairline bg-paper-elevated px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-faint">{tag}</span>
                </div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-[13px] leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — technical ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§3</span> — How it works
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          Built on WebSockets for zero-latency sync.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Collaboration is built on persistent WebSocket connections, not polling. Every canvas event
          — node created, node moved, edge drawn, comment posted — broadcasts to all connected
          collaborators instantly, without a refresh.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', title: 'Create invite', detail: 'Enter email, pick role. Invitation sent immediately.' },
            { step: '2', title: 'Collaborator accepts', detail: 'They open the link, authenticate, join the canvas.' },
            { step: '3', title: 'Live session', detail: 'Cursors appear, edits sync in real time via WebSocket.' },
            { step: '4', title: 'Comment & review', detail: '@mention comments appear in all panels instantly.' },
          ].map(s => (
            <div key={s.step} className="rounded-xl border border-hairline bg-paper-elevated p-4">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 font-mono text-xs font-bold text-brand">{s.step}</div>
              <p className="mb-1 text-sm font-semibold text-ink">{s.title}</p>
              <p className="text-[12px] text-ink-muted">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plan comparison ───────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-[#14130f] py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-emerald-400/60 uppercase">
            <span className="text-emerald-400">§4</span> — Plan comparison
          </p>
          <h2 className="mb-8 font-serif text-2xl font-medium text-white">
            Collaboration is available on Pro and Ultimate.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                plan: 'Pro', price: '₹199/mo',
                features: ['Up to 3 collaborators per diagram', 'Live cursors and presence', '@mention comments', 'Viewer and editor roles', 'Invite by email or link'],
                missing: ['Activity timeline', 'Version history'],
              },
              {
                plan: 'Ultimate', price: '₹299/mo',
                features: ['Unlimited collaborators per diagram', 'Live cursors and presence', '@mention comments', 'Viewer and editor roles', 'Invite by email or link', 'Activity timeline', 'Version history'],
                missing: [],
              },
            ].map(p => (
              <div key={p.plan} className={`rounded-xl border p-5 ${p.plan === 'Ultimate' ? 'border-brand/30 bg-brand/5' : 'border-white/[0.08] bg-white/[0.03]'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className={`font-mono text-sm font-bold ${p.plan === 'Ultimate' ? 'text-brand' : 'text-white'}`}>{p.plan}</p>
                    <p className="font-mono text-[11px] text-white/40">{p.price}</p>
                  </div>
                  {p.plan === 'Ultimate' && (
                    <span className="rounded-full bg-brand px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">Best for teams</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-white/70">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                  {p.missing.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-white/30 line-through">
                      <span>✗</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              View all plan features <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <FeatureFaq items={FAQ} />

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/features/editor',         label: 'UML Editor — the shared canvas' },
            { href: '/features/interview-mode',  label: 'Interview Mode — practice with a watcher' },
            { href: '/features/code-execution',  label: 'Code Execution — implement together' },
            { href: '/pricing',                  label: 'Compare Pro and Ultimate plans' },
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

      <FeatureCrossLinks exclude="/features/collaboration" />
    </div>
  )
}

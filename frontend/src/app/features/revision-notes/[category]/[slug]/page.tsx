import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, Lock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicApi, NOTE_DIFF_META } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

// ─── Field-guide rarity config ────────────────────────────────────────────────

const RARITY: Record<string, { label: string; color: string; bg: string; ring: string; dot: string }> = {
  easy:   { label: 'Core',         color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: '●' },
  medium: { label: 'Intermediate', color: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: '◆' },
  hard:   { label: 'Advanced',     color: 'text-red-700',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: '★' },
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const res = await publicApi.revisionNotes.list()
  return (res?.notes ?? []).map(n => ({ category: n.categorySlug, slug: n.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const res = await publicApi.revisionNotes.get(slug)
  if (!res) return { title: 'Note not found' }

  const { note } = res
  const title = `${note.title} — LLD Revision Note | LLDCanvas`
  const description = `${note.summary} A ${note.difficulty} ${note.category} concept with real-world analogy and key points for LLD interview preparation.`

  return {
    title,
    description,
    keywords: [
      note.title.toLowerCase(),
      note.category,
      'LLD revision notes',
      'low level design',
      'design patterns',
      'interview prep',
      ...note.tags,
    ],
    alternates: { canonical: `/features/revision-notes/${note.categorySlug}/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/features/revision-notes/${note.categorySlug}/${slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RevisionNoteDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const res = await publicApi.revisionNotes.get(slug)
  if (!res) notFound()

  const { note, related } = res
  const m = NOTE_DIFF_META[note.difficulty]
  const r = RARITY[note.difficulty] ?? RARITY.easy
  const remaining = Math.max(0, note.keyPointsCount - 1)

  // Canonical URL redirect
  if (category !== note.categorySlug) {
    redirect(`/features/revision-notes/${note.categorySlug}/${slug}`)
  }

  return (
    <div className="overflow-hidden">

      {/* ── JSON-LD ──────────────────────────────────────────────────────── */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: note.title,
        description: note.summary,
        articleSection: note.category,
        keywords: note.tags.join(', '),
        author: { '@type': 'Organization', name: 'LLDCanvas' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://lldcanvas.com/features' },
          { '@type': 'ListItem', position: 2, name: 'Revision Notes', item: 'https://lldcanvas.com/features/revision-notes' },
          { '@type': 'ListItem', position: 3, name: note.title, item: `https://lldcanvas.com/features/revision-notes/${note.categorySlug}/${slug}` },
        ],
      }} />

      {/* ════════════════════════ HERO ════════════════════════════════════ */}
      <section className="relative border-b border-hairline overflow-hidden">

        {/* Ruled lines texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 27px, #234E3F 27px, #234E3F 28px)',
            backgroundSize: '100% 28px',
          }}
          aria-hidden
        />

        <Reveal className="relative mx-auto max-w-3xl px-6 pb-14 pt-10 sm:px-8 sm:pt-14">

          {/* Breadcrumb */}
          <p className="mb-6 font-mono text-[11px] text-ink-faint">
            <Link href="/features/revision-notes" className="inline-flex items-center gap-1 hover:text-brand transition-colors">
              <ArrowLeft size={10} /> Revision Notes
            </Link>
            <span className="mx-2 opacity-30">/</span>
            <span className="text-ink-muted">{note.category}</span>
          </p>

          {/* Chapter label */}
          <p className="mb-4 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-ink-faint/55">
            Field Entry &nbsp;—&nbsp; {note.category}
          </p>

          {/* Rarity + difficulty badges */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ring-1 ring-inset',
              r.bg, r.color, r.ring,
            )}>
              {r.dot}&nbsp;{r.label}
            </span>
            <span className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ring-1',
              m.bg, m.color, m.ring,
            )}>
              {note.difficulty}
            </span>
          </div>

          {/* Title */}
          <div className="border-t border-hairline-strong pt-5">
            <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-ink">
              {note.title}
            </h1>
          </div>

          {/* Summary */}
          <p className="mt-5 text-[16px] leading-[1.8] text-ink-muted">{note.summary}</p>

          {/* Tags — specimen labels */}
          {note.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {note.tags.map(t => (
                <span
                  key={t}
                  className="rounded-sm border border-ink/10 bg-paper px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      {/* ════════════════════ ANALOGY — margin note styling ══════════════ */}
      {note.analogy && (
        <Reveal>
          <section className="border-b border-hairline py-14">
            <div className="mx-auto max-w-3xl px-6 sm:px-8">
              <p className="mb-4 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-ink-faint/55">
                Field Note — Real-world Analogy
              </p>

              {/* Margin-note card */}
              <div className="relative rounded-2xl border-l-[3px] border-gold/60 bg-amber-50/40 px-6 py-5">
                {/* Corner label */}
                <span className="absolute right-4 top-3 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint/30 rotate-[0.5deg]">
                  Think of it like this
                </span>
                {/* Pencil-underline rule */}
                <div className="mb-3 h-px w-12 bg-gold/40" />
                <p className="font-serif text-[1.1rem] leading-[1.85] text-ink italic">
                  &ldquo;{note.analogy}&rdquo;
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ════════════════════ KEY POINTS — field observations ════════════ */}
      <Reveal>
        <section className="border-b border-hairline py-14">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="mb-6 flex items-center gap-2">
              <BookOpen size={13} className="text-brand" />
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-ink-faint/55">
                Field Observations — Key Topics Covered
              </p>
            </div>

            {/* First point — always visible */}
            {note.firstKeyPoint && (
              <div className="mb-4 flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/5 font-mono text-[10px] font-black text-brand">
                  01
                </span>
                <p className="text-[14px] leading-relaxed text-ink">{note.firstKeyPoint}</p>
              </div>
            )}

            {/* Locked remaining — redacted document style */}
            {remaining > 0 && (
              <div className="relative overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
                {/* Redacted rows */}
                <div className="divide-y divide-hairline select-none" aria-hidden>
                  {[88, 73, 92, 65, 80].slice(0, Math.min(remaining, 5)).map((w, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="w-6 shrink-0 font-mono text-[10px] text-ink-faint/30 text-center">
                        {String(i + 2).padStart(2, '0')}
                      </span>
                      {/* Solid redaction bar */}
                      <div
                        className="h-3.5 rounded-sm bg-ink/75"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                  {remaining > 5 && (
                    <div className="px-5 py-3 font-mono text-[10px] text-ink-faint/40">
                      … {remaining - 5} more observation{remaining - 5 !== 1 ? 's' : ''} classified
                    </div>
                  )}
                </div>

                {/* Frosted overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(250,249,247,0) 0%, rgba(250,249,247,0.75) 25%, rgba(250,249,247,0.94) 100%)',
                    backdropFilter: 'blur(1.5px)',
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-white shadow">
                    <Lock size={16} className="text-ink-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">
                      {remaining} more observation{remaining !== 1 ? 's' : ''} inside
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      Sign in to read every key point in full
                    </p>
                  </div>
                  <Link
                    href="/dashboard/revision"
                    className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover"
                  >
                    Unlock Full Note <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ CTA ═════════════════════════════════════════ */}
      <Reveal>
        <section className="border-b border-hairline py-16">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="rounded-2xl border border-brand/20 bg-brand/[0.035] px-8 py-10 text-center">
              <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-brand/70">
                Ready to go deeper?
              </p>
              <h2 className="mb-3 font-serif text-[1.8rem] font-medium text-ink">
                Open the complete revision note.
              </h2>
              <p className="mx-auto mb-8 max-w-sm text-[14px] leading-relaxed text-ink-muted">
                Sign in to read every field observation in full, including a runnable code example
                and side-by-side comparisons with related patterns.
              </p>
              <Link
                href="/dashboard/revision"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
              >
                Read Full Notes <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ RELATED ════════════════════════════════════ */}
      {related.length > 0 && (
        <Reveal>
          <section className="py-14">
            <div className="mx-auto max-w-3xl px-6 sm:px-8">
              <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-ink-faint/55">
                See Also in {note.category}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {related.map(rel => {
                  const rr = RARITY[rel.difficulty] ?? RARITY.easy
                  return (
                    <Link
                      key={rel.slug}
                      href={`/features/revision-notes/${rel.categorySlug}/${rel.slug}`}
                      className="group flex flex-col gap-3 rounded-xl border border-hairline bg-paper-elevated p-4 transition-all hover:border-brand/25 hover:shadow-md"
                    >
                      <span className={cn(
                        'inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ring-1 ring-inset',
                        rr.bg, rr.color, rr.ring,
                      )}>
                        {rr.dot}&nbsp;{rr.label}
                      </span>
                      <p className="flex-1 text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                        {rel.title}
                      </p>
                      <ChevronRight size={13} className="text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <FeatureCrossLinks />
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, BookOpen, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicApi, NOTE_DIFF_META } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export async function generateStaticParams() {
  const res = await publicApi.revisionNotes.list()
  return (res?.notes ?? []).map(n => ({ category: n.categorySlug, slug: n.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = await publicApi.revisionNotes.get(slug)
  if (!res) return { title: 'Note not found' }
  const { note } = res
  const title = `${note.title} — Revision Notes`
  return {
    title,
    description: note.summary,
    alternates: { canonical: `/features/revision-notes/${note.categorySlug}/${slug}` },
    openGraph: { title, type: 'article', url: `/features/revision-notes/${note.categorySlug}/${slug}` },
  }
}

export default async function RevisionNoteDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params
  const res = await publicApi.revisionNotes.get(slug)
  if (!res) notFound()
  const { note, related } = res

  // Keep one canonical URL per note — a stale/wrong category segment
  // redirects to the correct one instead of serving duplicate content.
  if (category !== note.categorySlug) {
    redirect(`/features/revision-notes/${note.categorySlug}/${slug}`)
  }

  const m = NOTE_DIFF_META[note.difficulty]
  const remaining = Math.max(0, note.keyPointsCount - 1)

  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: note.title,
        description: note.summary,
        articleSection: note.category,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Revision Notes', item: 'https://lldcanvas.com/features/revision-notes' },
          { '@type': 'ListItem', position: 2, name: note.title, item: `https://lldcanvas.com/features/revision-notes/${note.categorySlug}/${slug}` },
        ],
      }} />

      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
        <p className="mb-6 font-mono text-[11px] text-ink-faint">
          <Link href="/features/revision-notes" className="hover:text-brand">Revision Notes</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">{note.category}</span>
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ring-1', m.bg, m.color, m.ring)}>
            {note.difficulty}
          </span>
          <span className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-faint">
            {note.category}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">{note.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">{note.summary}</p>

        {note.analogy && (
          <div className="mt-8 rounded-xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Think of it like this</p>
            <p className="text-sm leading-relaxed text-ink-muted italic">&ldquo;{note.analogy}&rdquo;</p>
          </div>
        )}

        {note.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-1.5">
            {note.tags.map(t => (
              <span key={t} className="rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-muted">#{t}</span>
            ))}
          </div>
        )}

        {/* Key points teaser — first one free, rest locked */}
        <div className="mt-10 rounded-xl border border-hairline bg-paper-elevated p-6">
          <h2 className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            <BookOpen className="h-3 w-3" /> Key Topics Covered
          </h2>
          {note.firstKeyPoint && (
            <p className="mb-4 text-sm leading-relaxed text-ink-muted">{note.firstKeyPoint}</p>
          )}
          {remaining > 0 && (
            <div className="relative overflow-hidden rounded-lg border border-hairline bg-paper px-4 py-5">
              <div aria-hidden className="space-y-2 blur-[3px] select-none">
                <div className="h-2.5 w-[88%] rounded bg-hairline-strong" />
                <div className="h-2.5 w-[75%] rounded bg-hairline-strong" />
                <div className="h-2.5 w-[92%] rounded bg-hairline-strong" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/70 backdrop-blur-[1px]">
                <Lock className="h-4 w-4 text-ink-muted" />
                <p className="text-center text-xs font-medium text-ink-muted">
                  + {remaining} more insight{remaining !== 1 ? 's' : ''} — sign in to read the complete note
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-brand/20 bg-brand-tint px-8 py-10 text-center">
          <p className="text-lg font-semibold text-ink">Want the complete revision note?</p>
          <p className="max-w-sm text-sm text-ink-muted">
            Sign in to read every key point in full, plus a runnable code example for this concept.
          </p>
          <Link
            href="/dashboard/revision"
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
          >
            Read Full Notes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Related Notes in {note.category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map(r => {
                const rm = NOTE_DIFF_META[r.difficulty]
                return (
                  <Link
                    key={r.slug}
                    href={`/features/revision-notes/${r.categorySlug}/${r.slug}`}
                    className="rounded-lg border border-hairline bg-paper-elevated p-4 transition-colors hover:border-brand/30"
                  >
                    <span className={cn('mb-1.5 inline-block rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase', rm.bg, rm.color)}>
                      {r.difficulty}
                    </span>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <FeatureCrossLinks />
    </div>
  )
}

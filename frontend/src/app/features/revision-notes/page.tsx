import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { publicApi, NOTE_DIFF_META, type PublicRevisionNoteSummary } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'LLD Revision Notes',
  description:
    'Concise revision notes for Low-Level Design interviews — design patterns, OOP & SOLID principles, and system design concepts, each with a real-world analogy.',
  alternates: { canonical: '/features/revision-notes' },
  openGraph: { title: 'LLD Revision Notes — LLDCanvas', type: 'website', url: '/features/revision-notes' },
}

function groupByCategory(notes: PublicRevisionNoteSummary[]) {
  const groups = new Map<string, PublicRevisionNoteSummary[]>()
  for (const n of notes) {
    const arr = groups.get(n.category) ?? []
    arr.push(n)
    groups.set(n.category, arr)
  }
  return [...groups.entries()]
}

export default async function RevisionNotesIndexPage() {
  const res = await publicApi.revisionNotes.list()
  const notes = res?.notes ?? []
  const groups = groupByCategory(notes)

  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LLD Revision Notes',
        url: 'https://lldcanvas.com/features/revision-notes',
        numberOfItems: notes.length,
      }} />

      <section className="border-b border-hairline px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
            <span className="text-gold">¶05</span> — Revision Notes
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {notes.length} notes, six subjects, one syllabus.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            The concepts interviewers actually probe — design patterns, OOP &amp; SOLID
            principles, and system design fundamentals — each distilled with a real-world
            analogy.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        {groups.map(([category, categoryNotes]) => (
          <div key={category} className="mb-12 last:mb-0">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink">{category}</h2>
            <div className="divide-y divide-hairline rounded-xl border border-hairline bg-paper-elevated">
              {categoryNotes.map(n => {
                const m = NOTE_DIFF_META[n.difficulty]
                return (
                  <Link
                    key={n.slug}
                    href={`/features/revision-notes/${n.categorySlug}/${n.slug}`}
                    className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-paper"
                  >
                    <span className={cn('mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ring-1', m.bg, m.color, m.ring)}>
                      {m.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink transition-colors group-hover:text-brand">{n.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-muted">{n.summary}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <FeatureCrossLinks exclude="/features/revision-notes" />
    </div>
  )
}

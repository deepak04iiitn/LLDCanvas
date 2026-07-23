import type { Metadata } from 'next'
import { publicApi, type PublicRevisionNoteSummary } from '@/lib/public-api'
import { JsonLd } from '@/components/seo/JsonLd'
import { RevisionNotesIndexClient } from '@/components/features/RevisionNotesIndexClient'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'LLD Revision Notes — Design Patterns, SOLID & OOP for Interviews | LLDCanvas',
  description:
    'Quick-revision notes for Low-Level Design interviews. Covers design patterns (Singleton, Factory, Observer…), OOP principles, SOLID, and system design fundamentals — each with a real-world analogy and runnable code examples.',
  keywords: [
    'LLD revision notes',
    'low level design notes',
    'design patterns cheat sheet',
    'SOLID principles notes',
    'OOP interview notes',
    'system design revision',
    'singleton pattern',
    'factory pattern',
    'observer pattern',
    'software design interview prep',
    'LLD interview preparation',
    'low level design interview',
    'design patterns for interviews',
    'object oriented design',
    'LLDCanvas',
  ],
  alternates: { canonical: '/features/revision-notes' },
  openGraph: {
    title: 'LLD Revision Notes — Design Patterns, SOLID & OOP | LLDCanvas',
    description:
      'Concise, analogy-backed revision notes for every key Low-Level Design concept. Study design patterns, OOP, SOLID principles, and more — all in one place.',
    type: 'website',
    url: '/features/revision-notes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLD Revision Notes | LLDCanvas',
    description: 'Concise revision notes for Low-Level Design interviews — design patterns, SOLID, OOP & more.',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByCategory(notes: PublicRevisionNoteSummary[]) {
  const groups = new Map<string, PublicRevisionNoteSummary[]>()
  for (const n of notes) {
    const arr = groups.get(n.category) ?? []
    arr.push(n)
    groups.set(n.category, arr)
  }
  return [...groups.entries()]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RevisionNotesIndexPage() {
  const res = await publicApi.revisionNotes.list()
  const notes = res?.notes ?? []
  const groups = groupByCategory(notes)

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LLD Revision Notes — Design Patterns, SOLID & OOP',
        url: 'https://lldcanvas.com/features/revision-notes',
        description: 'Concise revision notes for Low-Level Design interviews covering design patterns, OOP, SOLID principles, and system design fundamentals.',
        numberOfItems: notes.length,
        hasPart: groups.map(([category, categoryNotes]) => ({
          '@type': 'ItemList',
          name: category,
          numberOfItems: categoryNotes.length,
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://lldcanvas.com/features' },
          { '@type': 'ListItem', position: 2, name: 'Revision Notes', item: 'https://lldcanvas.com/features/revision-notes' },
        ],
      }} />

      <RevisionNotesIndexClient notes={notes} groups={groups} />
    </>
  )
}

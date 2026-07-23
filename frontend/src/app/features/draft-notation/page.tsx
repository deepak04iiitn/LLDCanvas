import type { Metadata } from 'next'
import { DraftNotationPageClient } from '@/components/features/DraftNotationPageClient'
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

export default function DraftNotationFeaturePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Draft Notation — Plain-English UML',
        url: 'https://lldcanvas.com/features/draft-notation',
        description: 'LLDCanvas\'s own plain-English UML diagramming language.',
      }} />
      <DraftNotationPageClient />
    </>
  )
}

import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { CollaborationPageClient } from '@/components/features/CollaborationPageClient'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Real-Time Collaboration for LLD - Work Together on UML Diagrams | LLDCanvas',
  description:
    "Design Low-Level Systems together, in real time. LLDCanvas Collaboration lets you invite teammates or mentors to your UML diagram — live cursors, @mention comments, instant canvas sync, and role-based access. Perfect for mock interviews, team design reviews, and mentored practice.",
  keywords: [
    'collaborative UML diagram',
    'real-time diagram collaboration',
    'LLD mock interview',
    'shared whiteboard design',
    'live cursor diagram tool',
    'collaborative system design',
    'team LLD practice',
    'design review tool',
    'pair programming design',
    'remote design interview',
    'real-time collaboration tool',
    'UML collaboration',
    'live whiteboard LLD',
    'mock interview tool',
    'design with team',
  ],
  alternates: { canonical: '/features/collaboration' },
  openGraph: {
    title: 'Real-Time Collaboration — LLDCanvas',
    description:
      'Design together, live. Invite teammates to your UML diagram with live cursors, @mentions, instant sync, and role-based access.',
    type: 'website',
    url: '/features/collaboration',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real-Time Collaboration for LLD | LLDCanvas',
    description:
      'Invite a mentor or teammate to your UML diagram. Live cursors, @mentions, instant sync — no refresh needed.',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollaborationFeaturePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Real-Time Collaboration - LLDCanvas',
        url: 'https://lldcanvas.com/features/collaboration',
        description:
          'Real-time collaboration for UML class diagrams with live cursors, @mention comments, and role-based access.',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://lldcanvas.com/features' },
          { '@type': 'ListItem', position: 2, name: 'Collaboration', item: 'https://lldcanvas.com/features/collaboration' },
        ],
      }} />

      <CollaborationPageClient />
    </>
  )
}

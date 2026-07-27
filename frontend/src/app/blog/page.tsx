import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { BlogListingClient } from '@/components/blog/BlogListingClient'

export const metadata: Metadata = {
  title: 'Blog - System Design, LLD, Design Patterns | LLDCanvas',
  description:
    'In-depth articles on System Design, Low-Level Design (LLD), Design Patterns, SOLID Principles, OOP, and Software Engineering Interview Preparation. Written by engineers, for engineers.',
  keywords: [
    'system design blog', 'low level design blog', 'LLD articles', 'design patterns explained',
    'SOLID principles', 'software engineering interview prep', 'OOP concepts', 'distributed systems',
    'machine coding round preparation', 'software architecture articles',
  ],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'LLDCanvas Blog - System Design & LLD Articles',
    description: 'Expert articles on System Design, LLD, Design Patterns, and Software Engineering Interview Preparation.',
    type: 'website', url: '/blog',
  },
}

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'LLDCanvas Blog',
        url: 'https://lldcanvas.in/blog',
        description: 'Expert articles on System Design, LLD, Design Patterns, and Software Engineering Interview Preparation.',
        publisher: {
          '@type': 'Organization',
          name: 'LLDCanvas',
          url: 'https://lldcanvas.in',
        },
      }} />
      <BlogListingClient />
    </>
  )
}

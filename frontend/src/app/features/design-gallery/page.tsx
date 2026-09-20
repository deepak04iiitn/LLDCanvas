import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'design-gallery',
  title: 'Community Design Gallery | LLDCanvas',
  description:
    'Browse published UML designs from the LLDCanvas community — fork, watch replays, and compare approaches.',
  keywords: [
    'UML design gallery',
    'community LLD designs',
    'shared architecture diagrams',
    'LLD examples',
  ],
})

export default function DesignGalleryFeaturePage() {
  return (
    <FeatureSeoPage
      slug="design-gallery"
      title="Design Gallery - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Community"
      headline={
        <>
          Learn from designs{' '}
          <span className="text-brand">other people published.</span>
        </>
      }
      body="Explore the gallery, fork a solution, or watch how it was built — community learning without leaving the canvas."
      ctaHref="/community"
      ctaLabel="Browse Community"
      keywords={[]}
    />
  )
}

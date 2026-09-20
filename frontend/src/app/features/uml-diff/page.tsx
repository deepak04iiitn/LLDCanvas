import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'uml-diff',
  title: 'UML Diff — Structural Before/After | LLDCanvas',
  description:
    'Compare two UML designs by stable element IDs — added, removed, and changed classes and relationships, not pixel layout.',
  keywords: [
    'UML diff',
    'architecture diff',
    'class diagram compare',
    'LLD structural diff',
    'design before after',
  ],
})

export default function UmlDiffFeaturePage() {
  return (
    <FeatureSeoPage
      slug="uml-diff"
      title="UML Diff - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Design Studio"
      headline={
        <>
          Diff the design —{' '}
          <span className="text-brand">not the pixels.</span>
        </>
      }
      body="Structural before/after on stable element IDs: what classes and relationships appeared, vanished, or changed. Built for refactor review and Architecture Evolution checkpoints."
      ctaHref="/design-studio"
      ctaLabel="Open Design Studio"
      keywords={[]}
    />
  )
}

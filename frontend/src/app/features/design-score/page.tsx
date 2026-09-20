import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'design-score',
  title: 'Design Score for LLD Diagrams | LLDCanvas',
  description:
    'Heuristic feedback across coupling, cohesion, naming, and cycles — guidance for discussion, not an absolute grade.',
  keywords: [
    'design score',
    'UML quality metrics',
    'LLD feedback',
    'architecture heuristics',
  ],
})

export default function DesignScoreFeaturePage() {
  return (
    <FeatureSeoPage
      slug="design-score"
      title="Design Score - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Learn & Practice"
      headline={
        <>
          Feedback dimensions,{' '}
          <span className="text-brand">not a final grade.</span>
        </>
      }
      body="Run Design Score on your diagram to surface coupling, cycle, size, naming, and cohesion signals — then drill into highlighted elements."
      ctaHref="/learn"
      ctaLabel="Open Design Score"
      keywords={[]}
    />
  )
}

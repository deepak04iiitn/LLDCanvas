import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'dependency-web',
  title: 'Dependency Web for UML Designs | LLDCanvas',
  description:
    'See couplings, hubs, and cycles in a graph-oriented view of your Low-Level Design — alternate to classic UML layout.',
  keywords: [
    'dependency web',
    'UML coupling',
    'architecture cycles',
    'LLD dependency graph',
  ],
})

export default function DependencyWebFeaturePage() {
  return (
    <FeatureSeoPage
      slug="dependency-web"
      title="Dependency Web - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Design Studio"
      headline={
        <>
          Couplings and cycles,{' '}
          <span className="text-brand">not just boxes.</span>
        </>
      }
      body="Switch to a dependency-centric view of your design. Isolate hubs, highlight impact radius, and catch directed cycles early."
      ctaHref="/design-studio"
      ctaLabel="Open Design Studio"
      keywords={[]}
    />
  )
}

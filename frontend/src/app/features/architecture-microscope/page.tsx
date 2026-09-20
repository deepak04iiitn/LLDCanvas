import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'architecture-microscope',
  title: 'Architecture Microscope | LLDCanvas',
  description:
    'Inspect any UML class — responsibilities, inbound/outbound dependencies, and heuristic concerns — inside the Design Workspace Analyze panel.',
  keywords: [
    'architecture microscope',
    'UML class inspection',
    'dependency analysis',
    'LLD design review',
  ],
})

export default function ArchitectureMicroscopeFeaturePage() {
  return (
    <FeatureSeoPage
      slug="architecture-microscope"
      title="Architecture Microscope - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Design Studio"
      headline={
        <>
          Zoom into a class and see what it{' '}
          <span className="text-brand">really owns.</span>
        </>
      }
      body="Select a type on your canvas to surface responsibilities, fan-in/fan-out, and heuristic concerns — without leaving the diagram."
      ctaHref="/design-studio"
      ctaLabel="Open Design Studio"
      keywords={[]}
    />
  )
}

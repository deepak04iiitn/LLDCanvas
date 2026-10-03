import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'design-debugger',
  title: 'Design Debugger for LLD Interviews | LLDCanvas',
  description:
    'Practice spotting architectural flaws in UML designs. Mark issues, submit your critique, and reveal the authored answer key — built for Low-Level Design interviews.',
  keywords: [
    'design debugger',
    'LLD critique',
    'UML architecture flaws',
    'low level design practice',
    'software design review',
  ],
})

export default function DesignDebuggerFeaturePage() {
  return (
    <FeatureSeoPage
      slug="design-debugger"
      title="Design Debugger - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Design Studio"
      headline={
        <>
          Find the flaws before the{' '}
          <span className="text-brand">interviewer does.</span>
        </>
      }
      body="Load an authored broken design, mark issues with categories and explanations, then reveal the expected critique. Train the skill of reading architecture — not just drawing it."
      ctaHref="/dashboard/design-studio/debugger"
      ctaLabel="Open Design Debugger"
      keywords={[]}
    />
  )
}

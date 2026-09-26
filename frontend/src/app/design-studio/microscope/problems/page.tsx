'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function MicroscopeProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Architecture Microscope"
      featureSubtitle="Zoom into any design and analyse it at every level"
      packType="microscope"
      attemptBasePath="/design-studio/microscope"
      overviewHref="/design-studio/microscope"
      overviewLabel="Architecture Microscope"
    />
  )
}

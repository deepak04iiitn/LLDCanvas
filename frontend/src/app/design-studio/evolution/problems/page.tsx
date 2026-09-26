'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function EvolutionProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Architecture Evolution"
      featureSubtitle="Design systems that survive multi-stage growth"
      packType="evolution"
      attemptBasePath="/design-studio/evolution"
      overviewHref="/design-studio/evolution"
      overviewLabel="Architecture Evolution"
    />
  )
}

'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function DepWebProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Dependency Web"
      featureSubtitle="Map coupling hotspots and reason about change propagation"
      packType="depweb"
      attemptBasePath="/design-studio/depweb"
      overviewHref="/design-studio/depweb"
      overviewLabel="Dependency Web"
    />
  )
}

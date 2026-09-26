'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function RefactorProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Refactoring Mode"
      featureSubtitle="Transform messy designs into clean, extensible architecture"
      packType="refactor"
      attemptBasePath="/design-studio/refactor"
      overviewHref="/design-studio/refactor"
      overviewLabel="Refactoring Mode"
    />
  )
}

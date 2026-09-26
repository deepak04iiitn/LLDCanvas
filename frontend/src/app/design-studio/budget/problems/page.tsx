'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function BudgetProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Architecture Budget"
      featureSubtitle="Prioritise design investments under real constraints"
      packType="budget"
      attemptBasePath="/design-studio/budget"
      overviewHref="/design-studio/budget"
      overviewLabel="Architecture Budget"
    />
  )
}

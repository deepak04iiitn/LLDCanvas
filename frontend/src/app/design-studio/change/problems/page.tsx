'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function ChangeProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Change One Thing"
      featureSubtitle="Handle requirement changes without breaking your architecture"
      packType="change_one"
      attemptBasePath="/design-studio/change"
      overviewHref="/design-studio/change"
      overviewLabel="Change One Thing"
    />
  )
}

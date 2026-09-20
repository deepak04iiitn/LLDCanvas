'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function EvolutionListPage() {
  return (
    <ChallengeListPage
      title="Architecture Evolution"
      subtitle="Grow a design across staged requirements"
      packType="evolution"
      attemptBasePath="/design-studio/evolution"
      emptyMessage="No evolution tracks published yet."
    />
  )
}

'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function RefactorListPage() {
  return (
    <ChallengeListPage
      title="Refactoring Mode"
      subtitle="Fix a locked broken design and review structural deltas"
      packType="refactor"
      attemptBasePath="/design-studio/refactor"
      emptyMessage="No refactor packs published yet."
    />
  )
}

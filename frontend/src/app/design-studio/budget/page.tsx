'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function BudgetListPage() {
  return (
    <ChallengeListPage
      title="Architecture Budget"
      subtitle="Invest scarce architecture points — prioritize under pressure"
      packType="budget"
      attemptBasePath="/design-studio/budget"
      emptyMessage="No budget challenges published yet."
    />
  )
}

'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function ChangeListPage() {
  return (
    <ChallengeListPage
      title="Change One Thing"
      subtitle="Meet a new requirement with the smallest semantic change"
      packType="change_one"
      attemptBasePath="/design-studio/change"
      emptyMessage="No Change One Thing packs published yet."
    />
  )
}

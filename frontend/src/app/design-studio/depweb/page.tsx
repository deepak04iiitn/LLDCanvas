'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function DepWebListPage() {
  return (
    <ChallengeListPage
      title="Dependency Web"
      subtitle="Understand connections — and how changes propagate"
      packType="depweb"
      attemptBasePath="/design-studio/depweb"
      emptyMessage="No dependency-web challenges published yet."
    />
  )
}

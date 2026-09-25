'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function MicroscopeListPage() {
  return (
    <ChallengeListPage
      title="Architecture Microscope"
      subtitle="Investigate internals — select, zoom, trace, understand"
      packType="microscope"
      attemptBasePath="/design-studio/microscope"
      emptyMessage="No investigate challenges published yet."
    />
  )
}

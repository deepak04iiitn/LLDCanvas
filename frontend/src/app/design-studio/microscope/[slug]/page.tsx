'use client'

import { useParams } from 'next/navigation'
import { InvestigateSession } from '@/components/studio/microscope/InvestigateSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function MicroscopeChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('microscope', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <InvestigateSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

'use client'

import { useParams } from 'next/navigation'
import { DepWebChallengeSession } from '@/components/studio/dependency-web/DepWebChallengeSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function DepWebChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('depweb', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <DepWebChallengeSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

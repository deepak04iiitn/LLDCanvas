'use client'

import { useParams } from 'next/navigation'
import { RefactorSession } from '@/components/studio/refactor/RefactorSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function RefactorChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('refactor', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <RefactorSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

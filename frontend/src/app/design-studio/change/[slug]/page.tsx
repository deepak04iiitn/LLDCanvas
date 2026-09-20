'use client'

import { useParams } from 'next/navigation'
import { ChangeSession } from '@/components/studio/change/ChangeSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function ChangeChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('change_one', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <ChangeSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

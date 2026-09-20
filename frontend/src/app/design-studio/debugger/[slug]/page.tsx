'use client'

import { useParams } from 'next/navigation'
import { DebuggerSession } from '@/components/studio/debugger/DebuggerSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function DebuggerChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('debugger', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <DebuggerSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

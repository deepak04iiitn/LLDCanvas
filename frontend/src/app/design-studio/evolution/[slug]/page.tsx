'use client'

import { useParams } from 'next/navigation'
import { EvolutionSession } from '@/components/studio/evolution/EvolutionSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function EvolutionChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('evolution', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <EvolutionSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

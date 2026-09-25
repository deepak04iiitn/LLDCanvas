'use client'

import { useParams } from 'next/navigation'
import { BudgetSession } from '@/components/studio/budget/BudgetSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

export default function BudgetChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('budget', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <BudgetSession attemptId={attemptId} /> : null}
    </StudioAttemptLoader>
  )
}

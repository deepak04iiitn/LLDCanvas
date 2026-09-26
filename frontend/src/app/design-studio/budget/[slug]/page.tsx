'use client'

import { useParams } from 'next/navigation'
import { BudgetSession } from '@/components/studio/budget/BudgetSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

const BREADCRUMB = [
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Budget', href: '/design-studio/budget' },
  { label: 'Problems', href: '/design-studio/budget/problems' },
]

export default function BudgetChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('budget', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <BudgetSession attemptId={attemptId} breadcrumb={BREADCRUMB} /> : null}
    </StudioAttemptLoader>
  )
}

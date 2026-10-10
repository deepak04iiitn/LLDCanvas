'use client'

import { useParams } from 'next/navigation'
import { RefactorSession } from '@/components/studio/refactor/RefactorSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

const BREADCRUMB = [
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Refactor', href: '/dashboard/design-studio/refactor' },
  { label: 'Problems', href: '/dashboard/design-studio/refactor/problems' },
]

export default function RefactorChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('refactor', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <RefactorSession attemptId={attemptId} breadcrumb={BREADCRUMB} /> : null}
    </StudioAttemptLoader>
  )
}

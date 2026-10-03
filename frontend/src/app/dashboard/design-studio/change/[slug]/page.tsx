'use client'

import { useParams } from 'next/navigation'
import { ChangeSession } from '@/components/studio/change/ChangeSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

const BREADCRUMB = [
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Change One Thing', href: '/dashboard/design-studio/change' },
  { label: 'Problems', href: '/dashboard/design-studio/change/problems' },
]

export default function ChangeChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('change_one', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <ChangeSession attemptId={attemptId} breadcrumb={BREADCRUMB} /> : null}
    </StudioAttemptLoader>
  )
}

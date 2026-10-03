'use client'

import { useParams } from 'next/navigation'
import { EvolutionSession } from '@/components/studio/evolution/EvolutionSession'
import {
  StudioAttemptLoader,
  useOpenStudioAttempt,
} from '@/components/studio/challenges/useOpenStudioAttempt'

const BREADCRUMB = [
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Evolution', href: '/dashboard/design-studio/evolution' },
  { label: 'Problems', href: '/dashboard/design-studio/evolution/problems' },
]

export default function EvolutionChallengePage() {
  const { slug } = useParams<{ slug: string }>()
  const { attemptId, loading, error } = useOpenStudioAttempt('evolution', slug)

  return (
    <StudioAttemptLoader loading={loading} error={error}>
      {attemptId ? <EvolutionSession attemptId={attemptId} breadcrumb={BREADCRUMB} /> : null}
    </StudioAttemptLoader>
  )
}

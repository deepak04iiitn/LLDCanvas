'use client'

import { useParams } from 'next/navigation'
import { DebuggerSession } from '@/components/studio/debugger/DebuggerSession'

export default function DebuggerAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  return <DebuggerSession attemptId={attemptId} />
}

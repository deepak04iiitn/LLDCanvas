'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { DebuggerSession } from './DebuggerSession'

export function DebuggerSessionLoader() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '')

  const [challenge, setChallenge] = useState<DebuggerChallenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.debugger.get(id)
        if (!cancelled) setChallenge(data.challenge)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load challenge'
        if (!cancelled) setError(msg)
        toast.error(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <CategoryShell
        title="Bug Hunt"
        backHref="/learn/debugger"
        backLabel="Bug Hunt"
      >
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
        </div>
      </CategoryShell>
    )
  }

  if (error || !challenge) {
    return (
      <CategoryShell
        title="Bug Hunt"
        backHref="/learn/debugger"
        backLabel="Bug Hunt"
      >
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-[14px] text-ink-muted">{error ?? 'Challenge not found.'}</p>
        </div>
      </CategoryShell>
    )
  }

  return (
    <CategoryShell
      title={challenge.title}
      subtitle="Find and fix the bug — then run to verify"
      backHref="/learn/debugger"
      backLabel="Bug Hunt"
      contentClassName="flex min-h-0 flex-1"
    >
      <DebuggerSession challenge={challenge} />
    </CategoryShell>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { studioApi, type StudioPackType } from '@/lib/studio-api'

/**
 * Resolve pack slug → internal attempt id (not shown in the URL).
 */
export function useOpenStudioAttempt(packType: StudioPackType | string, slug: string | undefined) {
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError('Missing challenge')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await studioApi.open(packType, decodeURIComponent(slug))
        if (!cancelled) setAttemptId(res.attemptId)
      } catch (err) {
        if (!cancelled) {
          const msg = (err as Error).message ?? 'Failed to open challenge'
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [packType, slug])

  return { attemptId, loading, error }
}

export function StudioAttemptLoader({
  loading,
  error,
  children,
}: {
  loading: boolean
  error: string | null
  children: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Opening challenge…</span>
      </div>
    )
  }
  if (error || !children) {
    return (
      <div className="flex items-center justify-center p-8 py-24 text-center text-[13px] text-ink-muted">
        {error ?? 'Challenge not found'}
      </div>
    )
  }
  return <>{children}</>
}

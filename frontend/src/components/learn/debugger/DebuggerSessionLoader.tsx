'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'
import { DebuggerSession } from './DebuggerSession'
import { cn } from '@/lib/utils'

export interface DebuggerSessionLoaderProps {
  breadcrumb?: unknown[] // kept for API compat, unused
}

const DIFF_CHIP: Record<string, string> = {
  easy:   'bg-brand/10 text-brand',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-600',
}

export function DebuggerSessionLoader({ breadcrumb: _breadcrumb }: DebuggerSessionLoaderProps) {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '')

  const [challenge, setChallenge] = useState<DebuggerChallenge | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

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

  // ── Full-screen overlay shell ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">

      {/* Slim top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-hairline bg-paper-elevated px-4 py-2.5 sm:px-6">
        <Link
          href="/learn/debugger/problems"
          className="flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Problems
        </Link>

        {challenge && (
          <>
            <div className="mx-1 h-4 w-px bg-hairline" />
            <h1 className="min-w-0 flex-1 truncate font-serif text-[15px] font-medium text-ink sm:text-[17px]">
              {challenge.title}
            </h1>
            <span className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
              DIFF_CHIP[challenge.difficulty] ?? 'bg-paper-elevated text-ink-faint',
            )}>
              {challenge.difficulty}
            </span>
          </>
        )}
      </header>

      {/* Body */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      ) : error || !challenge ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[14px] text-ink-muted">{error ?? 'Challenge not found.'}</p>
        </div>
      ) : (
        <DebuggerSession challenge={challenge} />
      )}
    </div>
  )
}

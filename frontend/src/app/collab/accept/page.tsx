'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth-client'

function CollabAcceptInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { data: session, isPending } = useSession()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [diagramId, setDiagramId] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!token) { setStatus('error'); setMessage('Invalid invite link.'); return }
    if (!session) {
      // Save intended destination, then send to landing auth modal — same
      // pattern as the share-link flow in /editor/[id]/page.tsx
      sessionStorage.setItem('postLoginRedirect', `/collab/accept?token=${token}`)
      router.replace('/?auth=1')
      return
    }

    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    fetch(`${BASE}/collab/accept/${token}`, { method: 'POST', credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error ?? 'Failed')
        return data
      })
      .then(data => {
        setStatus('success')
        setDiagramId(data.diagramId)
        setMessage(`You joined as ${data.role}.`)
        setTimeout(() => router.push(`/editor/${data.diagramId}`), 1800)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.message ?? 'This invite link is invalid or has already been used.')
      })
  }, [token, session, isPending, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4">
      <Link href="/">
        <Wordmark height={36} />
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-hairline bg-paper-elevated p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-paper">
          {status === 'loading' && <Loader2 size={20} className="animate-spin text-brand" />}
          {status === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
          {status === 'error'   && <AlertCircle size={20} className="text-red-500" />}
        </div>

        <h1 className="font-serif text-lg font-medium text-ink">
          {status === 'loading' && 'Joining diagram…'}
          {status === 'success' && 'Access granted!'}
          {status === 'error'   && 'Invite failed'}
        </h1>

        {message && (
          <p className="mt-2 text-sm text-ink-muted">{message}</p>
        )}

        {status === 'success' && diagramId && (
          <p className="mt-1 text-xs text-ink-faint">Redirecting to the editor…</p>
        )}

        {status === 'error' && (
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  )
}

export default function CollabAcceptPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    }>
      <CollabAcceptInner />
    </Suspense>
  )
}

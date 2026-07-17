'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Lock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { EditorShell } from '@/components/editor/EditorShell'
import { MobileEditorGuard } from '@/components/editor/MobileBanner'
import { api } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import type { DiagramFull } from '@/types'

// ─── Share access states ──────────────────────────────────────────────────────
type AccessState =
  | { kind: 'loading' }
  | { kind: 'need-auth' }           // not signed in — must log in first
  | { kind: 'denied'; reason: string }
  | { kind: 'ok' }

export default function EditorPage() {
  const { id }           = useParams<{ id: string }>()
  const router           = useRouter()
  const searchParams     = useSearchParams()
  const shareToken       = searchParams.get('share') ?? undefined
  const problemSlug      = searchParams.get('problem') ?? undefined

  const { data: session, isPending: sessionLoading } = useSession()

  const [diagram,    setDiagram]    = useState<DiagramFull | null>(null)
  const [permission, setPermission] = useState<'view' | 'edit'>('edit')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [access,     setAccess]     = useState<AccessState>({ kind: 'loading' })

  // ── Step 1: resolve share token access (if present) ──────────────────────
  useEffect(() => {
    if (!id) return

    // No share token — owner loading their own diagram, or viewing a community
    // solution. Either way, the diagram fetch in step 2 tells us the real
    // permission (owner => edit, community solution => forced view-only).
    if (!shareToken) {
      setAccess({ kind: 'ok' })
      return
    }

    // Still loading session
    if (sessionLoading) return

    // Not logged in — ask them to sign in
    if (!session) {
      setAccess({ kind: 'need-auth' })
      return
    }

    // Check share access
    api.share.check(shareToken)
      .then(res => {
        if (!res.canAccess) {
          setAccess({ kind: 'denied', reason: res.reason ?? 'You do not have access to this diagram.' })
        } else {
          setPermission(res.permission ?? 'view')
          setAccess({ kind: 'ok' })
        }
      })
      .catch(() => {
        setAccess({ kind: 'denied', reason: 'This share link is invalid or has expired.' })
      })
  }, [id, shareToken, session, sessionLoading])

  // ── Step 2: load diagram once access is confirmed ─────────────────────────
  useEffect(() => {
    if (!id || access.kind !== 'ok') return

    setLoading(true)
    api.diagrams.get(id, shareToken)
      .then(res => {
        setDiagram(res.diagram)
        // Owner requests carry no sharePermission — default to edit.
        // Shared / community-solution requests carry it explicitly.
        if (!shareToken) setPermission(res.sharePermission ?? 'edit')
      })
      .catch(() => {
        toast.error('Could not load diagram')
        setError('UML Diagram not found or access denied.')
      })
      .finally(() => setLoading(false))
  }, [id, access.kind, shareToken])

  // ── Redirect to sign-in when share link needs auth ────────────────────────
  useEffect(() => {
    if (access.kind !== 'need-auth') return
    // Save the intended destination so we can return after sign-in
    const redirect = `/editor/${id}?share=${shareToken}`
    sessionStorage.setItem('postLoginRedirect', redirect)
    router.replace('/?auth=1')
    toast('Please sign in to view this shared diagram.', { duration: 5000, icon: '🔐' })
  }, [access.kind, id, shareToken, router])

  // ── Loading screen ────────────────────────────────────────────────────────
  if (access.kind === 'loading' || loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-[#F8F8F8]">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        {shareToken && (
          <p className="text-sm text-gray-400">Verifying access…</p>
        )}
      </div>
    )
  }

  // ── Access denied ─────────────────────────────────────────────────────────
  if (access.kind === 'denied') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#F8F8F8]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <Lock className="h-7 w-7 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">Access denied</p>
          <p className="mt-1 text-sm text-gray-400">{access.reason}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     transition-colors hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  // ── Diagram load error ────────────────────────────────────────────────────
  if (error || !diagram) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#F8F8F8]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <AlertTriangle className="h-7 w-7 text-amber-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">Could not load diagram</p>
          <p className="mt-1 text-sm text-gray-400">{error ?? 'UML Diagram not found.'}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     transition-colors hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isReadOnly = permission === 'view'

  async function handleRename(title: string) {
    if (isReadOnly) return
    await api.diagrams.rename(id, title)
  }

  return (
    <MobileEditorGuard>
      <EditorShell
        diagramId={id}
        initialTitle={diagram.title}
        initialData={diagram.diagramData}
        onRename={handleRename}
        readOnly={isReadOnly}
        shareToken={shareToken}
        problemSlug={problemSlug}
      />
    </MobileEditorGuard>
  )
}

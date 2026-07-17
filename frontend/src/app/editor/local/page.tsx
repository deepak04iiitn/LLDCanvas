'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { EditorShell } from '@/components/editor/EditorShell'
import { MobileEditorGuard } from '@/components/editor/MobileBanner'
import { useSession } from '@/lib/auth-client'
import { useInterview } from '@/contexts/InterviewContext'
import { getLocalDiagramData, getLocalTitle } from '@/hooks/useLocalDiagram'
import type { DiagramData } from '@/types'

export default function LocalEditorPage() {
  const { data: session, isPending: sessionLoading } = useSession()
  const router = useRouter()
  const { activeSession } = useInterview()

  const [initialData, setInitialData] = useState<DiagramData | null>(null)
  const [initialTitle, setInitialTitle] = useState('Untitled UML Diagram')
  const [ready, setReady] = useState(false)

  // ── Redirect authenticated users away from local mode ─────────────────────
  // (They should use the cloud-backed editor instead) — unless they're
  // resuming or starting a practice session that has no linked diagram, in
  // which case local mode is exactly where the dashboard and setup modal
  // send them, and bouncing them back to /dashboard would kill the session
  // the instant it starts.
  useEffect(() => {
    if (!sessionLoading && session && !activeSession) {
      router.replace('/dashboard')
    }
  }, [session, sessionLoading, activeSession, router])

  // ── Hydrate from localStorage (client-only) ───────────────────────────────
  useEffect(() => {
    const data = getLocalDiagramData()
    const title = typeof window !== 'undefined' ? getLocalTitle() : 'Untitled UML Diagram'
    if (data) setInitialData(data)
    setInitialTitle(title)
    setReady(true)
  }, [])

  // Show spinner while restoring from storage or checking auth
  if (!ready || sessionLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F8F8]">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Auth users with no active practice session are being redirected — render nothing
  if (session && !activeSession) return null

  return (
    <MobileEditorGuard>
      <EditorShell
        diagramId={null}
        initialTitle={initialTitle}
        initialData={initialData}
        localMode
      />
    </MobileEditorGuard>
  )
}

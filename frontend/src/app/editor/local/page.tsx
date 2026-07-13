'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { EditorShell } from '@/components/editor/EditorShell'
import { useSession } from '@/lib/auth-client'
import { getLocalDiagramData, getLocalTitle } from '@/hooks/useLocalDiagram'
import type { DiagramData } from '@/types'

export default function LocalEditorPage() {
  const { data: session, isPending: sessionLoading } = useSession()
  const router = useRouter()

  const [initialData, setInitialData] = useState<DiagramData | null>(null)
  const [initialTitle, setInitialTitle] = useState('Untitled Diagram')
  const [ready, setReady] = useState(false)

  // ── Redirect authenticated users away from local mode ─────────────────────
  // (They should use the cloud-backed editor instead)
  useEffect(() => {
    if (!sessionLoading && session) {
      router.replace('/dashboard')
    }
  }, [session, sessionLoading, router])

  // ── Hydrate from localStorage (client-only) ───────────────────────────────
  useEffect(() => {
    const data = getLocalDiagramData()
    const title = typeof window !== 'undefined' ? getLocalTitle() : 'Untitled Diagram'
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

  // Auth users are being redirected — render nothing
  if (session) return null

  return (
    <EditorShell
      diagramId={null}
      initialTitle={initialTitle}
      initialData={initialData}
      localMode
    />
  )
}

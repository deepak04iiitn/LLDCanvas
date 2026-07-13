'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EditorShell } from '@/components/editor/EditorShell'
import { MobileEditorGuard } from '@/components/editor/MobileBanner'
import { api } from '@/lib/api'
import type { DiagramFull } from '@/types'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [diagram, setDiagram] = useState<DiagramFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.diagrams
      .get(id)
      .then(res => setDiagram(res.diagram))
      .catch(() => {
        toast.error('Could not load diagram')
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F8F8]">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !diagram) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-[#F8F8F8]">
        <p className="text-sm text-gray-500">Diagram not found or you don&apos;t have access.</p>
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

  async function handleRename(title: string) {
    await api.diagrams.rename(id, title)
  }

  return (
    <MobileEditorGuard>
      <EditorShell
        diagramId={id}
        initialTitle={diagram.title}
        initialData={diagram.diagramData}
        onRename={handleRename}
      />
    </MobileEditorGuard>
  )
}

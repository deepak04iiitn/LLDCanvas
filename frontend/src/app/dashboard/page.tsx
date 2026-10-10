'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Monitor, Timer, X } from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
import { NewDiagramModal } from '@/components/dashboard/NewDiagramModal'
import { ResumeSurface } from '@/components/dashboard/diagrams/ResumeSurface'
import { DiagramLibrary } from '@/components/dashboard/diagrams/DiagramLibrary'
import { DiagramPeek } from '@/components/dashboard/diagrams/DiagramPeek'
import type { LibrarySort } from '@/components/dashboard/diagrams/groupDiagramsByRecency'
import { useSession } from '@/lib/auth'
import { useInterview } from '@/contexts/InterviewContext'
import { api } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import {
  hasMigratePending,
  getLocalDiagramData,
  getLocalTitle,
  clearLocalDiagram,
} from '@/hooks/useLocalDiagram'
import { DiagramSummary, InterviewSession } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending: sessionLoading } = useSession()
  const { activeSession: runningSession, startSession } = useInterview()

  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<LibrarySort>('recent')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [incompleteSession, setIncompleteSession] = useState<InterviewSession | null>(null)
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false)

  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [peekId, setPeekId] = useState<string | null>(null)
  const [peekOpen, setPeekOpen] = useState(false)
  const [forceRename, setForceRename] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const isSearching = Boolean(debouncedSearch.trim())

  const resumeDiagram = useMemo(() => {
    if (isSearching || diagrams.length === 0) return null
    return [...diagrams].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0]
  }, [diagrams, isSearching])

  const peekDiagram = peekId
    ? diagrams.find(d => d._id === peekId) ?? null
    : null

  const deleteTarget = deleteTargetId
    ? diagrams.find(d => d._id === deleteTargetId) ?? null
    : null

  useEffect(() => { document.title = 'Dashboard - LLDCanvas' }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => setIsNarrow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      import('@/hooks/usePlan').then(({ invalidatePlan }) => invalidatePlan()).catch(() => {})
      toast.success('Plan upgraded! Enjoy your new features.', { duration: 5000 })
      router.replace('/dashboard')
    }
  }, [router, searchParams])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewModalOpen(true)
      router.replace('/dashboard', { scroll: false })
    }
  }, [router, searchParams])

  useEffect(() => {
    if (sessionLoading) return
    if (!session) { router.replace('/'); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewAsUser = searchParams.get('view') === 'user'
    if ((session.user as any).isAdmin && !viewAsUser) { router.replace('/admin'); return }
  }, [session, sessionLoading, router, searchParams])

  useEffect(() => {
    if (!session || !hasMigratePending()) return
    async function migrate() {
      try {
        const localData = getLocalDiagramData()
        const localTitle = getLocalTitle()
        if (!localData) { clearLocalDiagram(); return }
        const { diagram } = await api.diagrams.create({ title: localTitle })
        await api.diagrams.save(diagram._id, localData)
        clearLocalDiagram()
        toast.success('Your local diagram has been saved to the cloud!')
        router.push(`/editor/${diagram._id}`)
      } catch {
        toast.error('Could not migrate your local diagram. Your work is still in local storage.')
        clearLocalDiagram()
      }
    }
    migrate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!session) return
    api.interview.list(1, 5)
      .then(({ sessions }) => {
        const active = sessions.find(s => s.status === 'active')
        if (active) setIncompleteSession(active)
      })
      .catch(() => {})
  }, [session])

  const fetchDiagrams = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const { diagrams: list } = await api.diagrams.list(q)
      setDiagrams(list)
      setHighlightedId(prev => {
        if (prev && list.some(d => d._id === prev)) return prev
        return list[0]?._id ?? null
      })
      setPeekId(prev => {
        if (prev && !list.some(d => d._id === prev)) {
          setPeekOpen(false)
          return null
        }
        return prev
      })
    } catch {
      toast.error('Failed to load diagrams')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) fetchDiagrams(debouncedSearch || undefined)
  }, [session, debouncedSearch, fetchDiagrams])

  function handleCreated(d: DiagramSummary) {
    setDiagrams(prev => [d, ...prev])
    setHighlightedId(d._id)
  }

  function openEditor(id: string) {
    router.push(`/editor/${id}`)
  }

  function openExport(id: string) {
    router.push(`/editor/${id}?export=png`)
  }

  function openPeek(id: string, rename = false) {
    setHighlightedId(id)
    setPeekId(id)
    setPeekOpen(true)
    if (rename) setForceRename(true)
  }

  function togglePeek(id: string) {
    if (peekOpen && peekId === id) {
      setPeekOpen(false)
      return
    }
    openPeek(id)
  }

  function closePeek() {
    setPeekOpen(false)
  }

  function onRowActivate(id: string) {
    if (isNarrow) {
      openEditor(id)
      return
    }
    togglePeek(id)
  }

  async function commitRename(id: string, title: string) {
    try {
      await api.diagrams.rename(id, title)
      setDiagrams(prev => prev.map(d => (d._id === id ? { ...d, title } : d)))
    } catch {
      toast.error('Failed to rename diagram')
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const { diagram: copy } = await api.diagrams.duplicate(id)
      const summary = copy as DiagramSummary
      setDiagrams(prev => [summary, ...prev])
      setHighlightedId(summary._id)
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  function requestDelete(id: string) {
    setDeleteTargetId(id)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      const id = deleteTargetId
      await api.diagrams.delete(id)
      setDiagrams(prev => {
        const next = prev.filter(d => d._id !== id)
        setHighlightedId(next[0]?._id ?? null)
        return next
      })
      if (peekId === id) {
        setPeekOpen(false)
        setPeekId(null)
      }
      toast.success('Diagram deleted')
      setConfirmOpen(false)
      setDeleteTargetId(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-pulse rounded-xl bg-hairline" />
      </div>
    )
  }
  if (!session) return null

  return (
    <AppShell
      mobileBanner={
        <div className="flex items-center gap-2 border-b border-hairline bg-gold-tint px-4 py-2 text-xs text-ink sm:hidden">
          <Monitor className="h-3.5 w-3.5 shrink-0 text-gold" />
          LLDCanvas works best on a desktop browser.
        </div>
      }
    >
      <div className="flex h-full flex-col overflow-hidden bg-paper">

        {incompleteSession && !resumeBannerDismissed && !runningSession && (
          <div className="flex shrink-0 items-center gap-3 border-b border-amber-200/80 bg-amber-50 px-4 py-2 sm:px-5">
            <Timer className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="min-w-0 flex-1 truncate text-sm text-amber-900">
              Unfinished{' '}
              <span className="font-semibold">&ldquo;{incompleteSession.title}&rdquo;</span>
              {' · '}
              {formatDistanceToNow(new Date(incompleteSession.startedAt), { addSuffix: true })}
            </p>
            <button
              type="button"
              onClick={() => {
                startSession(incompleteSession)
                router.push(
                  incompleteSession.diagramId
                    ? `/editor/${incompleteSession.diagramId}`
                    : '/editor/local',
                )
              }}
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Resume
            </button>
            <button type="button" onClick={() => setResumeBannerDismissed(true)} className="text-amber-400 hover:text-amber-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {resumeDiagram && (
          <ResumeSurface
            diagram={resumeDiagram}
            onOpen={() => openEditor(resumeDiagram._id)}
            onRename={() => openPeek(resumeDiagram._id, true)}
            onDuplicate={() => handleDuplicate(resumeDiagram._id)}
            onExport={() => openExport(resumeDiagram._id)}
            onDelete={() => requestDelete(resumeDiagram._id)}
          />
        )}

        {!resumeDiagram && (
          <header className="flex h-12 shrink-0 items-center border-b border-hairline bg-paper-elevated px-4 sm:px-6">
            <h1 className="font-serif text-base font-medium tracking-tight text-ink">
              Diagrams
            </h1>
          </header>
        )}

        <DiagramLibrary
          diagrams={diagrams}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          highlightedId={highlightedId}
          onHighlight={setHighlightedId}
          peekOpen={peekOpen}
          onOpen={openEditor}
          onTogglePeek={togglePeek}
          onClosePeek={closePeek}
          onNew={() => setNewModalOpen(true)}
          onRename={id => openPeek(id, true)}
          onDuplicate={handleDuplicate}
          onExport={openExport}
          onDelete={requestDelete}
          onRowActivate={onRowActivate}
          isSearching={isSearching}
        />
      </div>

      {!isNarrow && (
        <DiagramPeek
          diagram={peekDiagram}
          open={peekOpen}
          forceRename={forceRename}
          onForceRenameConsumed={() => setForceRename(false)}
          onClose={closePeek}
          onOpen={() => peekId && openEditor(peekId)}
          onRename={async title => {
            if (peekId) await commitRename(peekId, title)
          }}
          onDuplicate={() => peekId && handleDuplicate(peekId)}
          onExport={() => peekId && openExport(peekId)}
          onDelete={() => peekId && requestDelete(peekId)}
        />
      )}

      <NewDiagramModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreated={handleCreated}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl border-hairline sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete diagram?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">&ldquo;{deleteTarget?.title}&rdquo;</span> will be
            permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

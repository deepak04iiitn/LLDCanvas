'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Search, Plus, Pen, Monitor, Timer, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppShell } from '@/components/dashboard/AppShell'
import { DiagramCard } from '@/components/dashboard/DiagramCard'
import { NewDiagramModal } from '@/components/dashboard/NewDiagramModal'
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

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()
  const { activeSession: runningSession, startSession } = useInterview()

  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [incompleteSession, setIncompleteSession] = useState<InterviewSession | null>(null)
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  // ─── Page title ─────────────────────────────────────────────────────────────
  useEffect(() => { document.title = 'Dashboard — LLDCanvas' }, [])

  // ─── Upgrade success toast ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === '1') {
      toast.success('Plan upgraded! Enjoy your new features.', { duration: 5000 })
      router.replace('/dashboard')
    }
  }, [router])

  // ─── Auth + admin guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionLoading) return
    if (!session) { router.replace('/'); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).isAdmin) { router.replace('/admin'); return }
  }, [session, sessionLoading, router])

  // ─── Local → Cloud migration ─────────────────────────────────────────────
  // Fires once after sign-in when the user previously clicked "Sign in to save"
  // from the local editor banner.
  useEffect(() => {
    if (!session || !hasMigratePending()) return

    async function migrate() {
      try {
        const localData = getLocalDiagramData()
        const localTitle = getLocalTitle()
        if (!localData) { clearLocalDiagram(); return }

        const { diagram } = await api.diagrams.create({ title: localTitle })
        // Save the local canvas data into the newly created diagram
        await api.diagrams.save(diagram._id, localData)

        clearLocalDiagram()
        toast.success('Your local diagram has been saved to the cloud!')
        router.push(`/editor/${diagram._id}`)
      } catch {
        toast.error('Could not migrate your local diagram. Your work is still in local storage.')
        clearLocalDiagram() // Clear the flag so we don't retry forever
      }
    }

    migrate()
  // Run only once when session appears — intentionally no dep on migrate fn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // ─── Check for incomplete interview sessions ─────────────────────────────
  useEffect(() => {
    if (!session) return
    api.interview.list(1, 5)
      .then(({ sessions }) => {
        const active = sessions.find(s => s.status === 'active')
        if (active) setIncompleteSession(active)
      })
      .catch(() => {/* silent */})
  }, [session])

  // ─── Fetch diagrams ─────────────────────────────────────────────────────────
  const fetchDiagrams = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const { diagrams } = await api.diagrams.list(q)
      setDiagrams(diagrams)
    } catch {
      toast.error('Failed to load diagrams')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) fetchDiagrams(debouncedSearch || undefined)
  }, [session, debouncedSearch, fetchDiagrams])

  // ─── Card event handlers ─────────────────────────────────────────────────────
  function handleDeleted(id: string) {
    setDiagrams((prev) => prev.filter((d) => d._id !== id))
  }
  function handleDuplicated(d: DiagramSummary) {
    setDiagrams((prev) => [d, ...prev])
  }
  function handleRenamed(id: string, title: string) {
    setDiagrams((prev) => prev.map((d) => (d._id === id ? { ...d, title } : d)))
  }
  function handleCreated(d: DiagramSummary) {
    setDiagrams((prev) => [d, ...prev])
  }

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-md border border-hairline-strong bg-paper-elevated" />
          <p className="text-sm text-ink-faint">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <AppShell
      mobileBanner={
        <div className="flex items-center gap-2 border-b border-hairline bg-gold-tint px-4 py-2 text-xs text-ink sm:hidden">
          <Monitor className="h-3.5 w-3.5 shrink-0 text-gold" />
          LLDCanvas works best on a desktop browser — the editor isn&apos;t supported on mobile.
        </div>
      }
    >
      <div className="flex h-full flex-col overflow-hidden">

        {/* ── Resume banner — incomplete session ─────────────────────────── */}
        {incompleteSession && !resumeBannerDismissed && !runningSession && (
          <div className="flex shrink-0 items-center gap-3 border-b border-amber-200 bg-amber-50 px-5 py-2.5 sm:px-8">
            <Timer className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-sm text-amber-800">
              Unfinished session{' '}
              <span className="font-medium">"{incompleteSession.title}"</span>
              {' '}from{' '}
              {formatDistanceToNow(new Date(incompleteSession.startedAt), { addSuffix: true })}
            </p>
            <button
              onClick={() => {
                startSession(incompleteSession)
                router.push(
                  incompleteSession.diagramId
                    ? `/editor/${incompleteSession.diagramId}`
                    : '/editor/local'
                )
              }}
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white
                         transition-colors hover:bg-amber-600"
            >
              Resume →
            </button>
            <button
              onClick={() => setResumeBannerDismissed(true)}
              className="shrink-0 text-amber-400 hover:text-amber-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-5 sm:px-8">
          <div>
            <h1 className="font-serif text-xl font-medium text-ink">My UML Diagrams</h1>
            <p className="mt-0.5 text-sm text-ink-faint">
              {loading ? 'Loading…' : `${diagrams.length} UML diagram${diagrams.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            onClick={() => setNewModalOpen(true)}
            className="gap-2 bg-brand text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New UML Diagram</span>
          </Button>
        </header>

        {/* Search */}
        <div className="shrink-0 px-5 pt-5 pb-2 sm:px-8">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search UML diagrams…"
              className="h-9 rounded-md border-hairline-strong bg-paper-elevated pl-9 text-sm transition-all focus:border-brand focus:ring-brand/15"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4 sm:px-8">
          {loading ? (
            <SkeletonGrid />
          ) : diagrams.length === 0 ? (
            <EmptyState search={search} onNew={() => setNewModalOpen(true)} />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {diagrams.map((d) => (
                  <DiagramCard
                    key={d._id}
                    diagram={d}
                    onDeleted={handleDeleted}
                    onDuplicated={handleDuplicated}
                    onRenamed={handleRenamed}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <NewDiagramModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreated={handleCreated}
      />

    </AppShell>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-hairline bg-paper-elevated">
          <div className="h-36 animate-pulse bg-hairline/50" />
          <div className="space-y-2 px-4 py-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-hairline/60" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-hairline/40" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search, onNew }: { search: string; onNew: () => void }) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center pb-16"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl border border-hairline-strong bg-paper-elevated">
        {search
          ? <Search size={30} className="text-ink-faint" />
          : <Pen size={30} className="text-brand" />
        }
      </div>
      <h2 className="mb-2 text-lg font-medium text-ink">
        {search ? `No results for "${search}"` : 'No diagrams yet'}
      </h2>
      <p className="mb-6 max-w-xs text-center text-sm text-ink-faint">
        {search
          ? 'Try a different search term or clear the search.'
          : 'Create your first UML diagram to get started. It only takes a few seconds.'}
      </p>
      {!search && (
        <Button
          onClick={onNew}
          className="gap-2 bg-brand text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.97]"
        >
          <Plus size={14} /> Create your first diagram
        </Button>
      )}
    </motion.div>
  )
}

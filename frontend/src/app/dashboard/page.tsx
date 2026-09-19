'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Pen,
  Monitor,
  Timer,
  X,
  ArrowUpRight,
  Users,
  Pencil,
  Copy,
  Trash2,
  Download,
  MoreHorizontal,
  LayoutTemplate,
} from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
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
import { formatRelativeTime, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending: sessionLoading } = useSession()
  const { activeSession: runningSession, startSession } = useInterview()

  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [incompleteSession, setIncompleteSession] = useState<InterviewSession | null>(null)
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(search, 300)
  const selected = diagrams.find(d => d._id === selectedId) ?? diagrams[0] ?? null

  useEffect(() => { document.title = 'Dashboard - LLDCanvas' }, [])

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
    if ((session.user as any).isAdmin) { router.replace('/admin'); return }
  }, [session, sessionLoading, router])

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
      setSelectedId(prev => {
        if (prev && list.some(d => d._id === prev)) return prev
        return list[0]?._id ?? null
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

  useEffect(() => {
    if (renaming) renameRef.current?.select()
  }, [renaming])

  function handleCreated(d: DiagramSummary) {
    setDiagrams(prev => [d, ...prev])
    setSelectedId(d._id)
  }

  function startRename() {
    if (!selected) return
    setRenameValue(selected.title)
    setRenaming(true)
  }

  async function commitRename() {
    if (!selected) return
    const trimmed = renameValue.trim()
    setRenaming(false)
    if (!trimmed || trimmed === selected.title) return
    try {
      await api.diagrams.rename(selected._id, trimmed)
      setDiagrams(prev => prev.map(d => (d._id === selected._id ? { ...d, title: trimmed } : d)))
    } catch {
      toast.error('Failed to rename diagram')
    }
  }

  async function handleDuplicate() {
    if (!selected) return
    try {
      const { diagram: copy } = await api.diagrams.duplicate(selected._id)
      const summary = copy as DiagramSummary
      setDiagrams(prev => [summary, ...prev])
      setSelectedId(summary._id)
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    try {
      const id = selected._id
      await api.diagrams.delete(id)
      setDiagrams(prev => {
        const next = prev.filter(d => d._id !== id)
        setSelectedId(next[0]?._id ?? null)
        return next
      })
      toast.success('Diagram deleted')
      setConfirmOpen(false)
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

        {/* Slim bar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-hairline bg-paper-elevated px-3 sm:px-4">
          <h1 className="shrink-0 text-sm font-semibold text-ink">Diagrams</h1>
          {!loading && (
            <span className="rounded-md bg-hairline/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-ink-muted">
              {diagrams.length}
            </span>
          )}

          <div className="relative ml-1 min-w-0 flex-1 max-w-64">
            <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full rounded-lg border border-hairline bg-paper pl-8 pr-7 text-xs outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-faint hover:text-ink">
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            <Plus size={14} />
            New
          </button>
        </header>

        {/* Master–detail */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* List rail — fixed height, scrolls internally */}
          <aside className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-r border-hairline bg-paper-elevated sm:w-72 lg:w-80">
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {loading ? (
                <div className="space-y-1.5 p-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-hairline/50" />
                  ))}
                </div>
              ) : diagrams.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-16 text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint">
                    {search ? <Search className="h-5 w-5 text-brand" /> : <Pen className="h-5 w-5 text-brand" />}
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {search ? 'No matches' : 'No diagrams yet'}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {search ? 'Try another search' : 'Create your first UML diagram'}
                  </p>
                  {!search && (
                    <button
                      type="button"
                      onClick={() => setNewModalOpen(true)}
                      className="mt-4 text-xs font-semibold text-brand hover:underline"
                    >
                      + New diagram
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {diagrams.map((d, i) => {
                    const active = selected?._id === d._id
                    return (
                      <motion.button
                        key={d._id}
                        type="button"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.15) }}
                        onClick={() => {
                          setSelectedId(d._id)
                          setRenaming(false)
                          // Mobile: no detail pane — open editor directly
                          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches) {
                            router.push(`/editor/${d._id}`)
                          }
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                          active
                            ? 'bg-brand-tint shadow-sm ring-1 ring-brand/15'
                            : 'hover:bg-hairline/60',
                        )}
                      >
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-hairline bg-paper">
                          {d.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <LayoutTemplate className="h-3.5 w-3.5 text-ink-faint/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn('truncate text-[13px] font-semibold', active ? 'text-brand' : 'text-ink')}>
                            {d.title}
                          </p>
                          <p className="truncate text-[11px] text-ink-faint">
                            {formatRelativeTime(d.updatedAt)}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Detail stage */}
          <main className="relative hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden sm:flex">
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center px-6 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-hairline-strong bg-paper-elevated">
                    <LayoutTemplate className="h-7 w-7 text-ink-faint" />
                  </div>
                  <p className="text-sm font-medium text-ink">Select a diagram</p>
                  <p className="mt-1 max-w-xs text-xs text-ink-faint">
                    Or create a new one to start designing.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  {/* Detail chrome */}
                  <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline bg-paper-elevated/80 px-5 py-4 backdrop-blur-sm lg:px-8">
                    <div className="min-w-0 flex-1">
                      {renaming ? (
                        <Input
                          ref={renameRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename()
                            if (e.key === 'Escape') setRenaming(false)
                          }}
                          className="h-9 max-w-md text-base font-semibold"
                          autoFocus
                        />
                      ) : (
                        <h2
                          className="truncate text-lg font-semibold tracking-tight text-ink lg:text-xl"
                          onDoubleClick={startRename}
                          title="Double-click to rename"
                        >
                          {selected.title}
                        </h2>
                      )}
                      <p className="mt-1 text-xs text-ink-faint">
                        Updated {formatRelativeTime(selected.updatedAt)}
                        <span className="mx-1.5 text-hairline-strong">·</span>
                        Created {formatRelativeTime(selected.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink-muted hover:bg-hairline/60 hover:text-ink"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={startRename} className="gap-2">
                            <Pencil size={13} /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
                            <Copy size={13} /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/editor/${selected._id}?export=png`)}
                            className="gap-2"
                          >
                            <Download size={13} /> Export PNG
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmOpen(true)}
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 size={13} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button
                        type="button"
                        onClick={() => router.push(`/editor/${selected._id}?collab=1`)}
                        className="hidden h-9 items-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink md:inline-flex"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Share
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/editor/${selected._id}`)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover"
                      >
                        Open editor
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview stage — thumbnail fills the frame */}
                  <div className="relative min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/editor/${selected._id}`)}
                      className="group relative h-full w-full overflow-hidden rounded-2xl border border-hairline bg-paper shadow-sm transition-shadow hover:shadow-md"
                    >
                      {selected.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selected.thumbnail}
                          alt={selected.title}
                          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full flex-col items-center justify-center gap-3"
                          style={{
                            backgroundImage: 'radial-gradient(circle, var(--hairline) 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                          }}
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint">
                            <LayoutTemplate className="h-6 w-6 text-brand" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-ink">Blank canvas</p>
                            <p className="mt-0.5 text-xs text-ink-faint">Open the editor to start drawing</p>
                          </div>
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/45 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 rounded-full bg-paper-elevated px-4 py-2 text-sm font-semibold text-ink shadow-lg">
                          Open editor <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

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
            <span className="font-medium text-ink">&ldquo;{selected?.title}&rdquo;</span> will be
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

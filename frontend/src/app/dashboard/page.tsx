'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  FolderOpen, LayoutTemplate, Settings, Search,
  Plus, LogOut, Pen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DiagramCard } from '@/components/dashboard/DiagramCard'
import { NewDiagramModal } from '@/components/dashboard/NewDiagramModal'
import { useSession, signOut } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import {
  hasMigratePending,
  getLocalDiagramData,
  getLocalTitle,
  clearLocalDiagram,
} from '@/hooks/useLocalDiagram'
import { DiagramSummary } from '@/types'

// ─── Sidebar nav ───────────────────────────────────────────────────────────────

const NAV = [
  { label: 'My Diagrams', href: '/dashboard',           Icon: FolderOpen },
  { label: 'Templates',   href: '/dashboard/templates',  Icon: LayoutTemplate },
  { label: 'Settings',    href: '/settings',             Icon: Settings },
]

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()

  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newModalOpen, setNewModalOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  // ─── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/')
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

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F8F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 animate-pulse" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">

      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">L</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">LLDCanvas</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = item.href === '/dashboard'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <item.Icon
                  size={15}
                  className={active ? 'text-indigo-600' : 'text-gray-400'}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-indigo-600 text-xs font-semibold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{session.user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-0.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-150"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-[#F8F8F8] border-b border-gray-100 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Diagrams</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading…' : `${diagrams.length} diagram${diagrams.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            onClick={() => setNewModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150 gap-2 shadow-sm"
          >
            <Plus size={15} />
            New Diagram
          </Button>
        </header>

        {/* Search */}
        <div className="px-8 pt-5 pb-2 shrink-0">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagrams…"
              className="pl-9 h-9 bg-white border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
          {loading ? (
            <SkeletonGrid />
          ) : diagrams.length === 0 ? (
            <EmptyState search={search} onNew={() => setNewModalOpen(true)} />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      </main>

      <NewDiagramModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="h-36 bg-gray-100 animate-pulse" />
          <div className="px-4 py-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-gray-50 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search, onNew }: { search: string; onNew: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full pb-16"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
        {search
          ? <Search size={32} className="text-indigo-300" />
          : <Pen size={32} className="text-indigo-300" />
        }
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {search ? `No results for "${search}"` : 'No diagrams yet'}
      </h2>
      <p className="text-sm text-gray-400 text-center max-w-xs mb-6">
        {search
          ? 'Try a different search term or clear the search.'
          : 'Create your first UML diagram to get started. It only takes a few seconds.'}
      </p>
      {!search && (
        <Button
          onClick={onNew}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all gap-2"
        >
          <Plus size={14} /> Create your first diagram
        </Button>
      )}
    </motion.div>
  )
}

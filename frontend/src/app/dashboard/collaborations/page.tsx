'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Users, MessageSquareText, Share2, Clock, GitBranch,
  ChevronRight, CheckCircle2, UserCheck, Save, ArrowUpRight,
  Layers, Hourglass, RefreshCw, Lock, Rocket, ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Stats = Awaited<ReturnType<typeof api.collab.myStats>>
type Diagrams = Awaited<ReturnType<typeof api.collab.myDiagrams>>
type ActivityEvent = Awaited<ReturnType<typeof api.collab.activity>>['events'][number]
type VersionEntry = Awaited<ReturnType<typeof api.collab.versions>>['versions'][number]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  return formatDistanceToNow(new Date(d), { addSuffix: true })
}

function avatarColor(str: string) {
  const colors = [
    '#4f8ef7', '#e07b54', '#6dbf6d', '#c97bc9',
    '#f0bb4f', '#5bc4c4', '#e06b9a', '#7b8ef7',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(name: string) {
  return name.split('@')[0].slice(0, 2).toUpperCase()
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, Icon, accentClass, bgClass,
}: {
  label: string; value: string | number; sub?: string
  Icon: typeof Users; accentClass: string; bgClass: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className={cn('mt-2 text-3xl font-black tabular-nums', accentClass)}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-ink-faint">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', bgClass)}>
          <Icon size={18} className={accentClass} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Activity icon + color ──────────────────────────────────────────────────────

function EventIcon({ type }: { type: ActivityEvent['type'] }) {
  if (type === 'comment') return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50">
      <MessageSquareText size={14} className="text-violet-500" />
    </div>
  )
  if (type === 'invite_accepted') return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
      <UserCheck size={14} className="text-emerald-500" />
    </div>
  )
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
      <Save size={14} className="text-blue-500" />
    </div>
  )
}

// ─── Version History Drawer ─────────────────────────────────────────────────────

function VersionHistoryDrawer({
  diagramId,
  diagramTitle,
  onClose,
}: {
  diagramId: string
  diagramTitle: string
  onClose: () => void
}) {
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    api.collab.versions(diagramId)
      .then(d => setVersions(d.versions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [diagramId])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[95vw] flex-col border-l border-hairline bg-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Version History</h3>
            <p className="mt-0.5 text-[11px] text-ink-faint truncate max-w-[220px]">{diagramTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition hover:bg-hairline hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-hairline" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hairline">
                <GitBranch size={20} className="text-ink-faint" />
              </div>
              <p className="text-sm font-medium text-ink-muted">No versions yet</p>
              <p className="text-xs text-ink-faint">Versions are recorded on every save</p>
            </div>
          ) : (
            <div className="relative pl-4">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-hairline" />

              <div className="space-y-1">
                {versions.map((v, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative flex gap-3 rounded-xl p-3 transition hover:bg-hairline/60"
                  >
                    {/* Dot */}
                    <div className="absolute left-[-5px] top-[18px] flex h-3 w-3 items-center justify-center">
                      <div className={cn(
                        'h-2.5 w-2.5 rounded-full border-2 border-white',
                        i === 0 ? 'bg-brand' : 'bg-hairline',
                      )} />
                    </div>

                    <div className="min-w-0 flex-1 pl-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                          style={{ backgroundColor: avatarColor(v.userName) }}
                        >
                          {v.userName[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-ink">{v.userName}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-ink-faint">
                        <span className="flex items-center gap-1">
                          <Layers size={9} /> {v.nodeCount} nodes
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 size={9} /> {v.edgeCount} edges
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-ink-faint">
                        {format(new Date(v.createdAt), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CollaborationsPage() {
  const { isFree, plan } = usePlan()
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [diagrams,   setDiagrams]   = useState<Diagrams | null>(null)
  const [events,     setEvents]     = useState<ActivityEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [versionFor, setVersionFor] = useState<{ id: string; title: string } | null>(null)
  const [activeTab,  setActiveTab]  = useState<'owned' | 'collaborating'>('owned')
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    try {
      const [s, d, a] = await Promise.all([
        api.collab.myStats(),
        api.collab.myDiagrams(),
        api.collab.activity(),
      ])
      setStats(s)
      setDiagrams(d)
      setEvents(a.events)
    } catch { /* no-op */ }
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const statCards = stats ? [
    { label: 'Diagrams Shared',     value: stats.sharedDiagrams,      sub: 'you own & shared',      Icon: Share2,          accentClass: 'text-brand',         bgClass: 'bg-brand/8' },
    { label: 'Collaborating On',    value: stats.collaboratingOn,     sub: 'invited by others',     Icon: Users,           accentClass: 'text-violet-600',    bgClass: 'bg-violet-50' },
    { label: 'Collaborators',       value: stats.totalCollaborators,  sub: 'unique contributors',   Icon: UserCheck,       accentClass: 'text-emerald-600',   bgClass: 'bg-emerald-50' },
    { label: 'Discussions',         value: stats.totalComments,       sub: 'across shared diagrams', Icon: MessageSquareText, accentClass: 'text-amber-600',  bgClass: 'bg-amber-50' },
  ] : []

  const skeletonCards = [...Array(4)].map((_, i) => (
    <div key={i} className="h-28 animate-pulse rounded-2xl bg-hairline" />
  ))

  const ownedList       = diagrams?.owned ?? []
  const collaboratingList = diagrams?.collaborating ?? []

  if (isFree) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
                <Lock className="h-8 w-8 text-brand" />
              </div>
            </div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Rocket className="h-3 w-3" /> Pro Feature
            </span>
            <h2 className="mb-2 text-2xl font-bold text-ink">Collaborations</h2>
            <p className="mb-2 text-sm text-ink-muted">
              Invite teammates to edit your diagrams in real-time, with live cursors, @mentions, and discussion threads.
            </p>
            <p className="mb-8 text-sm text-ink-muted">
              <span className="font-medium text-ink">Pro</span>: Up to 3 collaborators per diagram
              &nbsp;·&nbsp;
              <span className="font-medium text-ink">Ultimate</span>: Unlimited + activity timeline + version history
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand/90 transition-colors shadow-lg shadow-brand/25"
            >
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-hairline bg-paper-elevated px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-ink">Collaborations</h1>
              <p className="mt-0.5 text-xs text-ink-faint">
                Real-time shared diagrams, activity feed & version history
              </p>
            </div>
            <button
              onClick={() => load(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted transition hover:bg-hairline hover:text-ink',
                refreshing && 'opacity-60 pointer-events-none',
              )}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {loading
              ? skeletonCards
              : statCards.map((c, i) => (
                  <StatCard
                    key={i}
                    label={c.label}
                    value={c.value}
                    sub={c.sub}
                    Icon={c.Icon}
                    accentClass={c.accentClass}
                    bgClass={c.bgClass}
                  />
                ))
            }
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

            {/* ── Left: Shared diagrams ───────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-hairline p-1 w-fit">
                {(['owned', 'collaborating'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                      activeTab === tab
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-ink-faint hover:text-ink',
                    )}
                  >
                    {tab === 'owned' ? 'Diagrams I Share' : 'Collaborating On'}
                    <span className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                      activeTab === tab ? 'bg-brand/10 text-brand' : 'bg-paper text-ink-faint',
                    )}>
                      {tab === 'owned' ? ownedList.length : collaboratingList.length}
                    </span>
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-hairline" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'owned' ? (
                    <motion.div
                      key="owned"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {ownedList.length === 0 ? (
                        <EmptyState
                          icon={Share2}
                          title="No shared diagrams yet"
                          body="Invite collaborators from the editor to get started."
                        />
                      ) : ownedList.map((d, i) => (
                        <motion.div
                          key={d._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                          {/* Thumbnail */}
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-hairline bg-paper-elevated">
                            {d.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={d.thumbnail} alt={d.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Layers size={16} className="text-ink-faint opacity-40" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-ink">{d.title}</p>
                              {d.collaborators.some(c => c.status === 'pending') && (
                                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                                  Pending
                                </span>
                              )}
                            </div>

                            {/* Collaborator avatars */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {d.collaborators.slice(0, 5).map((c, ci) => (
                                  <div
                                    key={ci}
                                    title={`${c.email} · ${c.role}`}
                                    className={cn(
                                      'flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white',
                                      c.status === 'pending' && 'opacity-50',
                                    )}
                                    style={{ backgroundColor: avatarColor(c.email) }}
                                  >
                                    {initials(c.email)}
                                  </div>
                                ))}
                                {d.collaborators.length > 5 && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-hairline text-[8px] font-semibold text-ink-faint">
                                    +{d.collaborators.length - 5}
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] text-ink-faint">
                                {d.collaborators.length} collaborator{d.collaborators.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            <p className="mt-1 text-[10px] text-ink-faint">
                              Updated {timeAgo(d.updatedAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 flex-col gap-1.5">
                            <Link
                              href={`/editor/${d._id}`}
                              className="flex items-center gap-1 rounded-lg bg-brand/8 px-2.5 py-1 text-[11px] font-medium text-brand transition hover:bg-brand/15"
                            >
                              Open <ArrowUpRight size={10} />
                            </Link>
                            <button
                              onClick={() => setVersionFor({ id: d._id, title: d.title })}
                              className="flex items-center gap-1 rounded-lg bg-hairline px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:bg-gray-200 hover:text-ink"
                            >
                              <GitBranch size={10} /> History
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collaborating"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {collaboratingList.length === 0 ? (
                        <EmptyState
                          icon={Users}
                          title="Not collaborating on any diagrams"
                          body="Accept an invite from another user to see their diagrams here."
                        />
                      ) : collaboratingList.map((d, i) => (
                        <motion.div
                          key={d._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-hairline bg-paper-elevated">
                            {d.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={d.thumbnail} alt={d.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Layers size={16} className="text-ink-faint opacity-40" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{d.title}</p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                                d.myRole === 'editor'
                                  ? 'bg-brand/10 text-brand'
                                  : 'bg-hairline text-ink-faint',
                              )}>
                                {d.myRole}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] text-ink-faint">
                              Updated {timeAgo(d.updatedAt)}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col gap-1.5">
                            <Link
                              href={`/editor/${d._id}`}
                              className="flex items-center gap-1 rounded-lg bg-brand/8 px-2.5 py-1 text-[11px] font-medium text-brand transition hover:bg-brand/15"
                            >
                              Open <ArrowUpRight size={10} />
                            </Link>
                            <button
                              onClick={() => setVersionFor({ id: d._id, title: d.title })}
                              className="flex items-center gap-1 rounded-lg bg-hairline px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:bg-gray-200 hover:text-ink"
                            >
                              <GitBranch size={10} /> History
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </section>

            {/* ── Right: Activity Timeline ───────────────────────────────── */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock size={14} className="text-ink-faint" /> Activity Timeline
                <span className="ml-auto text-[10px] font-normal text-ink-faint">Last 30 days</span>
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-hairline" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <EmptyState
                  icon={Hourglass}
                  title="No recent activity"
                  body="Activity from collaborators will appear here."
                />
              ) : (
                <div className="relative space-y-0.5">
                  {events.map((ev, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-hairline/60"
                    >
                      <EventIcon type={ev.type} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-ink leading-snug">
                            <span className="text-brand">{ev.actor.split('@')[0]}</span>
                            {' '}
                            {ev.type === 'comment' && 'commented on'}
                            {ev.type === 'invite_accepted' && 'joined'}
                            {ev.type === 'save' && 'saved'}
                            {' '}
                            <span className="font-semibold">{ev.diagramTitle}</span>
                          </p>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                          {ev.type === 'comment'
                            ? `"${ev.detail}"`
                            : ev.detail}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-faint/70">
                          {timeAgo(ev.timestamp)}
                        </p>
                      </div>

                      {ev.diagramId && (
                        <Link
                          href={`/editor/${ev.diagramId}`}
                          className="shrink-0 text-ink-faint transition hover:text-brand"
                        >
                          <ChevronRight size={14} />
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Version history drawer */}
      <AnimatePresence>
        {versionFor && (
          <VersionHistoryDrawer
            key="vdrawer"
            diagramId={versionFor.id}
            diagramTitle={versionFor.title}
            onClose={() => setVersionFor(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// ─── Empty state helper ────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, body }: { icon: typeof Users; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-hairline py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hairline">
        <Icon size={20} className="text-ink-faint opacity-60" />
      </div>
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <p className="max-w-[220px] text-xs text-ink-faint">{body}</p>
    </div>
  )
}

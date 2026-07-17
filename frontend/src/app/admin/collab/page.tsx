'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MessageSquareText, UserCheck, Clock, Trash2, Shield,
  Search, ChevronLeft, ChevronRight, Users, Radio,
} from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { adminApi, type AdminCollabInvite, type AdminComment } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

function StatPill({ label, value, color = 'text-brand', bg = 'bg-brand-tint' }: { label: string; value: number | string; color?: string; bg?: string }) {
  return (
    <div className={cn('rounded-xl border border-hairline px-4 py-3 text-center', bg === 'bg-brand-tint' ? 'bg-paper-elevated' : bg)}>
      <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-ink-faint">{label}</p>
    </div>
  )
}

type Tab = 'invites' | 'discussions'

const STATUS_COLORS: Record<string, string> = {
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:  'bg-amber-50  text-amber-700  border-amber-200',
  revoked:  'bg-red-50    text-red-700    border-red-200',
}

const ROLE_COLORS: Record<string, string> = {
  editor: 'bg-brand-tint text-brand border-brand/20',
  viewer: 'bg-hairline   text-ink-faint border-hairline',
}

export default function AdminCollabPage() {
  const [tab, setTab] = useState<Tab>('invites')

  // Invites state
  const [invites,      setInvites]      = useState<AdminCollabInvite[]>([])
  const [invTotal,     setInvTotal]     = useState(0)
  const [invPage,      setInvPage]      = useState(1)
  const [invPages,     setInvPages]     = useState(1)
  const [invLoading,   setInvLoading]   = useState(true)
  const [invStatus,    setInvStatus]    = useState('all')
  const [revoking,     setRevoking]     = useState<string | null>(null)

  // Comments state
  const [comments,     setComments]     = useState<AdminComment[]>([])
  const [cmtTotal,     setCmtTotal]     = useState(0)
  const [cmtPage,      setCmtPage]      = useState(1)
  const [cmtPages,     setCmtPages]     = useState(1)
  const [cmtLoading,   setCmtLoading]   = useState(true)
  const [cmtQ,         setCmtQ]         = useState('')
  const [cmtDraftQ,    setCmtDraftQ]    = useState('')
  const [deleting,     setDeleting]     = useState<string | null>(null)

  const loadInvites = useCallback(async (p = 1) => {
    setInvLoading(true)
    try {
      const data = await adminApi.collab.listInvites({ page: p, limit: 20, status: invStatus })
      setInvites(data.invites)
      setInvTotal(data.total)
      setInvPage(data.page)
      setInvPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setInvLoading(false) }
  }, [invStatus])

  const loadComments = useCallback(async (p = 1) => {
    setCmtLoading(true)
    try {
      const data = await adminApi.collab.listComments({ page: p, limit: 20, q: cmtQ })
      setComments(data.comments)
      setCmtTotal(data.total)
      setCmtPage(data.page)
      setCmtPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setCmtLoading(false) }
  }, [cmtQ])

  useEffect(() => { loadInvites(1) }, [loadInvites])
  useEffect(() => { loadComments(1) }, [loadComments])

  async function handleRevoke(id: string) {
    setRevoking(id)
    try {
      await adminApi.collab.revokeInvite(id)
      setInvites(prev => prev.map(i => i._id === id ? { ...i, status: 'revoked' } : i))
    } catch { /* no-op */ }
    finally { setRevoking(null) }
  }

  async function handleDeleteComment(id: string) {
    if (!confirm('Delete this discussion message permanently?')) return
    setDeleting(id)
    try {
      await adminApi.collab.deleteComment(id)
      setComments(prev => prev.filter(c => c._id !== id))
      setCmtTotal(t => t - 1)
    } catch { /* no-op */ }
    finally { setDeleting(null) }
  }

  function getDiagramTitle(d: AdminCollabInvite['diagramId'] | AdminComment['diagramId']) {
    if (typeof d === 'object' && d !== null && 'title' in d) return d.title
    return 'Untitled'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Collaboration Hub</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Monitor and moderate collaboration invites and discussions</p>
        </div>
        <div className="flex gap-3">
          <StatPill label="Total Invites"  value={invTotal}  color="text-brand"          />
          <StatPill label="Discussions"    value={cmtTotal}  color="text-violet-600" bg="bg-violet-50" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-hairline p-1 w-fit">
        {([
          { id: 'invites',     label: 'Collab Invites',   Icon: UserCheck,         count: invTotal  },
          { id: 'discussions', label: 'Discussions',      Icon: MessageSquareText, count: cmtTotal  },
        ] as { id: Tab; label: string; Icon: typeof Users; count: number }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
            )}
          >
            <t.Icon size={12} />
            {t.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold',
              tab === t.id ? 'bg-brand/10 text-brand' : 'bg-paper text-ink-faint',
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Invites tab ─────────────────────────────────────────────────────── */}
      {tab === 'invites' && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-hairline p-0.5">
              {(['all', 'accepted', 'pending', 'revoked'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setInvStatus(s)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[10px] font-medium capitalize transition',
                    invStatus === s ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
                  )}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-hairline/40">
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Diagram</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Invitee</th>
                  <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Role</th>
                  <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">Invited</th>
                  <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">Action</th>
                </tr>
              </thead>
              <tbody>
                {invLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-hairline">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>
                        ))}
                      </tr>
                    ))
                  : invites.map(inv => (
                      <tr key={inv._id} className="border-b border-hairline transition hover:bg-hairline/30">
                        <td className="px-4 py-3">
                          <p className="max-w-[180px] truncate text-xs font-medium text-ink">{getDiagramTitle(inv.diagramId)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{inv.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', ROLE_COLORS[inv.role])}>
                            {inv.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', STATUS_COLORS[inv.status])}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-faint">{timeAgo(inv.createdAt)}</td>
                        <td className="px-4 py-3 text-center">
                          {inv.status !== 'revoked' && (
                            <button
                              onClick={() => handleRevoke(inv._id)}
                              disabled={revoking === inv._id}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <Shield size={11} /> Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
            {!invLoading && invites.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12">
                <UserCheck className="h-8 w-8 text-ink-faint opacity-40" />
                <p className="text-sm text-ink-faint">No invites found</p>
              </div>
            )}
          </div>

          {invPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-faint">Showing {(invPage - 1) * 20 + 1}–{Math.min(invPage * 20, invTotal)} of {invTotal}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => loadInvites(invPage - 1)} disabled={invPage <= 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronLeft size={14} /></button>
                <span className="text-xs text-ink">Page {invPage} of {invPages}</span>
                <button onClick={() => loadInvites(invPage + 1)} disabled={invPage >= invPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Discussions tab ─────────────────────────────────────────────────── */}
      {tab === 'discussions' && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                placeholder="Search discussions…"
                value={cmtDraftQ}
                onChange={e => setCmtDraftQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setCmtQ(cmtDraftQ) }}
                className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <button
              onClick={() => setCmtQ(cmtDraftQ)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              Search
            </button>
          </div>

          <div className="space-y-3">
            {cmtLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              : comments.map(c => (
                  <div key={c._id} className="flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:shadow-md">
                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-bold text-brand">
                      {c.authorName[0]?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-ink">{c.authorName}</span>
                        <span className="text-[10px] text-ink-faint">on</span>
                        <span className="max-w-[160px] truncate text-[10px] font-medium text-brand">
                          {getDiagramTitle(c.diagramId)}
                        </span>
                        {c.mentions.length > 0 && (
                          <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-violet-600">
                            {c.mentions.length} mention{c.mentions.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {c.resolved && (
                          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">Resolved</span>
                        )}
                        {c.replies.length > 0 && (
                          <span className="rounded-full bg-hairline px-1.5 py-0.5 text-[9px] text-ink-faint">
                            {c.replies.length} repl{c.replies.length > 1 ? 'ies' : 'y'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink line-clamp-2">{c.content}</p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-faint">
                        <Clock size={9} /> {timeAgo(c.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      disabled={deleting === c._id}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
            }
          </div>

          {!cmtLoading && comments.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 rounded-xl border border-hairline">
              <MessageSquareText className="h-8 w-8 text-ink-faint opacity-40" />
              <p className="text-sm text-ink-faint">No discussions found</p>
            </div>
          )}

          {cmtPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-faint">Showing {(cmtPage - 1) * 20 + 1}–{Math.min(cmtPage * 20, cmtTotal)} of {cmtTotal}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => loadComments(cmtPage - 1)} disabled={cmtPage <= 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronLeft size={14} /></button>
                <span className="text-xs text-ink">Page {cmtPage} of {cmtPages}</span>
                <button onClick={() => loadComments(cmtPage + 1)} disabled={cmtPage >= cmtPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

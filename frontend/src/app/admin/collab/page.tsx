'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  MessageSquareText, UserCheck, Clock, Trash2, Shield,
  Search, ChevronLeft, ChevronRight, Users, Radio,
} from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi, type AdminCollabInvite, type AdminComment } from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { BulkActionBar, SelectCheckbox } from '@/components/admin/BulkActionBar'
import { useRowSelection } from '@/components/admin/useRowSelection'

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
  const [revokeTarget, setRevokeTarget] = useState<AdminCollabInvite | null>(null)
  const [inviteBulkConfirm, setInviteBulkConfirm] = useState(false)
  const [inviteBulkLoading, setInviteBulkLoading] = useState(false)

  // Comments state
  const [comments,     setComments]     = useState<AdminComment[]>([])
  const [cmtTotal,     setCmtTotal]     = useState(0)
  const [cmtPage,      setCmtPage]      = useState(1)
  const [cmtPages,     setCmtPages]     = useState(1)
  const [cmtLoading,   setCmtLoading]   = useState(true)
  const [cmtQ,         setCmtQ]         = useState('')
  const [cmtDraftQ,    setCmtDraftQ]    = useState('')
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [deleteComment, setDeleteComment] = useState<AdminComment | null>(null)
  const [bulkConfirm,  setBulkConfirm]  = useState(false)
  const [bulkLoading,  setBulkLoading]  = useState(false)

  const inviteIds = useMemo(() => invites.map(i => i._id), [invites])
  const inviteSelection = useRowSelection(inviteIds)

  const commentIds = useMemo(() => comments.map(c => c._id), [comments])
  const selection = useRowSelection(commentIds)

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

  async function handleRevoke() {
    if (!revokeTarget) return
    setRevoking(revokeTarget._id)
    try {
      await adminApi.collab.revokeInvite(revokeTarget._id)
      setInvites(prev => prev.map(i => i._id === revokeTarget._id ? { ...i, status: 'revoked' } : i))
      setRevokeTarget(null)
    } catch { /* no-op */ }
    finally { setRevoking(null) }
  }

  async function handleDeleteComment() {
    if (!deleteComment) return
    setDeleting(deleteComment._id)
    try {
      await adminApi.collab.deleteComment(deleteComment._id)
      setComments(prev => prev.filter(c => c._id !== deleteComment._id))
      setCmtTotal(t => t - 1)
      setDeleteComment(null)
      selection.clear()
    } catch { /* no-op */ }
    finally { setDeleting(null) }
  }

  async function handleBulkDeleteInvites() {
    if (inviteSelection.count === 0) return
    setInviteBulkLoading(true)
    try {
      const res = await adminApi.collab.bulkDeleteInvites(inviteSelection.selectedIds)
      toast.success(`Deleted ${res.deleted} invite${res.deleted === 1 ? '' : 's'}`)
      setInviteBulkConfirm(false)
      inviteSelection.clear()
      loadInvites(invPage)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setInviteBulkLoading(false) }
  }

  async function handleBulkDeleteComments() {
    if (selection.count === 0) return
    setBulkLoading(true)
    try {
      const res = await adminApi.collab.bulkDeleteComments(selection.selectedIds)
      toast.success(`Deleted ${res.deleted} comment${res.deleted === 1 ? '' : 's'}`)
      setBulkConfirm(false)
      selection.clear()
      loadComments(cmtPage)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setBulkLoading(false) }
  }

  function getDiagramTitle(d: AdminCollabInvite['diagramId'] | AdminComment['diagramId']) {
    if (typeof d === 'object' && d !== null && 'title' in d) return d.title
    return 'Untitled'
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Collaboration Hub</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Monitor and moderate collaboration invites and discussions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatPill label="Total Invites"  value={invTotal}  color="text-brand"          />
          <StatPill label="Discussions"    value={cmtTotal}  color="text-violet-600" bg="bg-violet-50" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full flex-wrap items-center gap-1 rounded-xl bg-hairline p-1 sm:w-fit">
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
          <div className="flex w-full items-center gap-3 overflow-x-auto">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-hairline p-0.5">
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

          <div className="space-y-3">
            <BulkActionBar
              count={inviteSelection.count}
              onClear={inviteSelection.clear}
              onDelete={() => setInviteBulkConfirm(true)}
              loading={inviteBulkLoading}
              label={inviteSelection.count === 1 ? 'invite selected' : 'invites selected'}
            />
            <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-hairline/40">
                    <th className="w-10 px-4 py-3">
                      <SelectCheckbox
                        checked={inviteSelection.allPageSelected}
                        indeterminate={inviteSelection.somePageSelected}
                        onChange={inviteSelection.togglePage}
                        title="Select all on page"
                        disabled={invLoading || invites.length === 0}
                      />
                    </th>
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
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>
                          ))}
                        </tr>
                      ))
                    : invites.map(inv => (
                        <tr
                          key={inv._id}
                          className={cn(
                            'border-b border-hairline transition hover:bg-hairline/30',
                            inviteSelection.isSelected(inv._id) && 'bg-brand-tint/40',
                          )}
                        >
                          <td className="px-4 py-3">
                            <SelectCheckbox
                              checked={inviteSelection.isSelected(inv._id)}
                              onChange={() => inviteSelection.toggle(inv._id)}
                            />
                          </td>
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
                                onClick={() => setRevokeTarget(inv)}
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
              </div>
              {!invLoading && invites.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <UserCheck className="h-8 w-8 text-ink-faint opacity-40" />
                  <p className="text-sm text-ink-faint">No invites found</p>
                </div>
              )}
            </div>
          </div>

          {invPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-faint">Showing {(invPage - 1) * 20 + 1}-{Math.min(invPage * 20, invTotal)} of {invTotal}</p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1 sm:max-w-sm">
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
            <div className="flex items-center gap-3">
              <SelectCheckbox
                checked={selection.allPageSelected}
                indeterminate={selection.somePageSelected}
                onChange={selection.togglePage}
                title="Select all on page"
                disabled={cmtLoading || comments.length === 0}
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                Select all on page
              </span>
            </div>
            <BulkActionBar
              count={selection.count}
              onClear={selection.clear}
              onDelete={() => setBulkConfirm(true)}
              loading={bulkLoading}
              label={selection.count === 1 ? 'comment selected' : 'comments selected'}
            />
            {cmtLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              : comments.map(c => (
                  <div
                    key={c._id}
                    className={cn(
                      'flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:shadow-md',
                      selection.isSelected(c._id) && 'bg-brand-tint/40',
                    )}
                  >
                    <div className="pt-1">
                      <SelectCheckbox
                        checked={selection.isSelected(c._id)}
                        onChange={() => selection.toggle(c._id)}
                      />
                    </div>
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
                      onClick={() => setDeleteComment(c)}
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
              <p className="text-xs text-ink-faint">Showing {(cmtPage - 1) * 20 + 1}-{Math.min(cmtPage * 20, cmtTotal)} of {cmtTotal}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => loadComments(cmtPage - 1)} disabled={cmtPage <= 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronLeft size={14} /></button>
                <span className="text-xs text-ink">Page {cmtPage} of {cmtPages}</span>
                <button onClick={() => loadComments(cmtPage + 1)} disabled={cmtPage >= cmtPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline hover:bg-hairline disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke invite?"
        description={
          <>
            Revoke this collaboration invite
            {revokeTarget?.email ? (
              <> for <span className="font-semibold text-ink">{revokeTarget.email}</span></>
            ) : null}
            ? They will lose access to the diagram.
          </>
        }
        confirmLabel="Revoke invite"
        variant="warning"
        loading={!!revokeTarget && revoking === revokeTarget._id}
        icon={Shield}
      />

      <ConfirmModal
        open={!!deleteComment}
        onClose={() => setDeleteComment(null)}
        onConfirm={handleDeleteComment}
        title="Delete message?"
        description="Delete this discussion message permanently? This cannot be undone."
        confirmLabel="Delete message"
        loading={!!deleteComment && deleting === deleteComment._id}
        icon={Trash2}
      />

      <ConfirmModal
        open={inviteBulkConfirm}
        onClose={() => setInviteBulkConfirm(false)}
        onConfirm={handleBulkDeleteInvites}
        title={`Delete ${inviteSelection.count} invite${inviteSelection.count === 1 ? '' : 's'}?`}
        description="Permanently delete the selected collaboration invites. This cannot be undone."
        confirmLabel={`Delete ${inviteSelection.count}`}
        loading={inviteBulkLoading}
        icon={Trash2}
      />

      <ConfirmModal
        open={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={handleBulkDeleteComments}
        title={`Delete ${selection.count} comment${selection.count === 1 ? '' : 's'}?`}
        description="Permanently delete the selected discussion messages. This cannot be undone."
        confirmLabel={`Delete ${selection.count}`}
        loading={bulkLoading}
        icon={Trash2}
      />
    </div>
  )
}

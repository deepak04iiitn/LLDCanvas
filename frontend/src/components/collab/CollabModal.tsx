'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check, ChevronDown, Copy, Eye, Link2, Loader2,
  Mail, Pencil, Trash2, Users, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { CollabInvite } from '@/types'

// ─── API helpers ──────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...opts })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Request failed')
  }
  return res.json()
}

function getInviteUrl(token?: string) {
  if (!token) return ''
  return `${window.location.origin}/collab/accept?token=${token}`
}

// ─── Role pill dropdown ───────────────────────────────────────────────────────

function RolePill({
  role,
  onChange,
}: {
  role: 'editor' | 'viewer'
  onChange?: (r: 'editor' | 'viewer') => void
}) {
  const Icon  = role === 'editor' ? Pencil : Eye
  const label = role === 'editor' ? 'Editor' : 'Viewer'

  if (!onChange) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 text-[11px] font-medium text-ink-muted">
        <Icon size={10} />
        {label}
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 text-[11px] font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus:outline-none">
        <Icon size={10} className="shrink-0" />
        {label}
        <ChevronDown size={9} className="opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {(['editor', 'viewer'] as const).map(r => (
          <DropdownMenuItem
            key={r}
            onClick={() => onChange(r)}
            className={cn('gap-2 text-xs', role === r && 'text-brand font-semibold')}
          >
            {r === 'editor' ? <Pencil size={11} /> : <Eye size={11} />}
            {r === 'editor' ? 'Editor' : 'Viewer'}
            {role === r && <Check size={10} className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Invite row with inline delete confirm ────────────────────────────────────

function InviteRow({
  invite,
  onRevoke,
  onRoleChange,
}: {
  invite: CollabInvite
  onRevoke: (id: string) => Promise<void>
  onRoleChange: (id: string, role: 'editor' | 'viewer') => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [revoking,   setRevoking]   = useState(false)

  async function confirmRevoke() {
    setRevoking(true)
    await onRevoke(invite._id)
    setRevoking(false)
    setConfirming(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className="overflow-hidden rounded-xl border border-hairline bg-paper"
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[12px] font-bold text-brand">
          {invite.email[0].toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink">{invite.email}</p>
          <p className="text-[10px] capitalize text-ink-faint">{invite.status}</p>
        </div>

        <RolePill role={invite.role} onChange={r => onRoleChange(invite._id, r)} />

        <button
          onClick={() => setConfirming(true)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500"
          title="Remove access"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="border-t border-red-100 bg-red-50"
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <p className="text-xs text-red-700">
                Remove <span className="font-medium">{invite.email}</span>?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <X size={11} /> Cancel
                </button>
                <button
                  onClick={confirmRevoke}
                  disabled={revoking}
                  className="flex h-6 items-center gap-1 rounded-md bg-red-500 px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {revoking ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface CollabModalProps {
  open:         boolean
  onOpenChange: (v: boolean) => void
  diagramId:    string
  diagramTitle: string
}

export function CollabModal({ open, onOpenChange, diagramId, diagramTitle }: CollabModalProps) {
  const [invites,     setInvites]     = useState<CollabInvite[]>([])
  const [loading,     setLoading]     = useState(false)
  const [email,       setEmail]       = useState('')
  const [inviteRole,  setInviteRole]  = useState<'editor' | 'viewer'>('editor')
  const [inviting,    setInviting]    = useState(false)
  const [linkEnabled, setLinkEnabled] = useState(false)
  const [linkRole,    setLinkRole]    = useState<'editor' | 'viewer'>('viewer')
  const [linkCopied,  setLinkCopied]  = useState(false)
  const [latestToken, setLatestToken] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/collab/${diagramId}/invites`)
      setInvites(data.invites ?? [])
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }, [diagramId])

  const loadLinkStatus = useCallback(async () => {
    try {
      const data = await apiFetch(`/collab/my-access/${diagramId}`)
      setLinkEnabled(data.collabLinkEnabled ?? false)
      setLinkRole(data.collabLinkRole ?? 'viewer')
    } catch { /* owner check */ }
  }, [diagramId])

  useEffect(() => {
    if (open) { load(); loadLinkStatus() }
  }, [open, load, loadLinkStatus])

  async function handleInvite() {
    if (!email.trim()) return
    setInviting(true)
    try {
      const data = await apiFetch(`/collab/${diagramId}/invite`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), role: inviteRole }),
      })
      if (data.token) setLatestToken(data.token)
      toast.success(`Invite sent to ${email.trim()}`)
      setEmail('')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(inviteId: string, role: 'editor' | 'viewer') {
    try {
      await apiFetch(`/collab/${diagramId}/${inviteId}/role`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role }),
      })
      setInvites(prev => prev.map(i => i._id === inviteId ? { ...i, role } : i))
    } catch { toast.error('Failed to update role') }
  }

  async function handleRevoke(inviteId: string) {
    await apiFetch(`/collab/${diagramId}/${inviteId}`, { method: 'DELETE' })
    setInvites(prev => prev.filter(i => i._id !== inviteId))
    toast.success('Access revoked')
  }

  async function toggleLink(enabled: boolean) {
    try {
      await apiFetch(`/collab/${diagramId}/link`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ enabled, role: linkRole }),
      })
      setLinkEnabled(enabled)
    } catch { toast.error('Failed to update link') }
  }

  async function updateLinkRole(role: 'editor' | 'viewer') {
    try {
      await apiFetch(`/collab/${diagramId}/link`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ enabled: linkEnabled, role }),
      })
      setLinkRole(role)
    } catch { toast.error('Failed to update') }
  }

  function copyLink() {
    const url = getInviteUrl(latestToken ?? undefined)
    if (!url) { toast.error('Send an invite first to get a link'); return }
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const collabUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/collab/join/${diagramId}`

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="collab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.aside
            key="collab-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-[95vw] flex-col border-l border-hairline bg-paper shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper-elevated">
                  <Users size={15} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Collaborate</p>
                  <p className="max-w-[220px] truncate text-[11px] text-ink-faint">{diagramTitle}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Invite by email ──────────────────────────────────────── */}
              <div className="border-b border-hairline px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Invite by email</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                      placeholder="colleague@company.com"
                      className="h-9 w-full rounded-lg border border-hairline bg-paper-elevated pl-9 pr-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                  <RolePill role={inviteRole} onChange={setInviteRole} />
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !email.trim()}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-medium text-brand-foreground transition-all hover:bg-brand-hover disabled:opacity-50"
                  >
                    {inviting ? <Loader2 size={12} className="animate-spin" /> : null}
                    Invite
                  </button>
                </div>

                {/* Latest invite link */}
                {latestToken && (
                  <div className="mt-3 rounded-xl border border-brand/20 bg-brand/5 p-3">
                    <p className="mb-1.5 text-[11px] font-semibold text-brand">Share this invite link</p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 truncate rounded-lg bg-paper px-2.5 py-1.5 font-mono text-[10px] text-ink-muted">
                        {getInviteUrl(latestToken)}
                      </p>
                      <button
                        onClick={copyLink}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-brand transition-colors hover:bg-brand/10"
                      >
                        {linkCopied ? <Check size={11} /> : <Copy size={11} />}
                        {linkCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── People with access ───────────────────────────────────── */}
              <div className="border-b border-hairline px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">People with access</p>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={18} className="animate-spin text-ink-faint" />
                  </div>
                ) : invites.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hairline">
                      <Users size={16} className="text-ink-faint" />
                    </div>
                    <p className="text-xs text-ink-faint">No collaborators yet.</p>
                    <p className="text-[11px] text-ink-faint">Invite someone using the form above.</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-2">
                      {invites.map(invite => (
                        <InviteRow
                          key={invite._id}
                          invite={invite}
                          onRevoke={handleRevoke}
                          onRoleChange={handleRoleChange}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>

              {/* ── Public collab link ───────────────────────────────────── */}
              <div className="px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Link sharing</p>

                <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="text-ink-muted" />
                    <p className="text-xs font-medium text-ink">Anyone with the link</p>
                  </div>
                  <button
                    onClick={() => toggleLink(!linkEnabled)}
                    className={cn(
                      'relative flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                      linkEnabled ? 'bg-brand' : 'bg-hairline-strong',
                    )}
                  >
                    <span className={cn(
                      'absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
                      linkEnabled ? 'translate-x-4' : 'translate-x-0.5',
                    )} />
                  </button>
                </div>

                <AnimatePresence>
                  {linkEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-ink-faint">Can join as:</p>
                        <RolePill role={linkRole} onChange={updateLinkRole} />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5">
                        <p className="flex-1 truncate font-mono text-[10px] text-ink-muted">{collabUrl}</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(collabUrl); toast.success('Link copied') }}
                          className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand-hover"
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

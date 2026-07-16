'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Globe, Lock, Link2, Check, Copy, Plus, X,
  Eye, Pencil, ChevronDown, Loader2, Share2, Trash2,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { ShareSettings } from '@/types'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  diagramId: string
  diagramTitle: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shareUrl(token: string) {
  return `${window.location.origin}/editor/${window.location.pathname.split('/editor/')[1]?.split('?')[0]}?share=${token}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy link"
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
        copied
          ? 'text-emerald-600'
          : 'text-ink-faint hover:bg-hairline hover:text-ink',
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── Permission selector ──────────────────────────────────────────────────────

function PermissionSelect({
  value, onChange, disabled,
}: {
  value: 'view' | 'edit'
  onChange: (v: 'view' | 'edit') => void
  disabled?: boolean
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value as 'view' | 'edit')}
        disabled={disabled}
        className="h-8 w-[104px] appearance-none rounded-lg border border-hairline-strong bg-paper
                   pl-3 pr-7 text-xs font-medium text-ink-muted outline-none
                   focus:border-brand focus:ring-2 focus:ring-brand/10
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="view">Can view</option>
        <option value="edit">Can edit</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3
                              -translate-y-1/2 text-ink-faint" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ShareModal({ open, onOpenChange, diagramId, diagramTitle }: Props) {
  const [share, setShare]       = useState<ShareSettings | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [emailInput, setEmail]  = useState('')
  const [emailError, setEmailErr] = useState('')

  // ── Load existing share settings when modal opens ─────────────────────────
  const loadShare = useCallback(async () => {
    setLoading(true)
    try {
      const { share: s } = await api.share.get(diagramId)
      setShare(s)
    } catch {
      /* diagram might not have a share yet — that's fine */
      setShare(null)
    } finally {
      setLoading(false)
    }
  }, [diagramId])

  useEffect(() => {
    if (open) loadShare()
  }, [open, loadShare])

  // ── Enable sharing ────────────────────────────────────────────────────────
  async function enableSharing() {
    setSaving(true)
    try {
      const { share: s } = await api.share.upsert(diagramId, {
        visibility: 'public',
        permission: 'view',
      })
      setShare(s)
    } catch { toast.error('Could not enable sharing') }
    finally { setSaving(false) }
  }

  // ── Disable sharing ───────────────────────────────────────────────────────
  async function disableSharing() {
    setSaving(true)
    try {
      await api.share.remove(diagramId)
      setShare(null)
    } catch { toast.error('Could not disable sharing') }
    finally { setSaving(false) }
  }

  // ── Toggle visibility ─────────────────────────────────────────────────────
  async function setVisibility(v: 'public' | 'private') {
    if (!share) return
    setSaving(true)
    try {
      const { share: s } = await api.share.upsert(diagramId, { visibility: v, permission: share.permission })
      setShare(s)
    } catch { toast.error('Could not update visibility') }
    finally { setSaving(false) }
  }

  // ── Toggle permission ─────────────────────────────────────────────────────
  async function setPermission(p: 'view' | 'edit') {
    if (!share) return
    setSaving(true)
    try {
      const { share: s } = await api.share.upsert(diagramId, { visibility: share.visibility, permission: p })
      setShare(s)
    } catch { toast.error('Could not update permission') }
    finally { setSaving(false) }
  }

  // ── Add invite ────────────────────────────────────────────────────────────
  async function handleAddInvite() {
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Enter a valid email address'); return
    }
    if (share?.allowedEmails.includes(email)) {
      setEmailErr('Already invited'); return
    }
    setEmailErr('')
    setSaving(true)
    try {
      const { share: s } = await api.share.addInvite(diagramId, email)
      setShare(s)
      setEmail('')
    } catch { toast.error('Could not add invite') }
    finally { setSaving(false) }
  }

  // ── Remove invite ─────────────────────────────────────────────────────────
  async function handleRemoveInvite(email: string) {
    setSaving(true)
    try {
      const { share: s } = await api.share.removeInvite(diagramId, email)
      setShare(s)
    } catch { toast.error('Could not remove invite') }
    finally { setSaving(false) }
  }

  const url = share ? shareUrl(share.token) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ width: 'min(30rem, calc(100vw - 2rem))', maxWidth: 'min(30rem, calc(100vw - 2rem))' }}
        className="overflow-hidden rounded-2xl border border-hairline bg-paper p-0 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="min-w-0 border-b border-hairline px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
              <Share2 className="h-4.5 w-4.5 text-brand" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-ink">Share diagram</DialogTitle>
              <p className="truncate text-xs text-ink-faint">{diagramTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-w-0 px-6 py-5">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
            </div>
          ) : !share ? (
            /* ── Not shared yet ──────────────────────────────────────── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hairline">
                <Lock className="h-6 w-6 text-ink-faint" />
              </div>
              <div>
                <p className="font-medium text-ink">Only you have access</p>
                <p className="mt-1 text-sm text-ink-faint">
                  Enable sharing to let others view or edit this diagram.
                </p>
              </div>
              <button
                type="button"
                onClick={enableSharing}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5
                           text-sm font-semibold text-brand-foreground transition-all
                           hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Enable sharing
              </button>
            </div>
          ) : (
            /* ── Share settings ──────────────────────────────────────── */
            <div className="flex min-w-0 flex-col gap-5">
              {/* Visibility toggle */}
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-paper-elevated p-1">
                {([ ['public', Globe, 'Anyone with the link'], ['private', Lock, 'Only invited people'] ] as const).map(
                  ([vis, Icon, desc]) => (
                    <button
                      key={vis}
                      type="button"
                      onClick={() => setVisibility(vis)}
                      disabled={saving}
                      className={cn(
                        'flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all',
                        share.visibility === vis
                          ? 'bg-brand text-brand-foreground shadow-sm'
                          : 'text-ink-muted hover:bg-hairline',
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-semibold capitalize">{vis}</span>
                      </div>
                      <span className={cn(
                        'text-[10px] leading-snug',
                        share.visibility === vis ? 'text-brand-foreground/70' : 'text-ink-faint',
                      )}>
                        {desc}
                      </span>
                    </button>
                  ),
                )}
              </div>

              {/* Link row + permission for the link */}
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-xs font-semibold text-ink-muted">Link permission</span>
                  <PermissionSelect value={share.permission} onChange={setPermission} disabled={saving} />
                </div>

                <div className="flex min-w-0 items-center gap-2 rounded-xl border border-hairline bg-paper-elevated pl-3 pr-1.5">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span
                    title={url}
                    className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap
                               py-2 font-mono text-[11px] text-ink-muted"
                  >
                    {url}
                  </span>
                  <CopyButton text={url} />
                </div>

                <p className="text-[11px] text-ink-faint">
                  {share.permission === 'edit'
                    ? 'Anyone with this link can view and edit.'
                    : 'Anyone with this link can view but not edit.'}
                </p>
              </div>

              {/* Private invite list */}
              {share.visibility === 'private' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-px flex-1 bg-hairline" />
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                      Invited people
                    </span>
                    <div className="h-px flex-1 bg-hairline" />
                  </div>

                  {/* Invited email list */}
                  {share.allowedEmails.length === 0 ? (
                    <p className="py-1 text-center text-xs text-ink-faint">
                      No one invited yet. Add emails below.
                    </p>
                  ) : (
                    <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                      {share.allowedEmails.map(email => (
                        <div key={email} className="flex items-center gap-2 rounded-lg
                                                    border border-hairline bg-paper px-3 py-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center
                                          rounded-full bg-brand-tint font-mono text-[10px]
                                          font-bold text-brand uppercase">
                            {email[0]}
                          </div>
                          <span className="min-w-0 flex-1 truncate text-xs text-ink">{email}</span>
                          <span className="flex shrink-0 items-center gap-1 text-[10px] text-ink-faint">
                            {share.permission === 'edit'
                              ? <><Pencil className="h-3 w-3" /> edit</>
                              : <><Eye className="h-3 w-3" /> view</>
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInvite(email)}
                            disabled={saving}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                                       text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500
                                       disabled:opacity-40"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add email input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                        onKeyDown={e => e.key === 'Enter' && handleAddInvite()}
                        placeholder="name@email.com"
                        className="h-9 min-w-0 flex-1 rounded-xl border border-hairline-strong bg-paper
                                   px-3 text-sm outline-none transition focus:border-brand
                                   focus:ring-2 focus:ring-brand/10 placeholder:text-ink-faint"
                      />
                      <button
                        type="button"
                        onClick={handleAddInvite}
                        disabled={saving || !emailInput.trim()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                                   bg-brand text-brand-foreground transition-all hover:opacity-90
                                   disabled:opacity-40"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </div>
                    {emailError && (
                      <p className="text-[11px] text-red-500">{emailError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Disable sharing */}
              <div className="flex border-t border-hairline pt-3">
                <button
                  type="button"
                  onClick={disableSharing}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-[12px] text-red-400 transition-colors
                             hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Disable sharing
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

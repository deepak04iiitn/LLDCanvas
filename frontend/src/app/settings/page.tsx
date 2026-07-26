'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  LogOut,
  User,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Rocket,
  Crown,
  ArrowRight,
  X,
  Pencil,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppShell } from '@/components/dashboard/AppShell'
import { useSession, useSignOut } from '@/lib/auth'
import { api } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Section divider with embedded monospace label ────────────────────────────
function SectionDivider({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-hairline" />
      <span className="select-none font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint/50">
        {index} · {label}
      </span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  )
}

// ─── Plan tier helpers ─────────────────────────────────────────────────────────
type PlanKey = 'free' | 'pro' | 'ultimate'

const PLAN_CFG: Record<PlanKey, {
  Icon: React.ElementType
  label: string
  badgeCls: string
  cardCls: string
  accentCls: string
  ringCls: string
}> = {
  ultimate: {
    Icon: Crown,
    label: 'Ultimate',
    badgeCls: 'bg-amber-50 text-amber-600 border border-amber-200/70',
    cardCls: 'bg-amber-50/60 border border-amber-200/60',
    accentCls: 'bg-amber-400',
    ringCls: 'ring-amber-300/50',
  },
  pro: {
    Icon: Rocket,
    label: 'Pro',
    badgeCls: 'bg-brand/8 text-brand border border-brand/20',
    cardCls: 'bg-brand/5 border border-brand/20',
    accentCls: 'bg-brand',
    ringCls: 'ring-brand/30',
  },
  free: {
    Icon: Zap,
    label: 'Free',
    badgeCls: 'bg-paper-elevated text-ink-muted border border-hairline',
    cardCls: 'bg-paper-elevated border border-hairline',
    accentCls: 'bg-ink-faint/40',
    ringCls: 'ring-hairline',
  },
}

function getPlanCfg(plan: string) {
  return PLAN_CFG[(plan as PlanKey) in PLAN_CFG ? (plan as PlanKey) : 'free']
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────
function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const [confirm, setConfirm] = useState('')
  const PHRASE = 'delete my account'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle className="text-left text-base font-semibold text-ink">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="text-left">
            This permanently deletes your account and{' '}
            <strong>all your diagrams</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4">
          <div>
            <p className="mb-1.5 text-sm text-ink-muted">
              Type{' '}
              <span className="font-mono font-medium text-ink">{PHRASE}</span>{' '}
              to confirm:
            </p>
            <Input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={PHRASE}
              className="font-mono text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={confirm !== PHRASE || loading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete account'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Cancel subscription confirmation dialog ─────────────────────────────────
function CancelSubscriptionDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <DialogTitle className="text-left text-base font-semibold text-ink">
            Cancel your subscription?
          </DialogTitle>
          <DialogDescription className="text-left">
            You&apos;ll keep access to all paid features until the end of the
            current billing period. You can resubscribe anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Keep subscription
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Cancel subscription'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Settings page ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { plan, subscription, loading: planLoading, refresh: refreshPlan } = usePlan()
  const doSignOut = useSignOut()

  const [name, setName]                   = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameSaved, setNameSaved]         = useState(false)
  const [nameSaving, setNameSaving]       = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [deleteOpen, setDeleteOpen]       = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [cancelOpen, setCancelOpen]       = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => { document.title = 'Settings · LLDCanvas' }, [])

  useEffect(() => {
    if (!isPending && !session) router.replace('/')
  }, [isPending, session, router])

  useEffect(() => {
    if (session?.user.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus()
  }, [isEditingName])

  async function handleSaveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === session?.user.name) {
      setIsEditingName(false)
      return
    }
    setNameSaving(true)
    try {
      await api.account.updateName(trimmed)
      setNameSaved(true)
      toast.success('Display name updated')
      setTimeout(() => setNameSaved(false), 2000)
    } catch {
      toast.error('Failed to update name')
    } finally {
      setNameSaving(false)
      setIsEditingName(false)
    }
  }

  async function handleCancelSubscription() {
    setCancelLoading(true)
    try {
      await api.billing.cancel()
      toast.success('Subscription cancelled. Access continues until period end.')
      await refreshPlan()
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to cancel subscription')
    } finally {
      setCancelLoading(false)
      setCancelOpen(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await api.account.deleteAccount()
      toast.success('Account deleted')
      await doSignOut()
    } catch {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  // ── Loading / unauthenticated states ──────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }
  if (!session) return null

  const { user } = session
  const pc = getPlanCfg(plan)
  const PlanIcon = pc.Icon

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  })

  return (
    <AppShell>
      <div className="no-scrollbar h-full overflow-y-auto">
          <div className="mx-auto max-w-140 px-5 py-10 sm:px-8">

          {/* ── Page heading ──────────────────────────────────────────────── */}
          <motion.div {...stagger(0)} className="mb-10">
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint/50">
              Account
            </p>
            <h1 className="text-[1.6rem] font-semibold leading-tight tracking-tight text-ink">
              Settings
            </h1>
          </motion.div>

          {/* ── Identity block ────────────────────────────────────────────── */}
          <motion.div {...stagger(1)} className="mb-9 flex items-center gap-5">
            {/* Avatar with tier ring */}
            <div
              className={cn(
                'relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl ring-2',
                pc.ringCls,
              )}
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? 'avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-tint">
                  <User className="h-8 w-8 text-brand" />
                </div>
              )}
            </div>

            {/* Name + email + plan badge */}
            <div className="min-w-0 flex-1">
              {/* Inline-editable name */}
              <div className="mb-1 flex items-center gap-2">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') {
                        setName(user.name ?? '')
                        setIsEditingName(false)
                      }
                    }}
                    className="w-full max-w-xs border-b-2 border-brand bg-transparent text-[1.15rem] font-semibold text-ink outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group flex items-center gap-1.5 text-[1.15rem] font-semibold text-ink transition-colors hover:text-brand"
                  >
                    <span>{name || user.name}</span>
                    <Pencil className="h-3.5 w-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )}
                {nameSaving && (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand" />
                )}
                {nameSaved && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                )}
              </div>

              <p className="mb-2.5 text-sm text-ink-muted">{user.email}</p>

              {/* Plan badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  pc.badgeCls,
                )}
              >
                <PlanIcon className="h-3 w-3" />
                {pc.label} Plan
              </span>
            </div>
          </motion.div>

          {/* ── 01 · SUBSCRIPTION ─────────────────────────────────────────── */}
          <motion.div {...stagger(2)} className="mb-8">
            <SectionDivider index="01" label="Subscription" />

            <div className="mt-5">
              {planLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-ink-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading plan...
                </div>
              ) : (
                <div className={cn('flex items-center gap-4 rounded-xl p-4', pc.cardCls)}>
                  {/* Tier accent stripe */}
                  <div className={cn('w-1 self-stretch rounded-full', pc.accentCls)} />

                  {/* Plan details */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {pc.label} Plan
                      </span>
                      {subscription?.cancelAtPeriodEnd && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <X className="h-2.5 w-2.5" /> Cancellation scheduled
                        </span>
                      )}
                    </div>
                    {subscription ? (
                      <p className="text-xs text-ink-muted">
                        Billing: <span className="capitalize">{subscription.billingInterval}</span>
                        {subscription.currentPeriodEnd && (
                          <>
                            {' '}·{' '}
                            {subscription.cancelAtPeriodEnd ? 'Access until' : 'Renews'}{' '}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-ink-muted">No active billing</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    {plan === 'free' ? (
                      <Link
                        href="/pricing"
                        className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand/90"
                      >
                        Upgrade <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/pricing"
                          className="rounded-lg border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
                        >
                          Change plan
                        </Link>
                        {subscription && !subscription.cancelAtPeriodEnd && (
                          <button
                            onClick={() => setCancelOpen(true)}
                            disabled={cancelLoading}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancelLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              'Cancel'
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── 02 · SESSION ──────────────────────────────────────────────── */}
          <motion.div {...stagger(3)} className="mb-8">
            <SectionDivider index="02" label="Session" />

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Sign out of LLDCanvas</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  You&apos;ll be returned to the home page.
                </p>
              </div>
              <button
                onClick={() => doSignOut()}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-all hover:border-ink-faint hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>

          {/* ── 03 · DANGER ZONE ──────────────────────────────────────────── */}
          <motion.div {...stagger(4)} className="mb-2">
            <SectionDivider index="03" label="Danger Zone" />

            <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-200/60 bg-red-50/50 p-4">
              <div>
                <p className="text-sm font-medium text-ink">Delete account</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Permanently deletes your account and all diagrams. Cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      />

      <CancelSubscriptionDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelSubscription}
        loading={cancelLoading}
      />
    </AppShell>
  )
}

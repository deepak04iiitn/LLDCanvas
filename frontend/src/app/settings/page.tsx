'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  LogOut,
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

type PlanKey = 'free' | 'pro' | 'ultimate'
type SettingsSection = 'profile' | 'subscription' | 'session' | 'danger'

const PLAN_META: Record<PlanKey, { Icon: React.ElementType; label: string; tone: string }> = {
  ultimate: { Icon: Crown,  label: 'Ultimate', tone: 'text-amber-700' },
  pro:      { Icon: Rocket, label: 'Pro',      tone: 'text-brand' },
  free:     { Icon: Zap,    label: 'Free',     tone: 'text-ink-muted' },
}

function getPlanMeta(plan: string) {
  return PLAN_META[(plan as PlanKey) in PLAN_META ? (plan as PlanKey) : 'free']
}

const NAV: { id: SettingsSection; label: string; danger?: boolean }[] = [
  { id: 'profile',      label: 'Profile' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'session',      label: 'Session' },
  { id: 'danger',       label: 'Danger zone', danger: true },
]

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
          <DialogTitle className="text-left font-serif text-xl font-medium text-ink">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="text-left">
            This permanently deletes your account and{' '}
            <strong>all your diagrams</strong>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-ink-muted">
              Type <span className="font-mono font-medium text-ink">{PHRASE}</span> to confirm:
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
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={confirm !== PHRASE || loading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
          <DialogTitle className="text-left font-serif text-xl font-medium text-ink">
            Cancel your subscription?
          </DialogTitle>
          <DialogDescription className="text-left">
            You&apos;ll keep access until the end of the current billing period.
            You can resubscribe anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Keep subscription
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel subscription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FieldRow({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="grid gap-3 border-b border-hairline py-5 last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8 sm:py-6">
      <div className="pt-0.5">
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-ink-faint">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { plan, subscription, loading: planLoading, refresh: refreshPlan } = usePlan()
  const doSignOut = useSignOut()

  const [section, setSection]             = useState<SettingsSection>('profile')
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

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
      </div>
    )
  }
  if (!session) return null

  const { user } = session
  const pm = getPlanMeta(plan)
  const PlanIcon = pm.Icon

  const renewLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const sectionCopy: Record<SettingsSection, { title: string; sub: string }> = {
    profile:      { title: 'Profile',      sub: 'How you appear across LLDCanvas.' },
    subscription: { title: 'Subscription', sub: 'Plan, billing cycle, and renewals.' },
    session:      { title: 'Session',      sub: 'Sign out of this device.' },
    danger:       { title: 'Danger zone',  sub: 'Irreversible actions. Proceed carefully.' },
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* Masthead — matches Practice Log / dashboard editorial rhythm */}
        <header className="shrink-0 border-b border-hairline px-6 py-8 sm:px-10">
          <div className="mx-auto flex max-w-5xl items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Account
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-ink sm:text-[2.75rem]">
                Settings
              </h1>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-9 w-9 overflow-hidden rounded-md border border-hairline bg-paper-elevated">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-sm text-ink-muted">
                    {(name || user.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-medium text-ink">
                  {name || user.name || 'Account'}
                </p>
                <p className={cn('mt-0.5 inline-flex items-center gap-1 font-mono text-[11px]', pm.tone)}>
                  <PlanIcon className="h-3 w-3" />
                  {pm.label}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-8 sm:px-10">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">

            {/* Left rail — text nav, no card */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <nav className="flex gap-1 overflow-x-auto border-b border-hairline pb-px lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-l lg:border-hairline lg:pb-0">
                {NAV.map(item => {
                  const active = section === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSection(item.id)}
                      className={cn(
                        'relative shrink-0 px-3 py-2.5 text-left text-sm transition-colors lg:pl-4 lg:pr-0',
                        active && !item.danger && 'font-medium text-ink',
                        active && item.danger && 'font-medium text-red-600',
                        !active && !item.danger && 'text-ink-faint hover:text-ink-muted',
                        !active && item.danger && 'text-red-400/80 hover:text-red-500',
                      )}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="settingsNav"
                          className={cn(
                            'absolute inset-x-0 bottom-0 h-0.5 lg:inset-y-1 lg:left-0 lg:right-auto lg:w-0.5 lg:bottom-auto',
                            item.danger ? 'bg-red-500' : 'bg-brand',
                          )}
                        />
                      )}
                    </button>
                  )
                })}
              </nav>
            </aside>

            {/* Right panel */}
            <motion.section
              key={section}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="min-w-0"
            >
              <div className="mb-2 border-b border-hairline pb-6">
                <h2 className="font-serif text-2xl leading-none text-ink">
                  {sectionCopy[section].title}
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{sectionCopy[section].sub}</p>
              </div>

              {/* Profile */}
              {section === 'profile' && (
                <div>
                  <FieldRow label="Display name" hint="Shown on shared diagrams and collaborations.">
                    <div className="flex items-center gap-3">
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
                          className="h-10 w-full max-w-sm border-b border-brand bg-transparent px-0 text-sm font-medium text-ink outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingName(true)}
                          className="group flex h-10 w-full max-w-sm items-center justify-between border-b border-hairline text-left transition-colors hover:border-ink-faint"
                        >
                          <span className="text-sm text-ink">
                            {name || user.name || 'Add a display name'}
                          </span>
                          <Pencil className="h-3.5 w-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      )}
                      {nameSaving && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
                      {nameSaved && <Check className="h-4 w-4 text-brand" />}
                    </div>
                  </FieldRow>

                  <FieldRow label="Email" hint="Managed by your sign-in provider.">
                    <p className="py-2 text-sm text-ink-muted">{user.email}</p>
                  </FieldRow>
                </div>
              )}

              {/* Subscription */}
              {section === 'subscription' && (
                <div>
                  {planLoading ? (
                    <div className="flex items-center gap-2 py-10 text-sm text-ink-faint">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading plan…
                    </div>
                  ) : (
                    <>
                      <FieldRow label="Current plan">
                        <div className="space-y-3 py-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-serif text-3xl leading-none text-ink">
                              {pm.label}
                            </span>
                            <span className={cn('font-mono text-[11px] uppercase tracking-wider', pm.tone)}>
                              Active
                            </span>
                            {subscription?.cancelAtPeriodEnd && (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-amber-700">
                                <X className="h-2.5 w-2.5" /> Ends {renewLabel}
                              </span>
                            )}
                          </div>
                          {subscription ? (
                            <p className="text-sm text-ink-muted">
                              <span className="capitalize">{subscription.billingInterval}</span> billing
                              {renewLabel && (
                                <>
                                  {' · '}
                                  {subscription.cancelAtPeriodEnd ? 'Access until' : 'Renews'}{' '}
                                  <span className="font-mono text-ink">{renewLabel}</span>
                                </>
                              )}
                            </p>
                          ) : (
                            <p className="text-sm text-ink-muted">
                              No active billing. Upgrade anytime for Pro or Ultimate.
                            </p>
                          )}
                        </div>
                      </FieldRow>

                      <FieldRow label="Manage">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-1">
                          {plan === 'free' ? (
                            <Link
                              href="/pricing"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                            >
                              Upgrade plan <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <>
                              <Link
                                href="/pricing"
                                className="text-sm font-medium text-ink underline-offset-4 hover:underline"
                              >
                                Change plan
                              </Link>
                              {subscription && !subscription.cancelAtPeriodEnd && (
                                <button
                                  type="button"
                                  onClick={() => setCancelOpen(true)}
                                  disabled={cancelLoading}
                                  className="text-sm font-medium text-red-600 underline-offset-4 hover:underline disabled:opacity-50"
                                >
                                  {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </FieldRow>

                      {plan === 'free' && (
                        <p className="mt-6 text-sm text-ink-faint">
                          Unlock interview mode, more problems, and collaboration on{' '}
                          <Link href="/pricing" className="text-ink underline-offset-2 hover:underline">
                            Pro or Ultimate
                          </Link>
                          .
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Session */}
              {section === 'session' && (
                <FieldRow
                  label="Sign out"
                  hint="You'll return to the home page. Diagrams stay saved."
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => doSignOut()}
                      className="inline-flex items-center gap-2 border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </FieldRow>
              )}

              {/* Danger */}
              {section === 'danger' && (
                <FieldRow
                  label="Delete account"
                  hint="Permanently removes your account and all diagrams."
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex items-center gap-2 border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete account
                    </button>
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-faint">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                      This action cannot be undone.
                    </p>
                  </div>
                </FieldRow>
              )}
            </motion.section>
          </div>
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

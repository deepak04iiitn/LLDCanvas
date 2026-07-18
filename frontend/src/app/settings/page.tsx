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
import { useSession, signOut } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-hairline bg-paper-elevated p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold tracking-widest text-ink-faint uppercase">
      {children}
    </h2>
  )
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
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle className="text-left text-base font-semibold text-ink">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="text-left">
            This permanently deletes your account and <strong>all your diagrams</strong>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4">
          <div>
            <p className="mb-1.5 text-sm text-ink-muted">
              Type <span className="font-mono font-medium text-ink">{PHRASE}</span> to confirm:
            </p>
            <Input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={PHRASE}
              className="font-mono text-sm"
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete account'}
            </Button>
          </div>
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

  // Name editing
  const [name, setName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [nameSaving, setNameSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Subscription cancel
  const [cancelLoading, setCancelLoading] = useState(false)

  // Page title
  useEffect(() => { document.title = 'Settings — LLDCanvas' }, [])

  // Auth guard + hydrate name
  useEffect(() => {
    if (!isPending && !session) router.replace('/')
  }, [isPending, session, router])

  useEffect(() => {
    if (session?.user.name) setName(session.user.name)
  }, [session])

  async function handleSaveName() {
    if (!name.trim() || name === session?.user.name) return
    setNameSaving(true)
    try {
      await api.account.updateName(name.trim())
      setNameSaved(true)
      toast.success('Display name updated')
      setTimeout(() => setNameSaved(false), 2000)
    } catch {
      toast.error('Failed to update name')
    } finally {
      setNameSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  async function handleCancelSubscription() {
    if (!confirm('Cancel your subscription? You will keep access until the end of the current billing period.')) return
    setCancelLoading(true)
    try {
      await api.billing.cancel()
      toast.success('Subscription cancelled. Access continues until period end.')
      refreshPlan()
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to cancel subscription')
    } finally {
      setCancelLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await api.account.deleteAccount()
      await signOut()
      toast.success('Account deleted')
      router.push('/')
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
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!session) return null

  const { user } = session

  return (
    <AppShell>
      <div className="no-scrollbar h-full overflow-y-auto px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 font-serif text-2xl font-medium text-ink"
          >
            Account Settings
          </motion.h1>

          <div className="space-y-4">
            {/* ── Profile ──────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <SectionTitle>Profile</SectionTitle>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Avatar */}
                  <div className="relative h-16 w-16 shrink-0">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-tint">
                        <User className="h-8 w-8 text-brand" />
                      </div>
                    )}
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-ink-muted">
                          Display name
                        </label>
                        <Input
                          ref={nameInputRef}
                          value={name}
                          onChange={e => { setName(e.target.value); setNameSaved(false) }}
                          onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                          className="h-9 border-hairline-strong text-sm focus:border-brand"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={nameSaving || !name.trim() || name === user.name}
                        className="h-9 shrink-0 bg-brand text-brand-foreground hover:bg-brand-hover"
                      >
                        {nameSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : nameSaved ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-ink-faint">
                      {user.email}
                      <span className="ml-1.5 text-ink-faint/70">· read-only</span>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ── Session ───────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <SectionTitle>Session</SectionTitle>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Sign out of LLDCanvas</p>
                    <p className="text-xs text-ink-faint">You&apos;ll be returned to the home page.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="gap-2 border-hairline-strong text-ink-muted sm:self-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* ── Subscription ─────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Card>
                <SectionTitle>Subscription</SectionTitle>
                {planLoading ? (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading plan...
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {plan === 'ultimate' && <Crown className="h-4 w-4 text-amber-500" />}
                        {plan === 'pro'      && <Rocket className="h-4 w-4 text-brand" />}
                        <p className="text-sm font-semibold text-ink capitalize">{plan} Plan</p>
                      </div>
                      {subscription ? (
                        <div className="text-xs text-ink-muted space-y-0.5">
                          <p>Billing: {subscription.billingInterval}</p>
                          {subscription.currentPeriodEnd && (
                            <p>{subscription.cancelAtPeriodEnd ? 'Access until' : 'Renews'}: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                          )}
                          {subscription.cancelAtPeriodEnd && (
                            <p className="text-amber-600 font-medium flex items-center gap-1">
                              <X className="h-3 w-3" /> Cancellation scheduled
                            </p>
                          )}
                        </div>
                      ) : plan === 'free' ? (
                        <p className="text-xs text-ink-muted">Free plan - no billing</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {plan === 'free' ? (
                        <Link href="/pricing" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors">
                          <Rocket className="h-3.5 w-3.5" /> Upgrade <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <div className="flex gap-2">
                          <Link href="/pricing" className="rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-ink-muted hover:bg-paper-elevated transition-colors">
                            Change plan
                          </Link>
                          {subscription && !subscription.cancelAtPeriodEnd && (
                            <button
                              onClick={handleCancelSubscription}
                              disabled={cancelLoading}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {cancelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancel'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* ── Danger zone ───────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-red-200/70">
                <SectionTitle>Danger Zone</SectionTitle>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Delete account</p>
                    <p className="text-xs text-ink-faint">
                      Permanently delete your account and all diagrams. Cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(true)}
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      />
    </AppShell>
  )
}

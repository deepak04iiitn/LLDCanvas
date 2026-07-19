'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Search, ChevronLeft, ChevronRight, Users, Rocket, Crown, Zap,
  AlertTriangle, X, Check, Globe, Loader2, UserCircle2, CalendarRange, Wallet, StickyNote,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { adminApi, type AdminSubscription, type AdminUser } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const PLAN_BADGE: Record<string, string> = {
  free:     'bg-paper border border-hairline text-ink-muted',
  pro:      'bg-brand/10 text-brand border border-brand/20',
  ultimate: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
}

const STATUS_BADGE: Record<string, string> = {
  active:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  created:       'bg-blue-50 text-blue-600 border border-blue-200',
  authenticated: 'bg-blue-50 text-blue-600 border border-blue-200',
  pending:       'bg-amber-50 text-amber-700 border border-amber-200',
  halted:        'bg-red-50 text-red-700 border border-red-200',
  cancelled:     'bg-paper border border-hairline text-ink-muted',
  completed:     'bg-paper border border-hairline text-ink-muted',
  expired:       'bg-paper border border-hairline text-ink-muted',
}

const PLAN_ICON = { free: Zap, pro: Rocket, ultimate: Crown } as const

// Statuses where there's nothing left to cancel — Razorpay has already
// closed the subscription out one way or another. Anything else (active,
// created, authenticated, pending, halted) is still a live subscription an
// admin might need to force-cancel, e.g. one stuck "halted" after failed
// retries with no way for the user to fix it themselves.
const TERMINAL_STATUSES = new Set(['cancelled', 'completed', 'expired'])

interface OverrideModal {
  sub: AdminSubscription
  plan: string
}

interface ManualOnboardForm {
  query: string
  results: AdminUser[]
  searching: boolean
  selectedUser: AdminUser | null
  plan: 'pro' | 'ultimate'
  months: number
  currency: 'USD' | 'INR'
  amountPaid: string
  note: string
}

const EMPTY_MANUAL_FORM: ManualOnboardForm = {
  query: '', results: [], searching: false, selectedUser: null,
  plan: 'pro', months: 1, currency: 'USD', amountPaid: '', note: '',
}

const MONTH_PRESETS = [1, 3, 6, 12, 24]

export default function AdminSubscriptionsPage() {
  const [subs, setSubs]             = useState<AdminSubscription[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlan, setFilterPlan]     = useState('')
  const [overrideModal, setOverrideModal] = useState<OverrideModal | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState<AdminSubscription | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualForm, setManualForm] = useState<ManualOnboardForm>(EMPTY_MANUAL_FORM)
  const [manualLoading, setManualLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.billing.subscriptions({ page, limit: 20, status: filterStatus || undefined, plan: filterPlan || undefined })
      setSubs(data.subscriptions)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, filterStatus, filterPlan])

  useEffect(() => { load() }, [load])

  async function handleOverridePlan() {
    if (!overrideModal) return
    setActionLoading(true)
    try {
      await adminApi.billing.overridePlan(overrideModal.sub._id, overrideModal.plan)
      setOverrideModal(null)
      load()
    } catch { /* ignore */ }
    setActionLoading(false)
  }

  async function handleCancel() {
    if (!cancelConfirm) return
    setActionLoading(true)
    try {
      await adminApi.billing.cancelSubscription(cancelConfirm._id)
      setCancelConfirm(null)
      load()
    } catch { /* ignore */ }
    setActionLoading(false)
  }

  // Debounced user search for the manual-onboard picker
  useEffect(() => {
    if (!manualOpen || manualForm.selectedUser) return
    const q = manualForm.query.trim()
    if (!q) { setManualForm(f => ({ ...f, results: [] })); return }
    setManualForm(f => ({ ...f, searching: true }))
    const t = setTimeout(async () => {
      try {
        const data = await adminApi.users.list({ q, limit: 6 })
        setManualForm(f => ({ ...f, results: data.users, searching: false }))
      } catch {
        setManualForm(f => ({ ...f, searching: false }))
      }
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualForm.query, manualOpen, manualForm.selectedUser])

  function openManualOnboard() {
    setManualForm(EMPTY_MANUAL_FORM)
    setManualOpen(true)
  }

  async function handleManualOnboard() {
    if (!manualForm.selectedUser) return
    const amount = Number(manualForm.amountPaid)
    if (!Number.isFinite(amount) || amount < 0) return

    setManualLoading(true)
    try {
      await adminApi.billing.createManualSubscription({
        userId:     manualForm.selectedUser.id,
        plan:       manualForm.plan,
        months:     manualForm.months,
        currency:   manualForm.currency,
        amountPaid: amount,
        note:       manualForm.note.trim() || undefined,
      })
      setManualOpen(false)
      load()
    } catch { /* ignore */ }
    setManualLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-paper-elevated">
            <CreditCard className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Subscriptions</h1>
            <p className="text-xs text-ink-muted">{total} total subscriptions</p>
          </div>
        </div>
        <button
          onClick={openManualOnboard}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Globe className="h-3.5 w-3.5" /> Manually onboard
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="bg-transparent text-sm text-ink outline-none"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="created">Created</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="halted">Halted</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 py-1.5">
          <Users className="h-3.5 w-3.5 text-ink-muted" />
          <select
            value={filterPlan}
            onChange={e => { setFilterPlan(e.target.value); setPage(1) }}
            className="bg-transparent text-sm text-ink outline-none"
          >
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="ultimate">Ultimate</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-hairline bg-paper overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-paper-elevated">
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Billing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Started</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Period End</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">No subscriptions found</td></tr>
            ) : subs.map((s, i) => {
              const PIcon = PLAN_ICON[s.plan as keyof typeof PLAN_ICON] ?? Zap
              return (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-hairline/50 last:border-0 hover:bg-paper-elevated/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-ink">{s.userName}</p>
                      {s.paymentSource === 'manual' && (
                        <span
                          title={s.onboardingNote || 'Manually onboarded (international payment)'}
                          className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-indigo-600"
                        >
                          <Globe className="h-2.5 w-2.5" /> {s.currency}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">{s.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', PLAN_BADGE[s.plan])}>
                      <PIcon className="h-3 w-3" /> {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_BADGE[s.status] ?? STATUS_BADGE.expired)}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted capitalize">{s.billingInterval}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted" title={new Date(s.createdAt).toLocaleString()}>
                    {new Date(s.createdAt).toLocaleDateString()}
                    {s.currentPeriodStart && (
                      <p className="text-[11px] text-ink-faint">
                        billing since {new Date(s.currentPeriodStart).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '-'}
                    {s.cancelAtPeriodEnd && <span className="ml-1 text-amber-500">(cancelling)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOverrideModal({ sub: s, plan: s.plan })}
                        className="rounded-md border border-hairline px-2 py-1 text-xs font-medium text-ink-muted hover:bg-paper-elevated transition-colors"
                      >
                        Override plan
                      </button>
                      {!TERMINAL_STATUSES.has(s.status) && (
                        <button
                          onClick={() => setCancelConfirm(s)}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-muted">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-muted hover:bg-paper-elevated disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-muted hover:bg-paper-elevated disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Override plan modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-hairline bg-paper p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Override plan</h3>
              <button onClick={() => setOverrideModal(null)} className="rounded-lg p-1.5 hover:bg-hairline text-ink-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-ink-muted">
              Change plan for <strong className="text-ink">{overrideModal.sub.userName}</strong>
            </p>
            <select
              value={overrideModal.plan}
              onChange={e => setOverrideModal(m => m ? { ...m, plan: e.target.value } : null)}
              className="mb-4 w-full rounded-xl border border-hairline bg-paper-elevated px-3 py-2 text-sm text-ink outline-none"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="ultimate">Ultimate</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setOverrideModal(null)} className="flex-1 rounded-xl border border-hairline py-2 text-sm font-medium text-ink-muted hover:bg-paper-elevated transition-colors">
                Cancel
              </button>
              <button onClick={handleOverridePlan} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-hairline bg-paper p-6 shadow-xl"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="mb-1 font-semibold text-ink">Cancel subscription?</h3>
            <p className="mb-4 text-sm text-ink-muted">
              This will immediately cancel <strong>{cancelConfirm.userName}</strong>&apos;s subscription and downgrade them to Free.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 rounded-xl border border-hairline py-2 text-sm font-medium text-ink-muted hover:bg-paper-elevated transition-colors">
                Keep
              </button>
              <button onClick={handleCancel} disabled={actionLoading} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60">
                Cancel subscription
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Manual onboard — sliding right panel */}
      <Sheet open={manualOpen} onOpenChange={setManualOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 border-l border-hairline bg-paper p-0 data-[side=right]:sm:max-w-md"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-hairline px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand/10">
              <Globe className="h-4 w-4 text-brand" />
            </div>
            <div>
              <h3 className="font-serif text-base font-medium text-ink">Manually onboard customer</h3>
              <p className="text-xs text-ink-muted">Grants access exactly like a completed checkout</p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

            {/* User picker */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                <UserCircle2 className="h-3 w-3" /> Customer
              </label>
              {manualForm.selectedUser ? (
                <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{manualForm.selectedUser.name}</p>
                    <p className="text-xs text-ink-muted">{manualForm.selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setManualForm(f => ({ ...f, selectedUser: null, query: '' }))}
                    className="rounded-md p-1 text-ink-faint hover:bg-hairline"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5">
                    <Search className="h-3.5 w-3.5 text-ink-muted" />
                    <input
                      autoFocus
                      value={manualForm.query}
                      onChange={e => setManualForm(f => ({ ...f, query: e.target.value }))}
                      placeholder="Search user by name or email…"
                      className="w-full bg-transparent text-sm text-ink outline-none"
                    />
                    {manualForm.searching && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />}
                  </div>
                  {manualForm.results.length > 0 && (
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-hairline bg-paper p-1">
                      {manualForm.results.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setManualForm(f => ({ ...f, selectedUser: u, results: [] }))}
                          className="flex w-full flex-col items-start rounded-lg px-2.5 py-1.5 text-left hover:bg-paper-elevated"
                        >
                          <span className="text-sm text-ink">{u.name}</span>
                          <span className="text-xs text-ink-muted">{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plan */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                <Crown className="h-3 w-3" /> Plan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['pro', 'ultimate'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setManualForm(f => ({ ...f, plan: p }))}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors',
                      manualForm.plan === p
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-hairline text-ink-muted hover:bg-paper-elevated',
                    )}
                  >
                    {p === 'pro' ? <Rocket className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration paid for */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                <CalendarRange className="h-3 w-3" /> Duration paid for
              </label>
              <div className="mb-2 flex gap-1.5">
                {MONTH_PRESETS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setManualForm(f => ({ ...f, months: m }))}
                    className={cn(
                      'flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors',
                      manualForm.months === m
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-hairline text-ink-muted hover:bg-paper-elevated',
                    )}
                  >
                    {m}mo
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={60}
                placeholder="Custom months"
                value={manualForm.months === 0 ? '' : manualForm.months}
                onChange={e => {
                  const raw = e.target.value
                  if (raw === '') { setManualForm(f => ({ ...f, months: 0 })); return }
                  const n = Math.min(60, Math.max(0, Number(raw)))
                  if (Number.isFinite(n)) setManualForm(f => ({ ...f, months: n }))
                }}
                onBlur={() => setManualForm(f => ({ ...f, months: Math.max(1, f.months) }))}
                className="w-full rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5 text-sm text-ink outline-none"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                Access will run through {new Date(Date.now() + manualForm.months * 30 * 86400000).toLocaleDateString()} approx. — for a
                prepaid multi-month purchase (e.g. paid for 3 or 6 months at once), just set the exact number here.
              </p>
            </div>

            {/* Payment */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                <Wallet className="h-3 w-3" /> Amount collected
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={manualForm.currency}
                  onChange={e => setManualForm(f => ({ ...f, currency: e.target.value as 'USD' | 'INR' }))}
                  className="rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5 text-sm text-ink outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={manualForm.amountPaid}
                  onChange={e => setManualForm(f => ({ ...f, amountPaid: e.target.value }))}
                  placeholder="Amount paid"
                  className="rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5 text-sm text-ink outline-none"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                <StickyNote className="h-3 w-3" /> Note (optional)
              </label>
              <textarea
                value={manualForm.note}
                onChange={e => setManualForm(f => ({ ...f, note: e.target.value }))}
                placeholder="e.g. payment reference, how they paid"
                rows={3}
                className="w-full resize-none rounded-xl border border-hairline bg-paper-elevated px-3 py-2.5 text-sm text-ink outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 gap-3 border-t border-hairline bg-paper-elevated px-6 py-4">
            <button onClick={() => setManualOpen(false)} className="flex-1 rounded-xl border border-hairline-strong py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-hairline/30">
              Cancel
            </button>
            <button
              onClick={handleManualOnboard}
              disabled={manualLoading || !manualForm.selectedUser || !manualForm.amountPaid || manualForm.months < 1}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {manualLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Activate subscription
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

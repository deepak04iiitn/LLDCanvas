'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Search, ChevronLeft, ChevronRight, Users, Sparkles, Crown, Zap, AlertTriangle, X, Check } from 'lucide-react'
import { adminApi, type AdminSubscription } from '@/lib/admin-api'
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

const PLAN_ICON = { free: Zap, pro: Sparkles, ultimate: Crown } as const

interface OverrideModal {
  sub: AdminSubscription
  plan: string
}

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-paper-elevated">
          <CreditCard className="h-4 w-4 text-brand" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">Subscriptions</h1>
          <p className="text-xs text-ink-muted">{total} total subscriptions</p>
        </div>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Period End</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-ink-muted">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-ink-muted">No subscriptions found</td></tr>
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
                    <p className="font-medium text-ink">{s.userName}</p>
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
                      {s.status === 'active' && (
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
    </div>
  )
}

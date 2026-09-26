'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Check, Trash2, X, Loader2 } from 'lucide-react'
import { journeyApi, type PlannrSummary } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend', fullstack: 'Full Stack', general: 'General',
}
const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP', 'basic-lld': 'Know basic LLD', solving: 'Already solving',
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreatePlannrModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({
    planName: '',
    targetRole: 'sde2',
    preparationDays: 30,
    currentLevel: 'scratch',
  })
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!form.planName.trim()) return
    setLoading(true)
    try {
      await journeyApi.createPlan({
        planName: form.planName.trim(),
        targetRole: form.targetRole,
        preparationDays: form.preparationDays,
        currentLevel: form.currentLevel,
      })
      onCreated()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-paper rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">New Plannr</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={16} /></button>
        </div>

        {/* Plan name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Plan Name</label>
          <input
            autoFocus
            value={form.planName}
            onChange={e => setForm(f => ({ ...f, planName: e.target.value }))}
            placeholder="e.g. Google SDE-2 Prep"
            className="w-full rounded-xl border border-hairline px-3 py-2.5 text-[14px] text-ink bg-paper-elevated focus:outline-none focus:border-brand"
          />
        </div>

        {/* Target role */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Target Role</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setForm(f => ({ ...f, targetRole: k }))}
                className={cn(
                  'rounded-xl border py-2 text-[12px] font-medium transition-all',
                  form.targetRole === k ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30',
                )}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* Prep days */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Timeline</label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 60].map(d => (
              <button
                key={d}
                onClick={() => setForm(f => ({ ...f, preparationDays: d }))}
                className={cn(
                  'rounded-xl border py-2 text-[12px] font-medium transition-all',
                  form.preparationDays === d ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30',
                )}
              >{d}d</button>
            ))}
          </div>
        </div>

        {/* Current level */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Starting Level</label>
          <div className="space-y-1.5">
            {Object.entries(LEVEL_LABELS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setForm(f => ({ ...f, currentLevel: k }))}
                className={cn(
                  'w-full text-left rounded-xl border px-3 py-2 text-[13px] transition-all',
                  form.currentLevel === k ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30',
                )}
              >{v}</button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !form.planName.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create Plannr
        </button>
      </div>
    </div>
  )
}

// ─── Switcher Dropdown ────────────────────────────────────────────────────────
export function PlannrSwitcher() {
  const router = useRouter()
  const [plans, setPlans] = useState<PlannrSummary[]>([])
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const activePlan = plans.find(p => p.isActive)

  function load() {
    journeyApi.listPlans().then(d => setPlans(d.plans)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function handleSwitch(id: string) {
    if (switching) return
    setSwitching(id)
    try {
      await journeyApi.switchPlan(id)
      await load()
      router.refresh()
      setOpen(false)
    } finally {
      setSwitching(null)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deleting || plans.length <= 1) return
    if (!confirm('Delete this Plannr? This cannot be undone.')) return
    setDeleting(id)
    try {
      await journeyApi.deletePlan(id)
      await load()
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  if (!activePlan) return null

  return (
    <>
      <div className="relative px-3 py-2 border-b border-hairline">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-paper transition-colors"
        >
          <div className="min-w-0">
            <p className="text-[11px] text-ink-faint truncate">Active Plan</p>
            <p className="text-[13px] font-medium text-ink truncate">{activePlan.planName}</p>
          </div>
          <ChevronDown size={12} className={cn('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-2 right-2 top-full mt-1 z-20 bg-paper rounded-xl border border-hairline shadow-lg overflow-hidden">
              {/* Existing plans */}
              <div className="max-h-52 overflow-y-auto">
                {plans.map(p => (
                  <div
                    key={p._id}
                    onClick={() => !p.isActive && handleSwitch(p._id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 transition-colors group',
                      p.isActive ? 'bg-brand-tint/30 cursor-default' : 'hover:bg-paper-elevated cursor-pointer',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink truncate">{p.planName}</p>
                      <p className="text-[10px] text-ink-faint">{ROLE_LABELS[p.targetRole]} · {p.progressPercent}% done</p>
                    </div>
                    {p.isActive ? (
                      <Check size={12} className="text-brand shrink-0" />
                    ) : switching === p._id ? (
                      <Loader2 size={12} className="animate-spin text-ink-faint shrink-0" />
                    ) : (
                      <button
                        onClick={e => handleDelete(p._id, e)}
                        disabled={plans.length <= 1}
                        className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 disabled:hidden transition-opacity"
                      >
                        {deleting === p._id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Create new */}
              <div className="border-t border-hairline">
                <button
                  onClick={() => { setOpen(false); setShowCreate(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-brand font-medium hover:bg-brand-tint/20 transition-colors"
                >
                  <Plus size={12} /> New Plannr
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <CreatePlannrModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); router.refresh() }}
        />
      )}
    </>
  )
}

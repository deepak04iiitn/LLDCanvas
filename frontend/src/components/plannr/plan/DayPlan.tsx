'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, CheckCircle2, ChevronDown, Plus, Check, Trash2, X, Loader2 } from 'lucide-react'
import { journeyApi, type DayPlanEntry, type PlannrSummary } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const STATUS_CONFIG = {
  done:     { color: 'border-green-200 bg-green-50',   badge: 'bg-green-100 text-green-700',   label: 'Done' },
  today:    { color: 'border-brand/30 bg-brand-tint/20 ring-2 ring-brand/20', badge: 'bg-brand text-white', label: 'Today' },
  upcoming: { color: 'border-hairline bg-paper',       badge: 'bg-paper-elevated text-ink-faint', label: 'Upcoming' },
}

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer', fullstack: 'Full Stack Engineer', general: 'General LLD',
}
const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP', 'basic-lld': 'Know basic LLD', solving: 'Already solving',
}

function CreatePlannrModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ planName: '', targetRole: 'sde2', preparationDays: 30, currentLevel: 'scratch' })
  const [loading, setLoading] = useState(false)
  async function handleCreate() {
    if (!form.planName.trim()) return
    setLoading(true)
    try { await journeyApi.createPlan({ planName: form.planName.trim(), targetRole: form.targetRole, preparationDays: form.preparationDays, currentLevel: form.currentLevel }); onCreated() }
    finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-paper rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">New Plannr</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={16} /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Plan Name</label>
          <input autoFocus value={form.planName} onChange={e => setForm(f => ({ ...f, planName: e.target.value }))} placeholder="e.g. Google SDE-2 Prep"
            className="w-full rounded-xl border border-hairline px-3 py-2.5 text-[14px] text-ink bg-paper-elevated focus:outline-none focus:border-brand" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Target Role</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries({ sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend', fullstack: 'Full Stack', general: 'General' }).map(([k, v]) => (
              <button key={k} onClick={() => setForm(f => ({ ...f, targetRole: k }))}
                className={cn('rounded-xl border py-2 text-[12px] font-medium transition-all', form.targetRole === k ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30')}>{v}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Timeline</label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 60].map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, preparationDays: d }))}
                className={cn('rounded-xl border py-2 text-[12px] font-medium transition-all', form.preparationDays === d ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30')}>{d}d</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Starting Level</label>
          <div className="space-y-1.5">
            {Object.entries(LEVEL_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setForm(f => ({ ...f, currentLevel: k }))}
                className={cn('w-full text-left rounded-xl border px-3 py-2 text-[13px] transition-all', form.currentLevel === k ? 'border-brand bg-brand-tint/40 text-brand' : 'border-hairline text-ink-muted hover:border-brand/30')}>{v}</button>
            ))}
          </div>
        </div>
        <button onClick={handleCreate} disabled={loading || !form.planName.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create Plannr
        </button>
      </div>
    </div>
  )
}

function PlanSwitcherButton({ onSwitch }: { onSwitch: () => void }) {
  const [plans, setPlans] = useState<PlannrSummary[]>([])
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  function load() { journeyApi.listPlans().then(d => setPlans(d.plans)).catch(() => {}) }
  useEffect(() => { load() }, [])
  const activePlan = plans.find(p => p.isActive)
  async function handleSwitch(id: string) {
    if (switching) return; setSwitching(id)
    try { await journeyApi.switchPlan(id); await load(); onSwitch(); setOpen(false) }
    finally { setSwitching(null) }
  }
  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deleting || plans.length <= 1) return
    if (!confirm('Delete this Plannr? This cannot be undone.')) return
    setDeleting(id)
    try { await journeyApi.deletePlan(id); await load(); onSwitch() }
    finally { setDeleting(null) }
  }
  return (
    <>
      <div className="relative">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30 transition-colors">
          <span className="max-w-32 truncate">{activePlan?.planName ?? 'My Plan'}</span>
          <ChevronDown size={12} className={cn('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-60 bg-paper rounded-xl border border-hairline shadow-lg overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {plans.map(p => (
                  <div key={p._id} onClick={() => !p.isActive && handleSwitch(p._id)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 transition-colors group', p.isActive ? 'bg-brand-tint/30 cursor-default' : 'hover:bg-paper-elevated cursor-pointer')}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink truncate">{p.planName}</p>
                      <p className="text-[10px] text-ink-faint">{ROLE_LABELS[p.targetRole]} · {p.progressPercent}% done</p>
                    </div>
                    {p.isActive ? <Check size={12} className="text-brand shrink-0" />
                      : switching === p._id ? <Loader2 size={12} className="animate-spin text-ink-faint shrink-0" />
                      : <button onClick={e => handleDelete(p._id, e)} disabled={plans.length <= 1}
                          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 disabled:hidden transition-opacity">
                          {deleting === p._id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                        </button>}
                  </div>
                ))}
              </div>
              <div className="border-t border-hairline">
                <button onClick={() => { setOpen(false); setShowCreate(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-brand font-medium hover:bg-brand-tint/20 transition-colors">
                  <Plus size={12} /> New Plannr
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {showCreate && <CreatePlannrModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); onSwitch() }} />}
    </>
  )
}

function DayCard({ entry }: { entry: DayPlanEntry }) {
  const cfg = STATUS_CONFIG[entry.status]

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', cfg.color)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.badge)}>{cfg.label}</span>
            <span className="text-[11px] text-ink-faint">{entry.date}</span>
          </div>
          <p className="font-medium text-[14px] text-ink mt-1">Day {entry.day} · {entry.focus}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Clock size={10} /> {entry.totalMinutes}m
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {entry.topics.map(t => (
          entry.status === 'upcoming' ? (
            <Link href={`/plannr/topic/${t.slug}`} key={t.slug}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-hairline hover:border-brand/30 hover:bg-paper-elevated transition-colors">
                <span className="text-sm">{t.icon}</span>
                <span className="text-[13px] text-ink flex-1">{t.title}</span>
                <span className="text-[10px] text-ink-faint">{t.estimatedMinutes}m</span>
              </div>
            </Link>
          ) : (
            <div key={t.slug} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-paper/70">
              {entry.status === 'done' ? (
                <CheckCircle2 size={12} className="text-green-600 shrink-0" />
              ) : (
                <BookOpen size={12} className="text-brand shrink-0" />
              )}
              <span className="text-[13px] text-ink flex-1">{t.icon} {t.title}</span>
              <span className="text-[10px] text-ink-faint">{t.estimatedMinutes}m</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export function DayPlan() {
  const router = useRouter()
  const [plan, setPlan] = useState<DayPlanEntry[]>([])
  const [meta, setMeta] = useState<{ preparationDays: number; startDate: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getPlan()
      .then(d => {
        setPlan(d.plan)
        setMeta({ preparationDays: d.preparationDays, startDate: d.startDate })
      })
      .finally(() => setLoading(false))
  }, [])

  const doneCount = plan.filter(d => d.status === 'done').length
  const total = plan.length
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
                Plannr
              </p>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">My Plan</h1>
              {meta && (
                <p className="mt-2 text-[14px] text-ink-muted">
                  {meta.preparationDays}-day plan · Started {new Date(meta.startDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <PlanSwitcherButton onSwitch={() => router.refresh()} />
          </div>

          {/* Progress summary */}
          {!loading && plan.length > 0 && (
            <div className="rounded-2xl bg-paper-elevated border border-hairline p-5 space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-muted">Overall Progress</span>
                <span className="font-medium text-ink">{doneCount}/{total} days</span>
              </div>
              <div className="h-2 rounded-full bg-hairline overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-faint">{progress}% complete</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : plan.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">No plan yet. Complete onboarding to generate your plan.</div>
          ) : (
            <div className="space-y-4">
              {plan.map(entry => <DayCard key={entry.day} entry={entry} />)}
            </div>
          )}
        </div>
    </div>
  )
}

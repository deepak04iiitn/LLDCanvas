'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Map, BookOpen, Target, BarChart2, Flame, Clock, Play, CheckCircle2,
  ChevronDown, Plus, Check, Trash2, X, Loader2,
} from 'lucide-react'
import { journeyApi, type JourneyProfile, type JourneyRecommendation, type JourneyActivity, type PlannrSummary } from '@/lib/plannr-api'
import { SpacedRepetitionWidget } from '@/components/plannr/hub/SpacedRepetitionWidget'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer', general: 'General LLD',
}

const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP', 'basic-lld': 'Know basic LLD', solving: 'Already solving',
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreatePlannrModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ planName: '', targetRole: 'sde2', preparationDays: 30, currentLevel: 'scratch' })
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!form.planName.trim()) return
    setLoading(true)
    try {
      await journeyApi.createPlan({ planName: form.planName.trim(), targetRole: form.targetRole, preparationDays: form.preparationDays, currentLevel: form.currentLevel })
      onCreated()
    } finally { setLoading(false) }
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

// ─── Plan Switcher Button (inline, for page headers) ──────────────────────────
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
    if (switching) return
    setSwitching(id)
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
            <div className="absolute left-0 top-full mt-1 z-20 w-60 bg-paper rounded-xl border border-hairline shadow-lg overflow-hidden">
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

      {showCreate && (
        <CreatePlannrModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); onSwitch() }} />
      )}
    </>
  )
}

const PLACEHOLDER_ACTIVITIES = [
  { label: 'Review SOLID Principles', minutes: 15 },
  { label: 'Practice Design Patterns Quiz', minutes: 20 },
  { label: 'LLD Interview Q&A', minutes: 10 },
]

function RecommendationCard({ rec }: { rec: JourneyRecommendation }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
        Next Topic
      </p>
      <h3 className="font-serif text-base font-medium text-ink">{rec.topicTitle}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted line-clamp-2">{rec.reason}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock size={11} />
          ~{rec.estimatedMinutes} min
        </span>
        <Link
          href={`/plannr/topic/${rec.topicSlug}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Start Topic <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

export function JourneyDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    profile: JourneyProfile | null
    recommendation: JourneyRecommendation | null
    recentActivity: JourneyActivity[]
    completedCount: number
    totalTopics: number
    progressPercent: number
    onboarded: boolean
  } | null>(null)

  useEffect(() => {
    journeyApi.getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!data || !data.onboarded || !data.profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mb-5 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint">
              <Map size={28} className="text-brand" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-medium text-ink mb-3">Start Your Preparation</h1>
          <p className="text-[15px] leading-relaxed text-ink-muted mb-8">
            A guided LLD preparation system that takes you from basics to interview-ready.
          </p>
          <div className="mb-8 space-y-3 text-left">
            {[
              { icon: BookOpen, label: 'Learn theory', sub: 'Simple, clear explanations for every concept' },
              { icon: Target, label: 'Practice problems', sub: 'Real interview questions with guided answers' },
              { icon: BarChart2, label: 'Track progress', sub: 'Across 15 LLD skill dimensions' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper-elevated p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint">
                  <Icon size={15} className="text-brand" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink">{label}</p>
                  <p className="text-[12px] text-ink-faint">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/plannr/setup"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Create Your Plan <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const { profile, recommendation, completedCount, totalTopics, progressPercent } = data
  const daysPassed = Math.floor(
    (Date.now() - new Date(profile.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )
  const daysLeft = Math.max(0, profile.preparationDays - daysPassed)
  const currentDay = daysPassed + 1

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-medium text-ink">Your Preparation Plan</h1>
            <p className="font-mono text-[13px] text-ink-muted mt-1">
              Day {currentDay} &middot; {ROLE_LABELS[profile.targetRole] ?? profile.targetRole} &middot; {daysLeft > 0 ? `${daysLeft} days left` : 'Journey complete'}
            </p>
          </div>
          <PlanSwitcherButton onSwitch={() => router.refresh()} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT column — main content */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* TODAY'S PLAN */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-4">
                Today
              </p>
              <div className="space-y-3 mb-5">
                {PLACEHOLDER_ACTIVITIES.map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[13px] text-ink">{act.label}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                      <Clock size={10} /> {act.minutes} min
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-hairline mb-4">
                <span className="text-[12px] text-ink-muted">Total today</span>
                <span className="font-mono text-[13px] font-semibold text-ink">
                  {PLACEHOLDER_ACTIVITIES.reduce((s, a) => s + a.minutes, 0)} min
                </span>
              </div>
              <Link
                href="/plannr/roadmap"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Play size={14} /> Start Today&apos;s Plan
              </Link>
            </div>

            {/* NEXT TOPIC */}
            {recommendation ? (
              <RecommendationCard rec={recommendation} />
            ) : (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-5 text-center">
                <CheckCircle2 size={20} className="text-brand mx-auto mb-2" />
                <p className="font-medium text-[14px] text-ink">All topics completed — interview ready!</p>
                <Link href="/plannr/experiences" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
                  Try interview experiences <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT column — 320 px */}
          <div className="lg:w-80 lg:shrink-0 space-y-4">
            {/* Progress */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">
                Progress
              </p>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] text-ink">{completedCount}/{totalTopics} topics completed</span>
                <span className="font-mono text-[13px] font-bold text-ink">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-hairline overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Due for Review */}
            <SpacedRepetitionWidget />

            {/* Streak */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">
                Streak
              </p>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-brand" />
                <span className="font-serif text-xl font-medium text-ink">7-day streak</span>
              </div>
              <p className="text-[11px] text-ink-faint mt-1">Keep it going!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

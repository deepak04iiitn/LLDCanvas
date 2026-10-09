'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Check, Trash2, Loader2 } from 'lucide-react'
import { journeyApi, type PlannrSummary } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend', fullstack: 'Full Stack', general: 'General',
}

type SwitcherVariant = 'sidebar' | 'header'

export function PlannrSwitcher({ variant = 'sidebar' }: { variant?: SwitcherVariant }) {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const [plans, setPlans] = useState<PlannrSummary[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Prefer active plan; fall back to first so the control never disappears
  const activePlan = plans.find(p => p.isActive) ?? plans[0] ?? null
  const isHeader = variant === 'header'
  const displayName = activePlan?.planName?.trim() || 'My Plan'
  const initial = (displayName[0] ?? 'P').toUpperCase()

  function load() {
    return journeyApi
      .listPlans()
      .then(d => setPlans(d.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoaded(true))
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open])

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

  function handleNewPlan() {
    setOpen(false)
    router.push('/dashboard/plannr/setup?mode=new')
  }

  const menu = open && (
      <div
        role="menu"
        className={cn(
          'absolute z-[70] mt-2 w-72 origin-top-left rounded-2xl border border-hairline bg-paper shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]',
          isHeader ? 'left-0 top-full' : 'left-2 right-2 top-full w-auto',
        )}
      >
        <div className="px-3.5 pt-3 pb-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Your plans</p>
        </div>
        <div className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
          {plans.length === 0 && loaded && (
            <p className="px-2.5 py-3 text-[12px] text-ink-muted">No plans yet.</p>
          )}
          {plans.map(p => {
            const selected = activePlan?._id === p._id
            return (
              <div
                key={p._id}
                onClick={() => !selected && handleSwitch(p._id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors group',
                  selected ? 'bg-brand/8 cursor-default' : 'hover:bg-paper-elevated cursor-pointer',
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-serif text-[13px] font-medium',
                    selected ? 'bg-brand text-white' : 'bg-paper-elevated border border-hairline text-ink-muted',
                  )}
                >
                  {(p.planName?.[0] ?? 'P').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{p.planName}</p>
                  <p className="text-[11px] text-ink-faint">
                    {ROLE_LABELS[p.targetRole]} · {p.progressPercent}%
                  </p>
                </div>
                {selected ? (
                  <Check size={14} className="text-brand shrink-0" />
                ) : switching === p._id ? (
                  <Loader2 size={14} className="animate-spin text-ink-faint shrink-0" />
                ) : (
                  <button
                    onClick={e => handleDelete(p._id, e)}
                    disabled={plans.length <= 1}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 disabled:hidden transition-opacity p-1"
                    aria-label="Delete plan"
                  >
                    {deleting === p._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="border-t border-hairline p-1.5">
          <button
            onClick={handleNewPlan}
            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-[13px] text-brand font-medium hover:bg-brand/5 transition-colors"
          >
            <Plus size={14} /> New plan
          </button>
        </div>
      </div>
  )

  if (isHeader) {
    return (
      <div ref={rootRef} className="relative z-[50] shrink-0">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label="Switch plan"
          className={cn(
            'group flex min-w-[148px] items-center gap-2.5 rounded-full border border-hairline bg-paper-elevated pl-1 pr-3 py-1',
            'shadow-sm hover:border-brand/25 hover:shadow transition-all',
            open && 'border-brand/30 shadow-md',
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
            {!loaded ? <Loader2 size={12} className="animate-spin" /> : initial}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block font-mono text-[8px] uppercase tracking-[0.16em] text-ink-faint leading-none mb-0.5">
              Active plan
            </span>
            <span className="block max-w-[160px] truncate text-[13px] font-medium text-ink leading-tight">
              {!loaded ? 'Loading…' : displayName}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'shrink-0 text-ink-faint transition-transform duration-200',
              open && 'rotate-180 text-brand',
            )}
          />
        </button>
        {menu}
      </div>
    )
  }

  // Sidebar variant — hide only when there are truly no plans after load
  if (loaded && !activePlan) return null

  return (
    <div ref={rootRef} className="relative px-3 py-2 border-b border-hairline">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-paper transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[11px] text-ink-faint truncate">Active Plan</p>
          <p className="text-[13px] font-medium text-ink truncate">
            {!loaded ? 'Loading…' : displayName}
          </p>
        </div>
        <ChevronDown size={12} className={cn('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>
      {menu}
    </div>
  )
}

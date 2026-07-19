'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Infinity, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { useInterview } from '@/contexts/InterviewContext'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const PRESETS = [
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
  { label: 'Custom', seconds: -1 },
  { label: 'No limit', seconds: 0 },
]

// The dial is purely illustrative — it fills toward a full circle as the
// chosen duration approaches (and exceeds) 90 minutes, so longer sessions
// visibly read as "more committed" without needing exact math to matter.
const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function InterviewSetupModal({ open, onClose }: Props) {
  const router = useRouter()
  const { startSession } = useInterview()

  const [presetIdx,    setPresetIdx]    = useState(0)
  const [customMins,   setCustomMins]   = useState(45)
  const [loading,      setLoading]      = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) { setPresetIdx(0); setCustomMins(45); setLoading(false) }
  }, [open])

  const selectedPreset = PRESETS[presetIdx]
  const durationSeconds = selectedPreset.seconds === -1
    ? customMins * 60
    : selectedPreset.seconds

  const totalMinutes = durationSeconds === 0 ? null : Math.max(1, Math.round(durationSeconds / 60))
  const ringPct = durationSeconds === 0 ? 1 : Math.min(1, (totalMinutes ?? 0) / 90)

  async function handleBegin() {
    if (loading) return
    setLoading(true)
    try {
      const { session, diagramId, problem } = await api.interview.create({
        durationLimit: durationSeconds === 0 ? null : durationSeconds,
      })
      startSession(session)
      onClose()
      router.push(`/editor/${diagramId}?problem=${problem.slug}&interview=1`)
      toast.success(`You're up: ${problem.title} — good luck!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border border-hairline-strong bg-paper-elevated p-0 shadow-2xl sm:max-w-2xl">
        <DialogTitle className="sr-only">Start a practice session</DialogTitle>

        <div className="relative px-12 pt-10 pb-9">
          {/* Soft brand-tinted glow behind the dial — the same warm palette
              used across the rest of the app, not a foreign indigo one. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-brand-tint/70 to-transparent" />

          {/* ── Radial duration dial ─────────────────────────────────────────── */}
          <div className="relative mb-7 flex flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={RING_RADIUS} strokeWidth="7" fill="none" className="stroke-hairline" />
                <circle
                  cx="50" cy="50" r={RING_RADIUS} strokeWidth="7" fill="none" strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - ringPct)}
                  className={cn(
                    'transition-all duration-500 ease-out',
                    durationSeconds === 0 ? 'stroke-gold' : 'stroke-brand',
                  )}
                />
              </svg>
              <div className="flex flex-col items-center">
                {durationSeconds === 0 ? (
                  <Infinity className="h-8 w-8 text-gold" />
                ) : (
                  <span className="font-mono text-3xl font-semibold text-ink">{totalMinutes}</span>
                )}
                <span className="mt-0.5 text-[10px] font-semibold tracking-widest text-ink-faint uppercase">
                  {durationSeconds === 0 ? 'no limit' : 'minutes'}
                </span>
              </div>
            </div>
            <p className="relative mt-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
              Practice duration
            </p>
          </div>

          {/* ── Duration pills ───────────────────────────────────────────────── */}
          <div className="relative mb-6">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPresetIdx(i)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150',
                    presetIdx === i
                      ? 'border-transparent bg-brand text-brand-foreground shadow-sm'
                      : 'border-hairline-strong bg-paper-elevated text-ink-muted hover:border-brand/30 hover:bg-brand-tint hover:text-ink',
                  )}
                >
                  {p.label === 'No limit' && <Infinity className="h-3.5 w-3.5" />}
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom minutes — a stepper, not a raw number input, so nothing
                shifts around as the value changes and there's no native
                spinner arrows to fight with. */}
            {selectedPreset.seconds === -1 && (
              <div className="mt-3 flex w-fit items-center gap-3 rounded-full border border-hairline-strong bg-brand-tint/50 py-1 pr-4 pl-1">
                <button
                  type="button"
                  onClick={() => setCustomMins(m => Math.max(5, m - 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-elevated text-brand
                             shadow-sm ring-1 ring-hairline-strong transition-colors hover:bg-brand-tint"
                  aria-label="Decrease minutes"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2.5ch] text-center font-mono text-sm font-semibold text-ink">
                  {customMins}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomMins(m => Math.min(240, m + 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-elevated text-brand
                             shadow-sm ring-1 ring-hairline-strong transition-colors hover:bg-brand-tint"
                  aria-label="Increase minutes"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm text-ink-faint">minutes</span>
              </div>
            )}
          </div>

          {/* ── CTA ───────────────────────────────────────────────────────────── */}
          <button
            onClick={handleBegin}
            disabled={loading}
            className="relative flex w-full items-center justify-center gap-2 rounded-2xl
                       bg-brand py-3.5 text-sm font-semibold text-brand-foreground shadow-sm
                       transition-all duration-150 hover:bg-brand-hover active:scale-[0.98]
                       disabled:opacity-60"
          >
            {loading ? 'Starting…' : 'Start the clock'}
            {!loading && <ChevronRight className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="relative mt-3 block w-full text-center text-xs text-ink-faint transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

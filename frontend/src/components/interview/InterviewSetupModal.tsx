'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ChevronRight, Infinity } from 'lucide-react'
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
  /** If opened from inside the editor, pass the current diagram id */
  currentDiagramId?: string | null
}

const PRESETS = [
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
  { label: 'Custom', seconds: -1 },
  { label: 'No limit', seconds: 0 },
]

function fmt(seconds: number) {
  if (seconds === 0) return '∞ : 00 : 00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(' : ')
}

export function InterviewSetupModal({ open, onClose, currentDiagramId }: Props) {
  const router = useRouter()
  const { startSession } = useInterview()

  const [title,        setTitle]        = useState('')
  const [presetIdx,    setPresetIdx]    = useState(0)
  const [customMins,   setCustomMins]   = useState(45)
  const [loading,      setLoading]      = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) { setTitle(''); setPresetIdx(0); setCustomMins(45); setLoading(false) }
  }, [open])

  const selectedPreset = PRESETS[presetIdx]
  const durationSeconds = selectedPreset.seconds === -1
    ? customMins * 60
    : selectedPreset.seconds

  const displayTime = durationSeconds === 0
    ? '∞ : 00 : 00'
    : fmt(durationSeconds)

  async function handleBegin() {
    if (loading) return
    setLoading(true)
    try {
      const { session } = await api.interview.create({
        title:         title.trim() || 'Practice Session',
        diagramId:     currentDiagramId ?? null,
        durationLimit: durationSeconds === 0 ? null : durationSeconds,
      })
      startSession(session)
      onClose()
      // If no linked diagram, open local editor in practice mode
      if (!currentDiagramId) {
        router.push('/editor/local')
      }
      toast.success('Session started — good luck!')
    } catch {
      toast.error('Could not start session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogTitle className="sr-only">Start a practice session</DialogTitle>

        {/* ── Dark header strip ──────────────────────────────────────────────── */}
        <div className="relative flex flex-col items-center overflow-hidden bg-slate-900 px-8 py-8">
          {/* Background dots */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-500/40">
            <Clock className="h-6 w-6 text-indigo-400" />
          </div>

          {/* Clock face */}
          <div className="relative mt-2 font-mono text-4xl font-black tracking-widest text-white">
            {displayTime}
          </div>
          <p className="relative mt-1.5 text-[11px] text-slate-500 tracking-widest uppercase">
            {durationSeconds === 0 ? 'No time limit' : 'Practice duration'}
          </p>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="space-y-5 px-6 py-6">

          {/* Question title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              What will you design?
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleBegin() }}
              placeholder="e.g. Design a URL Shortener"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                         text-gray-800 outline-none transition-all placeholder:text-gray-300
                         focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Duration picker */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPresetIdx(i)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-medium transition-all duration-150',
                    presetIdx === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  {p.label === 'No limit' && <Infinity className="h-3.5 w-3.5" />}
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom minutes input */}
            {selectedPreset.seconds === -1 && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={customMins}
                  onChange={e => setCustomMins(Math.max(5, Math.min(240, Number(e.target.value))))}
                  className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-center
                             font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <span className="text-sm text-gray-400">minutes</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleBegin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3
                       text-sm font-semibold text-white shadow-sm transition-all duration-150
                       hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Starting…' : 'Start the clock'}
            {!loading && <ChevronRight className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="block w-full text-center text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

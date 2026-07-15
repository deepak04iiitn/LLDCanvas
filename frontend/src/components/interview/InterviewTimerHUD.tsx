'use client'

import { useState } from 'react'
import { Panel } from '@xyflow/react'
import {
  Pause, Play, StickyNote, StopCircle,
  Maximize2, Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInterview } from '@/contexts/InterviewContext'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'

function fmtElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getTimerColor(elapsed: number, limit: number | null): string {
  if (!limit) return 'text-emerald-400'
  const pct = elapsed / limit
  if (pct < 0.5)  return 'text-emerald-400'
  if (pct < 0.75) return 'text-amber-400'
  return 'text-red-400'
}

interface Props {
  onEndSession: (snapshot?: unknown) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function InterviewTimerHUD({ onEndSession, isFullscreen, onToggleFullscreen }: Props) {
  const {
    activeSession, elapsed, isPaused,
    pauseTimer, resumeTimer, setNotesOpen,
  } = useInterview()

  // Mount the timer hook — drives the 1-second tick
  useInterviewTimer()

  const [confirmEnd, setConfirmEnd] = useState(false)

  if (!activeSession) return null

  const timerColor = getTimerColor(elapsed, activeSession.durationLimit)
  const isOvertime = activeSession.durationLimit && elapsed > activeSession.durationLimit

  return (
    <Panel position="top-right">
      <div className="mr-2 mt-2">
        {/* ── Confirm end popover ─────────────────────────────────────────── */}
        {confirmEnd && (
          <div className="mb-2 rounded-2xl border border-slate-700/60 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-[12px] text-slate-300">
              End session after <span className="font-bold text-white">{fmtElapsed(elapsed)}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmEnd(false); onEndSession() }}
                className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-semibold
                           text-white transition-colors hover:bg-indigo-700"
              >
                Save & Exit
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 rounded-lg border border-slate-700 py-1.5 text-[11px]
                           text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
              >
                Keep going
              </button>
            </div>
          </div>
        )}

        {/* ── Main HUD pill ───────────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur-md',
          'bg-slate-900/95 border-slate-700/50',
          isOvertime && 'border-red-500/50',
        )}>
          {/* Color bar */}
          <div className={cn('h-6 w-1 rounded-full transition-colors duration-500', {
            'bg-emerald-400': timerColor === 'text-emerald-400',
            'bg-amber-400':   timerColor === 'text-amber-400',
            'bg-red-400':     timerColor === 'text-red-400',
          })} />

          {/* Timer digits */}
          <div className="flex flex-col">
            {activeSession.title && (
              <span className="mb-px text-[9px] leading-none text-slate-500 truncate max-w-[110px]">
                {activeSession.title}
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                'font-mono text-xl font-black leading-none tracking-wider transition-colors duration-300',
                timerColor,
                isPaused && 'opacity-50',
              )}>
                {fmtElapsed(elapsed)}
              </span>
              {isPaused && (
                <span className="rounded bg-amber-500/20 px-1.5 py-px font-mono text-[9px]
                                 font-bold uppercase tracking-widest text-amber-400">
                  paused
                </span>
              )}
              {isOvertime && !isPaused && (
                <span className="rounded bg-red-500/20 px-1.5 py-px font-mono text-[9px]
                                 font-bold uppercase tracking-widest text-red-400">
                  over
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="ml-1 flex items-center gap-1">
            <HudBtn
              onClick={isPaused ? resumeTimer : pauseTimer}
              title={isPaused ? 'Resume (P)' : 'Pause (P)'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </HudBtn>

            <HudBtn onClick={() => setNotesOpen(true)} title="Notes (N)">
              <StickyNote className="h-3.5 w-3.5" />
            </HudBtn>

            <HudBtn onClick={onToggleFullscreen} title="Fullscreen (F)">
              {isFullscreen
                ? <Minimize2 className="h-3.5 w-3.5" />
                : <Maximize2 className="h-3.5 w-3.5" />}
            </HudBtn>

            <div className="mx-0.5 h-4 w-px bg-slate-700" />

            <HudBtn
              onClick={() => setConfirmEnd(true)}
              title="End session"
              danger
            >
              <StopCircle className="h-3.5 w-3.5" />
            </HudBtn>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function HudBtn({
  children, onClick, title, danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-100',
        danger
          ? 'text-red-500 hover:bg-red-500/15 hover:text-red-400'
          : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200',
      )}
    >
      {children}
    </button>
  )
}

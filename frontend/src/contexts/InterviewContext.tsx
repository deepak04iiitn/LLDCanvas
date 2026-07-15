'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { InterviewSession } from '@/types'

interface InterviewCtx {
  activeSession: InterviewSession | null
  elapsed: number
  isPaused: boolean
  isNotesOpen: boolean
  setElapsed: React.Dispatch<React.SetStateAction<number>>
  startSession: (session: InterviewSession) => void
  pauseTimer: () => void
  resumeTimer: () => void
  endSession: (canvasSnapshot?: unknown) => Promise<void>
  setNotesOpen: (open: boolean) => void
}

const Ctx = createContext<InterviewCtx | null>(null)

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null)
  const [elapsed,       setElapsed]       = useState(0)
  const [isPaused,      setIsPaused]      = useState(false)
  const [isNotesOpen,   setNotesOpen]     = useState(false)

  const startSession = useCallback((session: InterviewSession) => {
    setActiveSession(session)
    setElapsed(session.timeElapsed ?? 0)
    setIsPaused(false)
  }, [])

  const pauseTimer  = useCallback(() => setIsPaused(true),  [])
  const resumeTimer = useCallback(() => setIsPaused(false), [])

  const endSession = useCallback(async (canvasSnapshot?: unknown) => {
    if (!activeSession) return
    try {
      await api.interview.update(activeSession._id, {
        status:         'completed',
        timeElapsed:    elapsed,
        canvasSnapshot: canvasSnapshot ?? null,
      })
      await api.stats.sync(elapsed)

      const mins = Math.round(elapsed / 60)
      toast.success(`Session complete — ${mins} min practiced`, {
        action: { label: 'View history', onClick: () => { window.location.href = '/dashboard/sessions' } },
      })
    } catch {
      toast.error('Could not save session')
    } finally {
      setActiveSession(null)
      setElapsed(0)
      setIsPaused(false)
      setNotesOpen(false)
    }
  }, [activeSession, elapsed])

  return (
    <Ctx.Provider value={{
      activeSession, elapsed, isPaused, isNotesOpen,
      setElapsed, startSession, pauseTimer, resumeTimer, endSession, setNotesOpen,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useInterview() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useInterview must be used inside <InterviewProvider>')
  return ctx
}

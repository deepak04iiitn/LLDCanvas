'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInterview } from '@/contexts/InterviewContext'
import { api } from '@/lib/api'

const SYNC_INTERVAL_MS = 30_000  // sync elapsed time to backend every 30 s

export function useInterviewTimer() {
  const { activeSession, elapsed, setElapsed, isPaused } = useInterview()
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // 1-second tick
  useEffect(() => {
    if (!activeSession || isPaused) {
      if (tickTimer.current) clearInterval(tickTimer.current)
      tickTimer.current = null
      return
    }
    tickTimer.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (tickTimer.current) clearInterval(tickTimer.current) }
  }, [activeSession, isPaused, setElapsed])

  // Background sync every 30 s
  useEffect(() => {
    if (!activeSession || isPaused) {
      if (syncTimer.current) clearInterval(syncTimer.current)
      syncTimer.current = null
      return
    }
    syncTimer.current = setInterval(() => {
      api.interview.update(activeSession._id, { timeElapsed: elapsed }).catch(() => {/* silent */})
    }, SYNC_INTERVAL_MS)
    return () => { if (syncTimer.current) clearInterval(syncTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, isPaused])

  // Sync on tab close / visibility change
  // Use a ref so the stable listener always reads the latest elapsed without
  // being recreated every second (which would cause listener accumulation).
  const elapsedRef   = useRef(elapsed)
  const sessionRef   = useRef(activeSession)
  useEffect(() => { elapsedRef.current = elapsed },       [elapsed])
  useEffect(() => { sessionRef.current = activeSession }, [activeSession])

  useEffect(() => {
    function onBeforeUnload() {
      if (!sessionRef.current) return
      api.interview.update(sessionRef.current._id, { timeElapsed: elapsedRef.current }).catch(() => {})
    }
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden' && sessionRef.current) {
        api.interview.update(sessionRef.current._id, { timeElapsed: elapsedRef.current }).catch(() => {})
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  // Empty deps — registered once on mount, refs keep values current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

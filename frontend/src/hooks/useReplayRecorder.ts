'use client'

import { useCallback, useEffect, useRef } from 'react'
import { artifactApi } from '@/lib/artifact-api'

export type ReplayEventType =
  | 'add_node'
  | 'remove_node'
  | 'add_edge'
  | 'remove_edge'
  | 'update_element'

export interface ReplayEventInput {
  type: ReplayEventType | string
  payload?: Record<string, unknown>
  t?: number
}

const MONGO_ID_RE = /^[a-f\d]{24}$/i

function isPersistableDiagramId(diagramId: string | null | undefined): diagramId is string {
  if (!diagramId || diagramId === 'local') return false
  return MONGO_ID_RE.test(diagramId)
}

/**
 * Buffers semantic design-replay events and flushes to
 * `POST /artifacts/:id/replay/events` when diagramId is a real Mongo id.
 * Soft-fails on API errors so the editor never breaks.
 */
export function useReplayRecorder(diagramId: string | null | undefined) {
  const buffer = useRef<ReplayEventInput[]>([])
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startMs = useRef(Date.now())
  const diagramIdRef = useRef(diagramId)
  diagramIdRef.current = diagramId

  const flush = useCallback(async () => {
    const id = diagramIdRef.current
    if (!isPersistableDiagramId(id)) {
      buffer.current = []
      return
    }
    const batch = buffer.current.splice(0, buffer.current.length)
    if (batch.length === 0) return

    const events = batch.map(ev => ({
      t: ev.t ?? Date.now() - startMs.current,
      type: ev.type,
      payload: ev.payload ?? {},
    }))

    try {
      await artifactApi.postReplayEvents(id, events)
    } catch {
      // Soft-fail — replay is best-effort and must not block editing.
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null
      void flush()
    }, 1500)
  }, [flush])

  const record = useCallback(
    (event: ReplayEventInput) => {
      if (!isPersistableDiagramId(diagramIdRef.current)) return
      buffer.current.push({
        ...event,
        t: event.t ?? Date.now() - startMs.current,
      })
      if (buffer.current.length >= 40) {
        if (flushTimer.current) {
          clearTimeout(flushTimer.current)
          flushTimer.current = null
        }
        void flush()
      } else {
        scheduleFlush()
      }
    },
    [flush, scheduleFlush],
  )

  // Flush on unmount / diagram change
  useEffect(() => {
    startMs.current = Date.now()
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current)
        flushTimer.current = null
      }
      void flush()
    }
  }, [diagramId, flush])

  // Periodic light flush while editing
  useEffect(() => {
    if (!isPersistableDiagramId(diagramId)) return
    const iv = setInterval(() => {
      if (buffer.current.length > 0) void flush()
    }, 8000)
    return () => clearInterval(iv)
  }, [diagramId, flush])

  return { record, flush }
}

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const HEARTBEAT_INTERVAL_MS = 30_000   // ping every 30 s
const VISITOR_ID_KEY        = 'lld_vid'
const SESSION_ID_KEY        = 'lld_sid'

function getOrCreate(storage: Storage, key: string): string {
  let id = storage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    storage.setItem(key, id)
  }
  return id
}

async function sendHeartbeat(payload: {
  sessionId: string
  visitorId: string
  userId: string | null
  page: string
  durationDelta: number
}) {
  try {
    await fetch(`${BASE}/analytics/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,  // survives tab close
    })
  } catch {
    // silently ignore — analytics must never break the app
  }
}

export function useAnalytics() {
  const pathname              = usePathname()
  const { data: session }     = useSession()
  const lastHeartbeatAt       = useRef<number>(Date.now())
  const sessionIdRef          = useRef<string | null>(null)
  const visitorIdRef          = useRef<string | null>(null)

  // Initialise IDs once on the client (storage not available during SSR)
  useEffect(() => {
    visitorIdRef.current = getOrCreate(localStorage,   VISITOR_ID_KEY)
    sessionIdRef.current = getOrCreate(sessionStorage, SESSION_ID_KEY)
  }, [])

  // Send heartbeat on page change + on a timer
  useEffect(() => {
    if (!sessionIdRef.current || !visitorIdRef.current) return

    const userId     = session?.user?.id ?? null
    const sessionId  = sessionIdRef.current
    const visitorId  = visitorIdRef.current

    // Immediate heartbeat on mount / page change
    const nowMs = Date.now()
    const delta = Math.round((nowMs - lastHeartbeatAt.current) / 1000)
    lastHeartbeatAt.current = nowMs
    sendHeartbeat({ sessionId, visitorId, userId, page: pathname, durationDelta: delta })

    // Recurring heartbeat
    const timer = setInterval(() => {
      const now2  = Date.now()
      const d     = Math.round((now2 - lastHeartbeatAt.current) / 1000)
      lastHeartbeatAt.current = now2
      sendHeartbeat({ sessionId, visitorId, userId, page: pathname, durationDelta: d })
    }, HEARTBEAT_INTERVAL_MS)

    // Flush on tab hide/close
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        const now3 = Date.now()
        const d3   = Math.round((now3 - lastHeartbeatAt.current) / 1000)
        lastHeartbeatAt.current = now3
        sendHeartbeat({ sessionId, visitorId, userId, page: pathname, durationDelta: d3 })
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [pathname, session?.user?.id])
}

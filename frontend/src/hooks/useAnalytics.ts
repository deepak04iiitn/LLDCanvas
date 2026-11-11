'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const MAX_DELTA_S           = 300      // cap per event: 5 min
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

// Sent as text/plain via sendBeacon: a "simple" CORS request, so the browser
// skips the OPTIONS preflight (one function invocation per event, not two)
// and the request survives tab close.
function sendHeartbeat(payload: {
  sessionId: string
  visitorId: string
  userId: string | null
  page: string
  durationDelta: number
}) {
  try {
    const body = JSON.stringify(payload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(`${BASE}/analytics/heartbeat`, new Blob([body], { type: 'text/plain' }))
      return
    }
    fetch(`${BASE}/analytics/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // silently ignore - analytics must never break the app
  }
}

// No recurring timer: one event per page change and one when the tab is
// hidden/closed. Session duration is the sum of the gaps between events.
export function useAnalytics() {
  const pathname              = usePathname()
  const { data: session }     = useSession()
  const lastHeartbeatAt       = useRef<number>(Date.now())
  const sessionIdRef          = useRef<string | null>(null)
  const visitorIdRef          = useRef<string | null>(null)

  useEffect(() => {
    visitorIdRef.current = getOrCreate(localStorage,   VISITOR_ID_KEY)
    sessionIdRef.current = getOrCreate(sessionStorage, SESSION_ID_KEY)
  }, [])

  useEffect(() => {
    if (!sessionIdRef.current || !visitorIdRef.current) return

    const userId    = session?.user?.id ?? null
    const sessionId = sessionIdRef.current
    const visitorId = visitorIdRef.current

    function send() {
      const now   = Date.now()
      // Cap so a tab left open overnight doesn't add hours of "active" time.
      const delta = Math.min(Math.round((now - lastHeartbeatAt.current) / 1000), MAX_DELTA_S)
      lastHeartbeatAt.current = now
      sendHeartbeat({ sessionId, visitorId, userId, page: pathname, durationDelta: delta })
    }

    // Page change / mount
    send()

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') send()
      else lastHeartbeatAt.current = Date.now() // don't count hidden time
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [pathname, session?.user?.id])
}

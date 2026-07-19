'use client'

import { useEffect } from 'react'
import { setAuthToken } from '@/lib/auth-token'

// After Google sign-in, the backend's /auth/bridge route appends the bearer
// token as a `bearer_token` query param on its final redirect (see
// AuthModal.handleGoogle) — the OAuth flow itself never passes through
// auth-client's fetch-based token capture, so this is the only place that
// token is ever available. Grab it here, store it, then scrub it from the
// visible URL.
export function OAuthTokenBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('bearer_token')
    if (!token) return

    setAuthToken(token)
    params.delete('bearer_token')
    const query = params.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', url)
  }, [])

  return null
}

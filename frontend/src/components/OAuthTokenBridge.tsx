'use client'

import { useState } from 'react'
import { setAuthToken } from '@/lib/auth-token'

// After Google sign-in, the backend's /auth/bridge route appends the bearer
// token as a `bearer_token` query param on its final redirect (see
// AuthModal.handleGoogle) — the OAuth flow itself never passes through
// auth-client's fetch-based token capture, so this is the only place that
// token is ever available.
//
// This MUST run during render, not inside a useEffect. useSession() (used by
// page-level auth guards) subscribes via useSyncExternalStore, which fires
// its underlying session fetch during React's commit phase — a phase that
// runs, for the whole tree, before any component's plain useEffect. A
// useEffect here would consistently lose that race: the guard fetches with
// no token yet, sees no session, and redirects away before the token is
// ever stored. A lazy useState initializer runs synchronously during this
// component's first render, which happens before any subscription/effect
// anywhere in the tree gets a chance to run.
export function OAuthTokenBridge() {
  useState(() => {
    if (typeof window === 'undefined') return null

    const params = new URLSearchParams(window.location.search)
    const token = params.get('bearer_token')
    if (!token) return null

    setAuthToken(token)
    params.delete('bearer_token')
    const query = params.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', url)
    return null
  })

  return null
}

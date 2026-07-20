'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirebaseAuth, googleProvider } from './firebase'
import { getAuthToken, setAuthToken, clearAuthToken } from './auth-token'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export interface SessionUser {
  id: string
  name: string
  email: string
  image?: string | null
  isAdmin: boolean
  blocked: boolean
  plan: string
}

interface AuthContextValue {
  user: SessionUser | null
  isPending: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(): Promise<SessionUser | null> {
  const token = getAuthToken()
  if (!token) return null
  try {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const body = await res.json()
    return body.user ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isPending, setIsPending] = useState(true)

  const refetch = useCallback(async () => {
    setIsPending(true)
    const u = await fetchMe()
    setUser(u)
    setIsPending(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = useMemo(() => ({ user, isPending, refetch }), [user, isPending, refetch])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Mirrors better-auth's useSession() shape ({ data: { user }, isPending }) so
// the many pages that already consumed it didn't need their session-checking
// logic rewritten — only the import path changed.
export function useSession(): { data: { user: SessionUser } | null; isPending: boolean } {
  const { user, isPending } = useAuth()
  // Memoized so the returned object keeps a stable identity across renders
  // where user/isPending haven't actually changed — several pages put this
  // return value straight into a useEffect dependency array (a pattern
  // carried over from better-auth's referentially-stable session store), and
  // a fresh object literal on every render would refire those effects
  // continuously instead of only when the session actually changes.
  return useMemo(() => ({ data: user ? { user } : null, isPending }), [user, isPending])
}

async function postJSON(path: string, body: unknown): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`)
  return data
}

export async function signUpWithEmail(params: { name: string; email: string; password: string }) {
  const result = await postJSON('/auth/signup', params)
  setAuthToken(result.token)
  return result
}

export async function signInWithEmail(params: { email: string; password: string }) {
  const result = await postJSON('/auth/login', params)
  setAuthToken(result.token)
  return result
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(getFirebaseAuth(), googleProvider)
  const idToken = await credential.user.getIdToken()
  const result = await postJSON('/auth/google', { idToken })
  setAuthToken(result.token)
  return result
}

export async function signOut(): Promise<void> {
  clearAuthToken()
  try {
    await firebaseSignOut(getFirebaseAuth())
  } catch {
    // Best-effort — our own token is already cleared regardless.
  }
}

// Hook version: clears token, wipes context user, and hard-redirects to home.
// Use this everywhere instead of calling signOut() directly so React state
// doesn't linger after the session ends.
export function useSignOut() {
  const { refetch } = useAuth()
  return async function doSignOut() {
    clearAuthToken()
    try { await firebaseSignOut(getFirebaseAuth()) } catch {}
    // Reset auth context so no page sees a stale user
    await refetch()
    // Hard redirect — clears all in-memory state
    window.location.href = '/'
  }
}

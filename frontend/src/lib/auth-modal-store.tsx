'use client'

import { createContext, useContext, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// AuthModalProvider — previously opened a modal dialog; now navigates to
// dedicated /sign-in or /sign-up pages so the flows have their own URLs.
// ---------------------------------------------------------------------------

interface AuthModalContextValue {
  openAuthModal: (redirectTo?: string, mode?: 'signin' | 'signup') => void
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openAuthModal: () => {},
})

export function useAuthModal() {
  return useContext(AuthModalContext)
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  function openAuthModal(redirectTo?: string, mode: 'signin' | 'signup' = 'signin') {
    // Build the target URL with an optional ?next= param so the auth page
    // knows where to redirect after successful authentication.
    let url = mode === 'signup' ? '/sign-up' : '/sign-in'
    if (redirectTo) url += `?next=${encodeURIComponent(redirectTo)}`

    // Use window.location so this works outside of React Router / Next.js
    // router context (e.g. in legacy event handlers).
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  )
}

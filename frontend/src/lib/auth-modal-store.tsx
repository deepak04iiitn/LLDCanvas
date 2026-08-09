'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { AuthModal } from '@/components/auth/AuthModal'

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
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  function openAuthModal(redirectTo?: string, authMode: 'signin' | 'signup' = 'signin') {
    if (redirectTo) sessionStorage.setItem('postLoginRedirect', redirectTo)
    setMode(authMode)
    setOpen(true)
  }

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} defaultMode={mode} />
    </AuthModalContext.Provider>
  )
}

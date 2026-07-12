'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { signIn, signUp } from '@/lib/auth-client'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ open, onOpenChange, defaultMode = 'signin' }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function reset() {
    setEmail('')
    setPassword('')
    setName('')
    setLoading(false)
    setGoogleLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      })
    } catch {
      toast.error('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!name) { toast.error('Name is required'); setLoading(false); return }
        await signUp.email({ email, password, name, callbackURL: '/dashboard' })
        toast.success('Account created! Redirecting…')
      } else {
        await signIn.email({ email, password, callbackURL: '/dashboard' })
        toast.success('Signed in!')
      }
      onOpenChange(false)
      reset()
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      toast.error(msg)
      setLoading(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
              {isSignup ? 'Create your account' : 'Sign in to LLDCanvas'}
            </DialogTitle>
          </DialogHeader>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 active:scale-[0.97] font-medium"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Spinner />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400 font-medium tracking-wide">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Input
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete={isSignup ? 'email' : 'username'}
              required
              className="h-11 bg-gray-50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              className="h-11 bg-gray-50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all"
            />

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150 font-medium mt-1"
              disabled={loading || googleLoading}
            >
              {loading ? <Spinner light /> : isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              onClick={() => setMode(isSignup ? 'signin' : 'signup')}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${light ? 'text-white' : 'text-gray-600'}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

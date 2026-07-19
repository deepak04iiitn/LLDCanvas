'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  // Re-sync `mode` when the caller passes a different defaultMode (e.g. the
  // page's "Sign in" vs "Get started" buttons) — adjusted during render, per
  // React's own guidance, rather than in a useEffect.
  const [prevDefaultMode, setPrevDefaultMode] = useState(defaultMode)
  if (defaultMode !== prevDefaultMode) {
    setPrevDefaultMode(defaultMode)
    setMode(defaultMode)
  }

  function reset() {
    setEmail(''); setPassword(''); setName('')
    setLoading(false); setGoogleLoading(false)
  }

  function handleGoogle() {
    setGoogleLoading(true)
    const postLoginRedirect = sessionStorage.getItem('postLoginRedirect')
    const redirectPath = postLoginRedirect ?? '/dashboard'
    if (postLoginRedirect) sessionStorage.removeItem('postLoginRedirect')
    // Deliberately NOT using authClient.signIn.social() — it does a
    // cross-origin fetch() first to mint Google's OAuth "state" cookie,
    // then redirects. That fetch response is cross-site (frontend calling
    // backend), so third-party cookie blocking silently drops the state
    // cookie, breaking the flow with "state_mismatch" on Google's callback.
    // A direct top-level navigation instead makes the state-minting request
    // itself same-origin to the backend — see backend `/auth/google/start`.
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    window.location.href = `${apiBase}/auth/google/start?redirect=${encodeURIComponent(redirectPath)}`
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
      onOpenChange(false); reset()
      // If the user was redirected here from a share link, send them back there
      const postLoginRedirect = sessionStorage.getItem('postLoginRedirect')
      if (postLoginRedirect) {
        sessionStorage.removeItem('postLoginRedirect')
        router.push(postLoginRedirect)
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="overflow-hidden rounded-md border border-hairline-strong bg-paper-elevated p-0 shadow-xl sm:max-w-[460px]">

        {/* ── Header — same class-box grammar as the landing page's CTA box ── */}
        <div className="px-6 pt-5 pb-4">
          <p className="font-mono text-[10px] text-gold italic">&laquo;{mode}&raquo;</p>
          <h2 className="mt-1 font-serif text-xl font-medium text-ink">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {isSignup
              ? 'Free in local mode. Sign up to sync across devices.'
              : 'Sign in to reach your saved diagrams.'}
          </p>
        </div>

        {/* ── Form body ────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-3 border-hairline-strong font-medium
                       transition-all duration-150 hover:border-ink-faint hover:bg-paper
                       active:scale-[0.97]"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-2.5">
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <LabeledInput
                    label="Full name"
                    type="text"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <LabeledInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete={isSignup ? 'email' : 'username'}
              placeholder="you@example.com"
              required
            />
            <LabeledInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
              required
            />

            <Button
              type="submit"
              className="mt-0.5 h-10 w-full bg-brand font-medium text-brand-foreground
                         transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
              disabled={loading || googleLoading}
            >
              {loading ? <Spinner light /> : isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* ── Footer — mode toggle ─────────────────────────────────────────── */}
        <div className="border-t border-hairline bg-paper px-6 py-3 text-center text-sm text-ink-muted">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'signin' : 'signup')}
            className="font-medium text-brand transition-colors hover:text-brand-hover"
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── LabeledInput ────────────────────────────────────────────────────────────
function LabeledInput({
  label, type, value, onChange, placeholder, autoComplete, required,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="block font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-9 border-hairline-strong bg-paper text-sm transition-all
                   focus:border-brand focus:ring-brand/10"
      />
    </div>
  )
}

// ─── Google SVG icon ──────────────────────────────────────────────────────────
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

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg className={`h-4 w-4 animate-spin ${light ? 'text-white' : 'text-ink-muted'}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

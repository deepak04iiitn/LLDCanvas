'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Loader2, MapPin, ScanSearch, Gamepad2, Bug, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Wordmark } from '@/components/Brand'
import { signInWithEmail, signInWithGoogle, useAuth } from '@/lib/auth'

// ─── Features shown on the left panel ────────────────────────────────────────

const HIGHLIGHTS: { Icon: LucideIcon; label: string; text: string }[] = [
  { Icon: MapPin,     label: 'Plannr',         text: 'Structured learning roadmap for LLD mastery' },
  { Icon: ScanSearch, label: 'Detective Mode', text: 'Diagnose broken systems — find the design flaw' },
  { Icon: Gamepad2,   label: 'Roguelike',      text: 'Procedural LLD challenges — new puzzle every run' },
  { Icon: Bug,        label: 'Debugger Lab',   text: 'Debug real-world design mistakes, get explanations' },
]

// ─── Inner form — must be wrapped in Suspense because of useSearchParams ─────

function SignInForm() {
  const router      = useRouter()
  const params      = useSearchParams()
  const { refetch } = useAuth()

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,        setErrors]        = useState<{ email?: string; password?: string }>({})

  // Where to go after successful login
  function getRedirect() {
    const next = params.get('next')
    if (next && next.startsWith('/')) return next
    // Legacy: sessionStorage set by older code paths
    const stored = sessionStorage.getItem('postLoginRedirect')
    if (stored) { sessionStorage.removeItem('postLoginRedirect'); return stored }
    return '/dashboard'
  }

  function validate() {
    const e: typeof errors = {}
    if (!email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      await refetch()
      toast.success('Signed in!')
      router.replace(getRedirect())
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        toast.error('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signInWithEmail({ email, password })
      await refetch()
      toast.success('Welcome back!')
      router.replace(getRedirect())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed. Check your credentials.')
      setErrors({ password: 'Invalid email or password' })
      setLoading(false)
    }
  }

  const signUpHref = params.get('next')
    ? `/sign-up?next=${encodeURIComponent(params.get('next')!)}`
    : '/sign-up'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-hairline-strong bg-paper font-medium text-sm text-ink transition-all hover:border-ink-faint hover:bg-hairline/40 active:scale-[0.98] disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">or</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
          autoComplete="username"
          placeholder="you@example.com"
          className={`h-10 w-full rounded-lg border bg-paper px-3 text-sm text-ink placeholder:text-ink-faint/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand/30 ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-hairline-strong focus:border-brand'}`}
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500">{errors.email}</motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`h-10 w-full rounded-lg border bg-paper px-3 pr-10 text-sm text-ink placeholder:text-ink-faint/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand/30 ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-hairline-strong focus:border-brand'}`}
          />
          <button
            type="button" tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500">{errors.password}</motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || googleLoading}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-sm text-brand-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
      </button>

      {/* Toggle */}
      <p className="text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href={signUpHref} className="font-semibold text-brand hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-paper">

      {/* ── Left panel — matches the site's warm paper + dot-grid theme ──── */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col justify-between bg-[#FBF9F4] px-12 py-10 overflow-hidden border-r border-hairline">

        {/* Dot-grid backdrop — same as the landing page CanvasBackdrop */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern id="signin-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#A69F8C" fillOpacity="0.28" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signin-grid)" />
        </svg>

        {/* Brand tint wash — top-right corner */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/6 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Wordmark height={40} priority />
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-7">
          {/* Eyebrow */}
          {/* Heading */}
          <div>
            <h2 className="font-serif text-[2rem] font-medium leading-tight text-ink">
              Crack LLD Interviews<br />Like Never Before
            </h2>
          </div>

          {/* Feature list — site's hairline-bordered style */}
          <ul className="space-y-0 divide-y divide-hairline rounded-xl border border-hairline bg-paper-elevated shadow-sm">
            {HIGHLIGHTS.map((h, i) => (
              <li key={h.label} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'rounded-t-xl' : ''} ${i === HIGHLIGHTS.length - 1 ? 'rounded-b-xl' : ''}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-tint">
                  <h.Icon className="h-3.5 w-3.5 text-brand" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{h.label}</p>
                  <p className="text-[11px] text-ink-faint">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="font-mono text-[10px] text-ink-faint/70">
            + Design Studio, Interview Mode, Quiz &amp; many more
          </p>
        </div>

      </div>

      {/* ── Right form panel ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/"><Wordmark height={36} priority /></Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Back link */}
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mt-1.5 font-serif text-2xl font-medium text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-muted">Sign in to access all the features.</p>
          </div>

          {/* Form */}
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-ink-faint" /></div>}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// ─── Google SVG ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9  3.58Z" fill="#EA4335"/>
    </svg>
  )
}

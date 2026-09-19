'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { invalidatePlan, usePlan } from '@/hooks/usePlan'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

const POLL_MS = 1200
const MAX_ATTEMPTS = 25

function PricingSuccessInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { plan, refresh } = usePlan()
  const [status, setStatus] = useState<'polling' | 'success' | 'timeout'>('polling')
  const [attempts, setAttempts] = useState(0)

  const dodoActive = searchParams.get('status') === 'active'

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function goDashboard() {
      invalidatePlan()
      try { await refresh() } catch { /* ignore */ }
      window.location.href = '/dashboard?upgraded=1'
    }

    // Dodo already confirmed active in the return URL — unlock ASAP
    if (dodoActive) {
      setStatus('success')
      timer = setTimeout(() => {
        if (!cancelled) void goDashboard()
      }, 600)
      return () => {
        cancelled = true
        if (timer) clearTimeout(timer)
      }
    }

    async function poll(n: number) {
      if (cancelled) return
      setAttempts(n)
      try {
        invalidatePlan()
        await refresh()
        const latest = await api.billing.plan()
        if (latest.plan === 'pro' || latest.plan === 'ultimate') {
          setStatus('success')
          timer = setTimeout(() => {
            if (!cancelled) window.location.href = '/dashboard?upgraded=1'
          }, 800)
          return
        }
      } catch { /* keep polling */ }

      if (n >= MAX_ATTEMPTS) {
        setStatus('timeout')
        return
      }
      timer = setTimeout(() => poll(n + 1), POLL_MS)
    }

    poll(1)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [dodoActive, refresh])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNavbar />
      <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
        {status === 'polling' && (
          <>
            <Loader2 className="mb-5 h-10 w-10 animate-spin text-brand" />
            <h1 className="mb-2 font-serif text-2xl font-medium">Activating your plan…</h1>
            <p className="text-sm text-ink-muted">
              Confirming payment. This usually takes a few seconds.
            </p>
            <p className="mt-3 font-mono text-[11px] text-ink-faint">
              Check {attempts}/{MAX_ATTEMPTS}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mb-5 h-10 w-10 text-brand" />
            <h1 className="mb-2 font-serif text-2xl font-medium">You&rsquo;re upgraded!</h1>
            <p className="text-sm text-ink-muted">
              {plan !== 'free' ? (
                <>Your <span className="capitalize font-medium text-ink">{plan}</span> plan is active. </>
              ) : null}
              Redirecting to the dashboard…
            </p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <AlertCircle className="mb-5 h-10 w-10 text-amber-500" />
            <h1 className="mb-2 font-serif text-2xl font-medium">Still confirming payment</h1>
            <p className="mb-6 text-sm text-ink-muted">
              Payment may still be processing. Open the dashboard or Settings to check your plan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard?upgraded=1')}
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
              >
                Go to Dashboard
              </button>
              <Link
                href="/settings"
                className="rounded-md border border-hairline bg-paper px-4 py-2 text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default function PricingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <PricingSuccessInner />
    </Suspense>
  )
}

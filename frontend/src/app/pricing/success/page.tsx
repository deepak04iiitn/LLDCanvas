'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

const POLL_MS = 1500
const MAX_ATTEMPTS = 20

export default function PricingSuccessPage() {
  const router = useRouter()
  const { plan, refresh } = usePlan()
  const [status, setStatus] = useState<'polling' | 'success' | 'timeout'>('polling')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function poll(n: number) {
      if (cancelled) return
      setAttempts(n)
      try {
        await refresh()
        const latest = await api.billing.plan()
        if (latest.plan === 'pro' || latest.plan === 'ultimate') {
          setStatus('success')
          timer = setTimeout(() => {
            window.location.href = '/dashboard?upgraded=1'
          }, 1200)
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
  }, [refresh])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNavbar />
      <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
        {status === 'polling' && (
          <>
            <Loader2 className="mb-5 h-10 w-10 animate-spin text-brand" />
            <h1 className="mb-2 font-serif text-2xl font-medium">Activating your plan…</h1>
            <p className="text-sm text-ink-muted">
              Confirming payment with our billing provider. This usually takes a few seconds.
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
              Your <span className="capitalize font-medium text-ink">{plan}</span> plan is active. Redirecting to the dashboard…
            </p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <AlertCircle className="mb-5 h-10 w-10 text-amber-500" />
            <h1 className="mb-2 font-serif text-2xl font-medium">Still confirming payment</h1>
            <p className="mb-6 text-sm text-ink-muted">
              Payment may still be processing. Refresh this page in a minute, or open Settings to check your plan.
              If you were charged but access isn&rsquo;t unlocked, email support.lldcanvas@gmail.com.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.refresh()}
                className="rounded-md border border-hairline bg-paper px-4 py-2 text-sm font-medium hover:bg-paper-elevated"
              >
                Refresh
              </button>
              <Link
                href="/settings"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
              >
                Go to Settings
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

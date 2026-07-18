'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Sparkles, Crown, Zap, ArrowRight,
  Code2, Users, BookOpen, BarChart3, Terminal,
  Clock, Lock, Infinity as InfinityIcon, Star,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (opts: Record<string, unknown>) => { open(): void }
  }
}

// ── Pricing data ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    id:          'free' as const,
    name:        'Free',
    icon:        Zap,
    iconCls:     'text-ink-muted',
    badgeCls:    'bg-paper-elevated border-hairline text-ink-muted',
    btnCls:      'border border-hairline bg-paper text-ink hover:bg-paper-elevated',
    priceINR:    { monthly: 0, yearly: 0 },
    priceUSD:    { monthly: 0, yearly: 0 },
    tagline:     'Perfect for exploring LLD concepts',
    highlight:   false,
  },
  {
    id:          'pro' as const,
    name:        'Pro',
    icon:        Sparkles,
    iconCls:     'text-brand',
    badgeCls:    'bg-brand text-white shadow-md shadow-brand/30',
    btnCls:      'bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/30',
    priceINR:    { monthly: 199,  yearly: 1999  },
    priceUSD:    { monthly: 5.99, yearly: 59.99 },
    tagline:     'For serious engineers leveling up',
    highlight:   true,
  },
  {
    id:          'ultimate' as const,
    name:        'Ultimate',
    icon:        Crown,
    iconCls:     'text-amber-500',
    badgeCls:    'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30',
    btnCls:      'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-amber-500/30',
    priceINR:    { monthly: 299,  yearly: 2999  },
    priceUSD:    { monthly: 9.99, yearly: 99.99 },
    tagline:     'For teams and power users',
    highlight:   false,
  },
]

type FeatureRow = {
  label:    string
  icon:     React.ElementType
  free:     string | boolean
  pro:      string | boolean
  ultimate: string | boolean
  highlight?: boolean
}

const FEATURES: FeatureRow[] = [
  { label: 'UML Canvas',               icon: Code2,       free: 'Unlimited',   pro: 'Unlimited',   ultimate: 'Unlimited',  highlight: false },
  { label: 'Playground',               icon: Terminal,    free: 'Unlimited',   pro: 'Unlimited',   ultimate: 'Unlimited',  highlight: false },
  { label: 'Draft Notation',           icon: Code2,       free: true,          pro: true,           ultimate: true,         highlight: false },
  { label: 'Design Pattern Templates', icon: BookOpen,    free: '5 templates', pro: 'Full access',  ultimate: 'Full access', highlight: false },
  { label: 'Export',                   icon: ArrowRight,  free: false,         pro: 'PlantUML, Mermaid, Draft', ultimate: 'Full access', highlight: false },
  { label: 'Import',                   icon: ArrowRight,  free: true,          pro: true,           ultimate: true,         highlight: false },
  { label: 'Practice Problems',        icon: Code2,       free: 'Easy + Medium', pro: 'Full access', ultimate: 'Full access', highlight: false },
  { label: 'Hints',                    icon: Zap,         free: false,         pro: true,           ultimate: true,         highlight: false },
  { label: 'Community Discussion',     icon: Users,       free: false,         pro: true,           ultimate: true,         highlight: false },
  { label: 'Code Executions / day',    icon: Terminal,    free: '15',          pro: '25',           ultimate: '50',          highlight: true  },
  { label: 'Revision Notes',           icon: BookOpen,    free: true,          pro: true,           ultimate: true,         highlight: false },
  { label: 'Bookmarks',                icon: Star,        free: false,         pro: true,           ultimate: true,         highlight: false },
  { label: 'Interview Mode',           icon: Clock,       free: false,         pro: '10 sessions/mo', ultimate: 'Unlimited', highlight: false },
  { label: 'Collaboration',            icon: Users,       free: false,         pro: 'Up to 3',      ultimate: 'Unlimited',  highlight: true  },
  { label: 'Activity Timeline',        icon: BarChart3,   free: false,         pro: false,          ultimate: true,         highlight: false },
  { label: 'Version History',          icon: Clock,       free: false,         pro: false,          ultimate: true,         highlight: false },
  { label: 'Analytics',                icon: BarChart3,   free: false,         pro: 'Basic',        ultimate: 'Full',        highlight: false },
  { label: 'Priority Support',         icon: Zap,         free: false,         pro: false,          ultimate: true,         highlight: false },
  { label: 'Beta Features',            icon: Sparkles,    free: false,         pro: false,          ultimate: true,         highlight: false },
]

function FeatureValue({ val }: { val: string | boolean }) {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-brand" />
  if (val === false) return <X     className="mx-auto h-4 w-4 text-ink-faint" />
  return <span className="text-xs font-medium text-ink">{val}</span>
}

function PlanCard({
  plan,
  yearly,
  currency,
  current,
  onUpgrade,
  loading,
}: {
  plan: typeof PLANS[number]
  yearly: boolean
  currency: 'INR' | 'USD'
  current: string
  onUpgrade: (tier: 'pro' | 'ultimate', yearly: boolean) => void
  loading: boolean
}) {
  const price = currency === 'INR' ? plan.priceINR : plan.priceUSD
  const amount = yearly ? price.yearly : price.monthly
  const symbol = currency === 'INR' ? '₹' : '$'
  const isCurrentPlan = current === plan.id
  const isFree = plan.id === 'free'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-shadow',
        plan.highlight
          ? 'border-brand/50 bg-brand/5 shadow-xl shadow-brand/10 ring-1 ring-brand/20'
          : 'border-hairline bg-paper',
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-md">
            Most popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', plan.highlight ? 'border-brand/20 bg-brand/10' : 'border-hairline bg-paper-elevated')}>
          <plan.icon className={cn('h-4 w-4', plan.iconCls)} />
        </div>
        <div>
          <p className="font-semibold text-ink">{plan.name}</p>
          <p className="text-xs text-ink-muted">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        {isFree ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-ink">Free</span>
            <span className="mb-1.5 text-sm text-ink-muted">forever</span>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-sm font-medium text-ink-muted">{symbol}</span>
            <span className="text-4xl font-bold text-ink">{amount}</span>
            <span className="mb-1.5 text-sm text-ink-muted">/ {yearly ? 'year' : 'month'}</span>
          </div>
        )}
        {!isFree && yearly && (
          <p className="mt-1 text-xs text-brand">
            Save {currency === 'INR' ? '₹' : '$'}{(((yearly ? price.monthly * 12 : price.monthly * 12) - price.yearly)).toFixed(0)} vs monthly
          </p>
        )}
      </div>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center rounded-xl border border-hairline bg-paper-elevated py-2.5 text-sm font-medium text-ink-muted">
          Current plan
        </div>
      ) : isFree ? (
        current !== 'free' ? (
          <div className="flex items-center justify-center rounded-xl border border-hairline py-2.5 text-sm font-medium text-ink-muted">
            Downgrade via cancel
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-hairline bg-paper-elevated py-2.5 text-sm font-medium text-ink-muted">
            Get started free
          </div>
        )
      ) : (
        <button
          disabled={loading}
          onClick={() => onUpgrade(plan.id as 'pro' | 'ultimate', yearly)}
          className={cn('flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all', plan.btnCls, loading && 'opacity-60 cursor-not-allowed')}
        >
          {loading ? 'Loading...' : `Upgrade to ${plan.name}`}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      )}
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [yearly,   setYearly]   = useState(false)
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
  const [subLoading, setSubLoading] = useState(false)
  const { plan: currentPlan, loading: planLoading, refresh } = usePlan()

  // Detect currency from IP on mount
  useEffect(() => {
    api.billing.geo().then(r => setCurrency(r.currency)).catch(() => {})
  }, [])

  // Load Razorpay checkout script
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  async function handleUpgrade(tier: 'pro' | 'ultimate', isYearly: boolean) {
    setSubLoading(true)
    try {
      const { subscriptionId, keyId, userName, userEmail } = await api.billing.subscribe({ tier, yearly: isYearly })

      const options = {
        key:             keyId,
        subscription_id: subscriptionId,
        name:            'LLDCanvas',
        description:     `${tier === 'pro' ? 'Pro' : 'Ultimate'} - ${isYearly ? 'Yearly' : 'Monthly'}`,
        image:           '/logo.png',
        prefill: { name: userName, email: userEmail },
        theme: { color: '#5B5BD6' },
        handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          try {
            await api.billing.verify(response)
            refresh()
            window.location.href = '/dashboard?upgraded=1'
          } catch {
            alert('Payment verification failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => setSubLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert((err as Error).message ?? 'Something went wrong')
      setSubLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNavbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" /> Simple, transparent pricing
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mx-auto max-w-xl text-base text-ink-muted">
            Start free. Upgrade when you need more power. Cancel anytime.
          </p>
        </motion.div>

        {/* Toggles */}
        <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Billing toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition-colors', !yearly ? 'bg-paper shadow-sm text-ink' : 'text-ink-muted hover:text-ink')}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn('flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors', yearly ? 'bg-paper shadow-sm text-ink' : 'text-ink-muted hover:text-ink')}
            >
              Yearly
              <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand">Save ~17%</span>
            </button>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated p-1">
            <button
              onClick={() => setCurrency('INR')}
              className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition-colors', currency === 'INR' ? 'bg-paper shadow-sm text-ink' : 'text-ink-muted hover:text-ink')}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition-colors', currency === 'USD' ? 'bg-paper shadow-sm text-ink' : 'text-ink-muted hover:text-ink')}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              currency={currency}
              current={planLoading ? '' : currentPlan}
              onUpgrade={handleUpgrade}
              loading={subLoading}
            />
          ))}
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl border border-hairline bg-paper overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-0 border-b border-hairline bg-paper-elevated">
            <div className="p-4 text-sm font-semibold text-ink-muted">Feature</div>
            {PLANS.map(p => (
              <div key={p.id} className="border-l border-hairline p-4 text-center">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', p.badgeCls)}>
                  <p.icon className="h-3 w-3" />
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {/* Table rows */}
          {FEATURES.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                'grid grid-cols-4 gap-0',
                i < FEATURES.length - 1 && 'border-b border-hairline',
                row.highlight && 'bg-brand/3',
              )}
            >
              <div className="flex items-center gap-2 p-4">
                <row.icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                <span className={cn('text-sm', row.highlight ? 'font-medium text-ink' : 'text-ink-muted')}>{row.label}</span>
              </div>
              {(['free', 'pro', 'ultimate'] as const).map(planId => (
                <div key={planId} className="flex items-center justify-center border-l border-hairline p-4 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div key={String(row[planId])} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <FeatureValue val={row[planId]} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer notes */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-ink-muted">
          <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure payments via Razorpay</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4" /> Cancel anytime</div>
          <div className="flex items-center gap-2"><InfinityIcon className="h-4 w-4" /> Free tier stays free forever</div>
        </div>

        {/* Cancel note */}
        {currentPlan !== 'free' && (
          <p className="mt-6 text-center text-sm text-ink-muted">
            Want to cancel your subscription?{' '}
            <Link href="/settings" className="text-brand underline underline-offset-2 hover:text-brand/80">
              Visit Settings
            </Link>
          </p>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

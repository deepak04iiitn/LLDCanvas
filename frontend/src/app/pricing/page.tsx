'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Rocket, Crown, Zap, ArrowRight,
  Code2, Users, BookOpen, BarChart3, Terminal,
  Clock, Lock, Infinity as InfinityIcon, Star, FlaskConical,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { Eyebrow } from '@/components/marketing/Eyebrow'
import { InternationalUpgradeModal } from '@/components/pricing/InternationalUpgradeModal'
import { fadeUpProps, inViewProps } from '@/lib/motion'

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
    badgeCls:    'bg-paper-elevated border border-hairline-strong text-ink-muted',
    btnCls:      'border border-hairline-strong bg-paper text-ink hover:bg-hairline/30',
    priceINR:    { monthly: 0, yearly: 0 },
    priceUSD:    { monthly: 0, yearly: 0 },
    tagline:     'Perfect for exploring LLD concepts',
    highlight:   false,
    features: [
      'Unlimited UML canvas & playground',
      '10 design pattern templates',
      'Easy problems + a few Medium problems',
      '15 code executions / day',
      'Revision notes',
    ],
  },
  {
    id:          'pro' as const,
    name:        'Pro',
    icon:        Rocket,
    iconCls:     'text-brand',
    badgeCls:    'bg-brand text-brand-foreground',
    btnCls:      'bg-brand text-brand-foreground hover:bg-brand-hover',
    priceINR:    { monthly: 199,  yearly: 1999  },
    priceUSD:    { monthly: 6, yearly: 60 },
    tagline:     'For serious engineers leveling up',
    highlight:   true,
    features: [
      'Everything in Free',
      'Full templates & practice problems',
      'Staged hints + community discussion',
      '25 code executions / day',
      '10 interview mode sessions / mo',
      'Collaboration — up to 3 people',
    ],
  },
  {
    id:          'ultimate' as const,
    name:        'Ultimate',
    icon:        Crown,
    iconCls:     'text-amber-600',
    badgeCls:    'bg-amber-500 text-white',
    btnCls:      'bg-amber-500 text-white hover:bg-amber-600',
    priceINR:    { monthly: 299,  yearly: 2999  },
    priceUSD:    { monthly: 10, yearly: 100 },
    tagline:     'For teams and power users',
    highlight:   false,
    features: [
      'Everything in Pro',
      'Unlimited interview mode sessions',
      'Unlimited collaboration',
      'Version history + activity timeline',
      'Full analytics & priority support',
      '50 code executions / day',
    ],
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
  { label: 'Design Pattern Templates', icon: BookOpen,    free: '10 templates', pro: 'Full access',  ultimate: 'Full access', highlight: false },
  { label: 'Export',                   icon: ArrowRight,  free: false,         pro: 'PlantUML, Mermaid, Draft', ultimate: 'Full access', highlight: false },
  { label: 'Import',                   icon: ArrowRight,  free: true,          pro: true,           ultimate: true,         highlight: false },
  { label: 'Practice Problems',        icon: Code2,       free: 'Easy + a few Medium', pro: 'Full access', ultimate: 'Full access', highlight: false },
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
  { label: 'Beta Features',            icon: FlaskConical, free: false,        pro: false,          ultimate: true,         highlight: false },
]

function FeatureValue({ val }: { val: string | boolean }) {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-brand" />
  if (val === false) return <X     className="mx-auto h-4 w-4 text-ink-faint/60" />
  return <span className="text-xs font-medium text-ink">{val}</span>
}

function PlanCard({
  plan,
  yearly,
  currency,
  current,
  onUpgrade,
  loading,
  delay,
}: {
  plan: typeof PLANS[number]
  yearly: boolean
  currency: 'INR' | 'USD'
  current: string
  onUpgrade: (tier: 'pro' | 'ultimate', yearly: boolean) => void
  loading: boolean
  delay: number
}) {
  const price = currency === 'INR' ? plan.priceINR : plan.priceUSD
  const amount = yearly ? price.yearly : price.monthly
  const symbol = currency === 'INR' ? '₹' : '$'
  const isCurrentPlan = current === plan.id
  const isFree = plan.id === 'free'

  return (
    <motion.div
      {...inViewProps(delay)}
      className={cn(
        'relative flex h-full flex-col rounded-md border p-6 transition-all duration-200',
        plan.highlight
          ? 'border-brand/40 bg-brand-tint/40 shadow-md'
          : 'border-hairline bg-paper-elevated hover:border-hairline-strong',
      )}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', plan.highlight ? 'border-brand/25 bg-brand/10' : 'border-hairline bg-paper')}>
            <plan.icon className={cn('h-4 w-4', plan.iconCls)} />
          </div>
          <div>
            <p className="font-serif text-lg font-medium text-ink">{plan.name}</p>
            <p className="text-xs text-ink-muted">{plan.tagline}</p>
          </div>
        </div>
        {plan.highlight && (
          <span className="font-mono text-[9px] font-semibold tracking-widest text-gold uppercase">
            Popular
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-6 border-t border-hairline pt-5">
        {isFree ? (
          <div className="flex items-end gap-1">
            <span className="font-mono text-4xl font-medium text-ink">Free</span>
            <span className="mb-1.5 text-sm text-ink-muted">forever</span>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-sm font-medium text-ink-muted">{symbol}</span>
            <span className="font-mono text-4xl font-medium text-ink">{amount}</span>
            <span className="mb-1.5 text-sm text-ink-muted">/ {yearly ? 'year' : 'month'}</span>
          </div>
        )}
        {!isFree && yearly && (
          <p className="mt-1.5 font-mono text-xs text-brand">
            Save {currency === 'INR' ? '₹' : '$'}{((price.monthly * 12) - price.yearly).toFixed(0)} vs monthly
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
            <Check className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', plan.highlight ? 'text-brand' : 'text-ink-faint')} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center rounded-md border border-hairline bg-paper py-2.5 text-sm font-medium text-ink-muted">
          Current plan
        </div>
      ) : isFree ? (
        current !== 'free' ? (
          <div className="flex items-center justify-center rounded-md border border-hairline py-2.5 text-sm font-medium text-ink-muted">
            Downgrade via cancel
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-hairline bg-paper py-2.5 text-sm font-medium text-ink-muted">
            Get started free
          </div>
        )
      ) : (
        <button
          disabled={loading}
          onClick={() => onUpgrade(plan.id as 'pro' | 'ultimate', yearly)}
          className={cn('flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all', plan.btnCls, loading && 'cursor-not-allowed opacity-60')}
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
  const [loadingTier, setLoadingTier] = useState<'pro' | 'ultimate' | null>(null)
  const [intlModal, setIntlModal] = useState<{ open: boolean; planName: string }>({ open: false, planName: '' })
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
    if (currency === 'USD') {
      const plan = PLANS.find(p => p.id === tier)
      setIntlModal({ open: true, planName: plan?.name ?? tier })
      return
    }

    setLoadingTier(tier)
    try {
      const { subscriptionId, keyId, userName, userEmail } = await api.billing.subscribe({ tier, yearly: isYearly })

      const options = {
        key:             keyId,
        subscription_id: subscriptionId,
        name:            'LLDCanvas',
        description:     `${tier === 'pro' ? 'Pro' : 'Ultimate'} - ${isYearly ? 'Yearly' : 'Monthly'}`,
        image:           '/logo.png',
        prefill: { name: userName, email: userEmail },
        theme: { color: '#234E3F' },
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
          ondismiss: () => setLoadingTier(null),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert((err as Error).message ?? 'Something went wrong')
      setLoadingTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNavbar />

      <main className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8">

        {/* Hero */}
        <div className="mb-14 text-center">
          <motion.div {...fadeUpProps(0)} className="flex justify-center">
            <Eyebrow index="01">pricing</Eyebrow>
          </motion.div>
          <motion.h1 {...fadeUpProps(0.06)} className="mb-4 font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Practice more. Pay for what you use.
          </motion.h1>
          <motion.p {...fadeUpProps(0.12)} className="mx-auto max-w-xl text-base leading-relaxed text-ink-muted">
            Start free, forever — upgrade only when the editor, the problems, or the practice
            history genuinely aren't enough. Cancel anytime.
          </motion.p>
        </div>

        {/* Toggles */}
        <motion.div {...fadeUpProps(0.16)} className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/* Billing toggle */}
          <div className="flex items-center gap-1 rounded-md border border-hairline bg-paper-elevated p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn('rounded px-4 py-1.5 text-sm font-medium transition-colors', !yearly ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn('flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition-colors', yearly ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}
            >
              Yearly
              <span className="rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand">Save ~17%</span>
            </button>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-1 rounded-md border border-hairline bg-paper-elevated p-1">
            <button
              onClick={() => setCurrency('INR')}
              className={cn('rounded px-4 py-1.5 text-sm font-medium transition-colors', currency === 'INR' ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={cn('rounded px-4 py-1.5 text-sm font-medium transition-colors', currency === 'USD' ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}
            >
              $ USD
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              currency={currency}
              current={planLoading ? '' : currentPlan}
              onUpgrade={handleUpgrade}
              loading={loadingTier === plan.id}
              delay={0.05 + i * 0.06}
            />
          ))}
        </div>

        {/* Comparison table */}
        <motion.div {...inViewProps(0)}>
          <Eyebrow index="02">compare in detail</Eyebrow>
          <h2 className="mb-6 max-w-lg font-serif text-2xl font-medium text-ink">
            Every feature, side by side.
          </h2>
        </motion.div>

        <div className="overflow-hidden rounded-md border border-hairline">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-0 border-b border-hairline bg-paper-elevated">
            <div className="p-4 font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">Feature</div>
            {PLANS.map(p => (
              <div key={p.id} className="border-l border-hairline p-4 text-center">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', p.badgeCls)}>
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
                row.highlight && 'bg-brand-tint/30',
              )}
            >
              <div className="flex items-center gap-2 p-4">
                <row.icon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
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
        <div className="mt-10 flex flex-wrap justify-center gap-8 font-mono text-xs text-ink-faint">
          <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Secure payments via Razorpay</div>
          <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Cancel anytime</div>
          <div className="flex items-center gap-2"><InfinityIcon className="h-3.5 w-3.5" /> Free tier stays free forever</div>
        </div>

        {/* Cancel note */}
        {currentPlan !== 'free' && (
          <p className="mt-6 text-center text-sm text-ink-muted">
            Want to cancel your subscription?{' '}
            <Link href="/settings" className="text-brand underline underline-offset-2 hover:text-brand-hover">
              Visit Settings
            </Link>
          </p>
        )}
      </main>

      <SiteFooter />

      <InternationalUpgradeModal
        open={intlModal.open}
        onOpenChange={(o) => setIntlModal(s => ({ ...s, open: o }))}
        planName={intlModal.planName}
      />
    </div>
  )
}

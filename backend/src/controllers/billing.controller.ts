import { Request, Response, NextFunction } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import DodoPayments from 'dodopayments'
import type { CountryCode, Currency } from 'dodopayments/resources/misc'
import { Subscription } from '../models/subscription.model'
import { RevenueEvent } from '../models/revenue-event.model'
import { User } from '../models/user.model'
import {
  getLimits,
  getRazorpayPlanId,
  getDodoProductId,
  planFromDodoProductId,
  PRICING,
} from '../config/plans'
import { DODO_CURRENCIES, currencyForCountry, isDodoCurrency } from '../config/dodo-currencies'
import { createError } from '../middleware/error'

// ── Razorpay client (singleton) ───────────────────────────────────────────────
let _rzp: Razorpay | null = null
function rzp(): Razorpay {
  if (!_rzp) {
    _rzp = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _rzp
}

// ── Dodo client (singleton) ───────────────────────────────────────────────────
let _dodo: DodoPayments | null = null
function dodo(): DodoPayments {
  if (!_dodo) {
    const env = process.env.DODO_PAYMENTS_ENV === 'live_mode' ? 'live_mode' : 'test_mode'
    _dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      webhookKey:  process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
      environment: env,
    })
  }
  return _dodo
}

function resolveGateway(country: string): 'razorpay' | 'dodo' {
  const override = process.env.BILLING_GATEWAY_OVERRIDE?.trim().toLowerCase()
  if (override === 'razorpay' || override === 'dodo') return override
  return country.toUpperCase() === 'IN' ? 'razorpay' : 'dodo'
}

async function cancelProviderSubscription(sub: {
  paymentSource?: string
  razorpaySubId: string
}, atPeriodEnd: boolean) {
  if (sub.paymentSource === 'manual') return
  if (sub.paymentSource === 'dodo') {
    await dodo().subscriptions.update(sub.razorpaySubId, {
      status: 'cancelled',
      cancel_at_next_billing_date: atPeriodEnd,
      cancel_reason: 'cancelled_by_customer',
    })
    return
  }
  await rzp().subscriptions.cancel(sub.razorpaySubId, atPeriodEnd)
}

// ── GET /billing/geo ───────────────────────────────────────────────────────────
export async function detectGeo(req: Request, res: Response) {
  try {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      ''

    const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip) ||
      ip.startsWith('192.168.') || ip.startsWith('10.')

    let country = 'IN'
    if (!isLocal) {
      const geoRes = await fetch(
        `https://ipinfo.io/${ip}/json${process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : ''}`,
      )
      const geo = await geoRes.json() as { country?: string }
      country = geo.country ?? 'US'
    }

    const gateway = resolveGateway(country)
    // When forcing Dodo locally, use US so checkout isn't India/Razorpay-flavoured
    if (gateway === 'dodo' && (isLocal || country === 'IN') && process.env.BILLING_GATEWAY_OVERRIDE?.trim().toLowerCase() === 'dodo') {
      country = 'US'
    }

    const currency = gateway === 'razorpay' ? 'INR' : currencyForCountry(country)

    res.json({
      country,
      currency,
      gateway,
      supportedCurrencies: gateway === 'dodo' ? DODO_CURRENCIES : ['INR'],
    })
  } catch {
    const gateway = resolveGateway('IN')
    const country = gateway === 'dodo' ? 'US' : 'IN'
    res.json({
      country,
      currency: gateway === 'razorpay' ? 'INR' : 'USD',
      gateway,
      supportedCurrencies: gateway === 'dodo' ? DODO_CURRENCIES : ['INR'],
    })
  }
}

// ── GET /billing/plan ──────────────────────────────────────────────────────────
export async function getMyPlan(req: Request, res: Response) {
  const userId = req.user!.id
  const plan = req.user!.plan

  const sub = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'authenticated', 'created', 'pending', 'on_hold'] },
  }).sort({ createdAt: -1 }).lean()

  res.json({
    plan,
    limits: getLimits(plan),
    subscription: sub ? {
      id:              sub._id,
      razorpaySubId:   sub.razorpaySubId,
      status:          sub.status,
      billingInterval: sub.billingInterval,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      paymentSource:   sub.paymentSource,
      currency:        sub.currency,
    } : null,
  })
}

// ── POST /billing/subscribe ────────────────────────────────────────────────────
export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const currentPlan = req.user!.plan
    const { tier, yearly } = req.body as { tier: 'pro' | 'ultimate'; yearly: boolean }

    if (!['pro', 'ultimate'].includes(tier)) {
      throw createError('Invalid plan tier', 400)
    }

    if (currentPlan === tier) {
      throw createError('You are already on this plan', 400)
    }

    const existingSub = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'authenticated'] },
    })
    if (existingSub) {
      try {
        await cancelProviderSubscription(existingSub, false)
        await Subscription.updateOne({ _id: existingSub._id }, { status: 'cancelled', cancelledAt: new Date() })
      } catch { /* non-fatal */ }
    }

    const planId = getRazorpayPlanId(tier, yearly)
    const user = await User.findById(userId).lean()

    const rzpSub = await rzp().subscriptions.create({
      plan_id:         planId,
      total_count:     yearly ? 12 : 120,
      quantity:        1,
      customer_notify: 1,
      notes: {
        userId,
        tier,
        billing: yearly ? 'yearly' : 'monthly',
        userEmail: user?.email ?? '',
      },
    })

    await Subscription.create({
      userId,
      plan:             tier,
      razorpaySubId:    rzpSub.id,
      razorpayCustomerId: '',
      status:           'created',
      billingInterval:  yearly ? 'yearly' : 'monthly',
      paymentSource:    'razorpay',
      currency:         'INR',
    })

    res.json({
      subscriptionId: rzpSub.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      userName: user?.name ?? '',
      userEmail: user?.email ?? '',
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/subscribe/dodo ───────────────────────────────────────────────
export async function createDodoSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      throw createError('International payments are not configured yet', 503)
    }

    const userId = req.user!.id
    const currentPlan = req.user!.plan
    const {
      tier,
      yearly,
      billingCurrency,
      country: bodyCountry,
    } = req.body as {
      tier: 'pro' | 'ultimate'
      yearly: boolean
      billingCurrency?: string
      country?: string
    }

    if (!['pro', 'ultimate'].includes(tier)) {
      throw createError('Invalid plan tier', 400)
    }
    if (currentPlan === tier) {
      throw createError('You are already on this plan', 400)
    }

    const productId = getDodoProductId(tier, yearly)
    if (!productId) {
      throw createError('Dodo product IDs are not configured', 503)
    }

    const country = (bodyCountry || 'US').toUpperCase().slice(0, 2)
    const currencyRaw = (billingCurrency || currencyForCountry(country)).toUpperCase()
    const billing_currency = (isDodoCurrency(currencyRaw) ? currencyRaw : 'USD') as Currency

    const existingSub = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'authenticated'] },
    })
    if (existingSub) {
      try {
        await cancelProviderSubscription(existingSub, false)
        await Subscription.updateOne({ _id: existingSub._id }, { status: 'cancelled', cancelledAt: new Date() })
      } catch { /* non-fatal */ }
    }

    const user = await User.findById(userId).lean()
    const clientUrl = (process.env.CLIENT_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

    // Subscription products (recurring) — renewals are driven by the Dodo product's
    // "Repeat payment every" + long "Subscription period". Webhooks handle renewals.
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user?.email ?? '',
        name:  user?.name ?? '',
      },
      billing_currency,
      billing_address: {
        country: country as CountryCode,
      },
      return_url: `${clientUrl}/dashboard?upgraded=1`,
      metadata: {
        userId,
        tier,
        billing: yearly ? 'yearly' : 'monthly',
      },
      feature_flags: {
        allow_currency_selection: true,
      },
    })

    if (!session.checkout_url || !session.session_id) {
      throw createError('Failed to create Dodo checkout session', 502)
    }

    // Temporary unique id until webhook gives us the real subscription_id
    const placeholderId = `dodo_cks_${session.session_id}`

    await Subscription.create({
      userId,
      plan:                  tier,
      razorpaySubId:         placeholderId,
      razorpayCustomerId:    '',
      dodoCheckoutSessionId: session.session_id,
      status:                'created',
      billingInterval:       yearly ? 'yearly' : 'monthly',
      paymentSource:         'dodo',
      currency:              billing_currency,
    })

    res.json({
      checkoutUrl: session.checkout_url,
      sessionId:   session.session_id,
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/verify ───────────────────────────────────────────────────────
export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body as {
      razorpay_payment_id: string
      razorpay_subscription_id: string
      razorpay_signature: string
    }

    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      throw createError('Payment verification failed — invalid signature', 400)
    }

    const sub = await Subscription.findOne({ razorpaySubId: razorpay_subscription_id })
    if (!sub || sub.userId !== userId) {
      throw createError('Subscription not found', 404)
    }

    sub.status = 'active'
    await sub.save()
    await User.findByIdAndUpdate(userId, { plan: sub.plan })

    res.json({ success: true, plan: sub.plan })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/cancel ───────────────────────────────────────────────────────
export async function cancelSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    const sub = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'authenticated'] },
    })
    if (!sub) throw createError('No active subscription found', 404)

    await cancelProviderSubscription(sub, true)

    sub.cancelAtPeriodEnd = true
    sub.cancelledAt = new Date()
    await sub.save()

    res.json({ success: true, cancelAtPeriodEnd: true, currentPeriodEnd: sub.currentPeriodEnd })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/webhook ──────────────────────────────────────────────────────
export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string
    const body = JSON.stringify(req.body)

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const event = req.body as { event: string; payload: Record<string, unknown> }

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = (event.payload as { subscription?: { entity?: { id?: string; plan_id?: string; current_start?: number; current_end?: number } } }).subscription?.entity
        if (!sub?.id) break

        const dbSub = await Subscription.findOne({ razorpaySubId: sub.id })
        if (!dbSub) break

        dbSub.status = 'active'
        if (sub.current_start) dbSub.currentPeriodStart = new Date(sub.current_start * 1000)
        if (sub.current_end)   dbSub.currentPeriodEnd   = new Date(sub.current_end   * 1000)
        await dbSub.save()

        await User.findByIdAndUpdate(dbSub.userId, { plan: dbSub.plan })

        if (event.event === 'subscription.charged') {
          const payment = (event.payload as { payment?: { entity?: { id?: string; amount?: number } } }).payment?.entity
          if (payment?.id && payment?.amount) {
            await RevenueEvent.create({
              userId:            dbSub.userId,
              subscriptionId:    dbSub._id.toString(),
              razorpaySubId:     dbSub.razorpaySubId,
              razorpayPaymentId: payment.id,
              plan:              dbSub.plan,
              currency:          'INR',
              amountPaid:        payment.amount / 100,
              billingInterval:   dbSub.billingInterval,
              paymentSource:     'razorpay',
            }).catch(() => {})
          }
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.expired': {
        const sub = (event.payload as { subscription?: { entity?: { id?: string } } }).subscription?.entity
        if (!sub?.id) break

        const dbSub = await Subscription.findOne({ razorpaySubId: sub.id })
        if (!dbSub) break

        dbSub.status = event.event === 'subscription.cancelled' ? 'cancelled'
          : event.event === 'subscription.completed' ? 'completed' : 'expired'
        dbSub.cancelledAt = new Date()
        await dbSub.save()

        const hasActiveSub = await Subscription.exists({
          userId: dbSub.userId,
          _id:    { $ne: dbSub._id },
          status: { $in: ['active', 'authenticated'] },
        })
        if (!hasActiveSub) {
          await User.findByIdAndUpdate(dbSub.userId, { plan: 'free' })
        }
        break
      }

      case 'subscription.halted': {
        const sub = (event.payload as { subscription?: { entity?: { id?: string } } }).subscription?.entity
        if (!sub?.id) break
        await Subscription.updateOne({ razorpaySubId: sub.id }, { status: 'halted' })
        break
      }
    }

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// ── Dodo webhook helpers ───────────────────────────────────────────────────────

type DodoSubPayload = {
  subscription_id?: string
  product_id?: string
  status?: string
  next_billing_date?: string
  previous_billing_date?: string | null
  currency?: string
  metadata?: Record<string, string | number | boolean>
  payment_id?: string
  total_amount?: number
  amount?: number
}

async function findDodoSubscription(data: DodoSubPayload) {
  if (data.subscription_id) {
    const byId = await Subscription.findOne({ razorpaySubId: data.subscription_id, paymentSource: 'dodo' })
    if (byId) return byId
  }

  const meta = data.metadata ?? {}
  const userId = typeof meta.userId === 'string' ? meta.userId : null
  const sessionId = typeof meta.checkoutSessionId === 'string' ? meta.checkoutSessionId : null

  if (sessionId) {
    const bySession = await Subscription.findOne({ dodoCheckoutSessionId: sessionId, paymentSource: 'dodo' })
    if (bySession) return bySession
  }

  if (userId) {
    return Subscription.findOne({
      userId,
      paymentSource: 'dodo',
      status: { $in: ['created', 'pending', 'active', 'on_hold'] },
    }).sort({ createdAt: -1 })
  }

  return null
}

async function maybeDowngrade(userId: string, exceptSubId: unknown) {
  const hasActiveSub = await Subscription.exists({
    userId,
    _id:    { $ne: exceptSubId },
    status: { $in: ['active', 'authenticated'] },
  })
  if (!hasActiveSub) {
    await User.findByIdAndUpdate(userId, { plan: 'free' })
  }
}

// ── POST /billing/webhook/dodo ─────────────────────────────────────────────────
export async function handleDodoWebhook(req: Request, res: Response) {
  try {
    const rawBody =
      (req as Request & { rawBody?: Buffer | string }).rawBody
        ? Buffer.isBuffer((req as Request & { rawBody?: Buffer }).rawBody)
          ? (req as Request & { rawBody: Buffer }).rawBody.toString('utf8')
          : String((req as Request & { rawBody: string }).rawBody)
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body)

    const headers = {
      'webhook-id':        String(req.headers['webhook-id'] ?? ''),
      'webhook-signature': String(req.headers['webhook-signature'] ?? ''),
      'webhook-timestamp': String(req.headers['webhook-timestamp'] ?? ''),
    }

    let event: { type: string; data: DodoSubPayload }
    try {
      event = dodo().webhooks.unwrap(rawBody, {
        headers,
        key: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
      }) as { type: string; data: DodoSubPayload }
    } catch {
      return res.status(400).json({ error: 'Invalid Dodo webhook signature' })
    }

    const data = event.data ?? {}

    switch (event.type) {
      case 'subscription.active':
      case 'subscription.renewed':
      case 'subscription.plan_changed': {
        let dbSub = await findDodoSubscription(data)
        const productId = data.product_id ?? ''
        const plan = planFromDodoProductId(productId)
        const meta = data.metadata ?? {}
        const userId = (typeof meta.userId === 'string' ? meta.userId : dbSub?.userId) ?? null
        const billing = typeof meta.billing === 'string' ? meta.billing : dbSub?.billingInterval

        if (!dbSub && userId && plan !== 'free') {
          dbSub = await Subscription.create({
            userId,
            plan,
            razorpaySubId:         data.subscription_id ?? `dodo_${Date.now()}`,
            dodoCheckoutSessionId: typeof meta.checkoutSessionId === 'string' ? meta.checkoutSessionId : '',
            status:                'active',
            billingInterval:       billing === 'yearly' ? 'yearly' : 'monthly',
            paymentSource:         'dodo',
            currency:              (data.currency ?? 'USD').toUpperCase(),
            currentPeriodEnd:      data.next_billing_date ? new Date(data.next_billing_date) : null,
          })
        }

        if (!dbSub) break

        if (data.subscription_id && dbSub.razorpaySubId !== data.subscription_id) {
          // Replace placeholder cks id with real subscription id
          const conflict = await Subscription.findOne({
            razorpaySubId: data.subscription_id,
            _id: { $ne: dbSub._id },
          })
          if (!conflict) {
            dbSub.razorpaySubId = data.subscription_id
          }
        }

        dbSub.status = 'active'
        if (plan !== 'free') dbSub.plan = plan
        if (data.currency) dbSub.currency = data.currency.toUpperCase()
        if (data.next_billing_date) dbSub.currentPeriodEnd = new Date(data.next_billing_date)
        if (data.previous_billing_date) dbSub.currentPeriodStart = new Date(data.previous_billing_date)
        await dbSub.save()

        await User.findByIdAndUpdate(dbSub.userId, { plan: dbSub.plan })
        break
      }

      case 'subscription.on_hold':
      case 'subscription.paused': {
        const dbSub = await findDodoSubscription(data)
        if (!dbSub) break
        dbSub.status = 'on_hold'
        await dbSub.save()
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription.failed': {
        const dbSub = await findDodoSubscription(data)
        if (!dbSub) break
        dbSub.status =
          event.type === 'subscription.cancelled' ? 'cancelled'
            : event.type === 'subscription.expired' ? 'expired'
              : 'failed'
        dbSub.cancelledAt = new Date()
        await dbSub.save()
        await maybeDowngrade(dbSub.userId, dbSub._id)
        break
      }

      case 'payment.succeeded': {
        const payment = data as DodoSubPayload & {
          payment_id?: string
          subscription_id?: string
          total_amount?: number
          settlement_amount?: number
          currency?: string
        }
        if (!payment.subscription_id || !payment.payment_id) break

        const dbSub = await Subscription.findOne({
          razorpaySubId: payment.subscription_id,
          paymentSource: 'dodo',
        })
        if (!dbSub) break

        // Dodo amounts are typically in minor units for most currencies
        const rawAmount = payment.total_amount ?? payment.settlement_amount ?? payment.amount ?? 0
        const amountPaid = typeof rawAmount === 'number' ? rawAmount / 100 : 0

        await RevenueEvent.create({
          userId:            dbSub.userId,
          subscriptionId:    dbSub._id.toString(),
          razorpaySubId:     dbSub.razorpaySubId,
          razorpayPaymentId: payment.payment_id,
          plan:              dbSub.plan,
          currency:          (payment.currency ?? dbSub.currency ?? 'USD').toUpperCase(),
          amountPaid,
          billingInterval:   dbSub.billingInterval,
          paymentSource:     'dodo',
        }).catch(() => {})
        break
      }
    }

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Dodo webhook processing failed' })
  }
}

// ── GET /billing/pricing ───────────────────────────────────────────────────────
export function getPricing(_req: Request, res: Response) {
  res.json({ pricing: PRICING, plans: ['free', 'pro', 'ultimate'] })
}

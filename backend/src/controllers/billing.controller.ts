import { Request, Response, NextFunction } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Subscription } from '../models/subscription.model'
import { RevenueEvent } from '../models/revenue-event.model'
import { User } from '../models/user.model'
import { getLimits, getRazorpayPlanId, planFromRazorpayId, PRICING, type PlanName } from '../config/plans'
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

// ── GET /billing/geo ───────────────────────────────────────────────────────────
// Detect user's country via IP to decide INR vs USD display.
export async function detectGeo(req: Request, res: Response) {
  try {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      ''

    // Skip lookup for localhost / private IPs
    const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip) ||
      ip.startsWith('192.168.') || ip.startsWith('10.')

    if (isLocal) {
      return res.json({ country: 'IN', currency: 'INR' })
    }

    const geoRes = await fetch(`https://ipinfo.io/${ip}/json${process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : ''}`)
    const geo = await geoRes.json() as { country?: string }
    const country = geo.country ?? 'US'
    res.json({ country, currency: country === 'IN' ? 'INR' : 'USD' })
  } catch {
    res.json({ country: 'IN', currency: 'INR' })
  }
}

// ── GET /billing/plan ──────────────────────────────────────────────────────────
// Returns current user's plan, limits and active subscription info.
export async function getMyPlan(req: Request, res: Response) {
  const userId = req.user!.id
  const plan = req.user!.plan

  // Find active subscription if any
  const sub = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'authenticated', 'created', 'pending'] },
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
    } : null,
  })
}

// ── POST /billing/subscribe ────────────────────────────────────────────────────
// Creates a Razorpay subscription and returns the subscription_id for frontend checkout.
export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const currentPlan = req.user!.plan
    const { tier, yearly } = req.body as { tier: 'pro' | 'ultimate'; yearly: boolean }

    if (!['pro', 'ultimate'].includes(tier)) {
      throw createError('Invalid plan tier', 400)
    }

    // Prevent subscribing to current plan
    if (currentPlan === tier) {
      throw createError('You are already on this plan', 400)
    }

    // Cancel any existing active subscription first
    const existingSub = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'authenticated'] },
    })
    if (existingSub) {
      try {
        await rzp().subscriptions.cancel(existingSub.razorpaySubId, false)
        await Subscription.updateOne({ _id: existingSub._id }, { status: 'cancelled', cancelledAt: new Date() })
      } catch { /* non-fatal */ }
    }

    const planId = getRazorpayPlanId(tier, yearly)
    const user = await User.findById(userId).lean()

    // Create Razorpay subscription
    const rzpSub = await rzp().subscriptions.create({
      plan_id:         planId,
      total_count:     yearly ? 12 : 120, // 12 yearly cycles or 10 years monthly (effectively indefinite)
      quantity:        1,
      customer_notify: 1,
      notes: {
        userId,
        tier,
        billing: yearly ? 'yearly' : 'monthly',
        userEmail: user?.email ?? '',
      },
    })

    // Save to DB
    await Subscription.create({
      userId,
      plan:             tier,
      razorpaySubId:    rzpSub.id,
      razorpayCustomerId: '',
      status:           'created',
      billingInterval:  yearly ? 'yearly' : 'monthly',
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

// ── POST /billing/verify ───────────────────────────────────────────────────────
// Verifies Razorpay payment signature after checkout completes.
// Called from frontend after successful payment popup.
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

    // Verify signature — HMAC SHA256
    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      throw createError('Payment verification failed — invalid signature', 400)
    }

    // Find our subscription record
    const sub = await Subscription.findOne({ razorpaySubId: razorpay_subscription_id })
    if (!sub || sub.userId !== userId) {
      throw createError('Subscription not found', 404)
    }

    // Activate the subscription
    sub.status = 'active'
    await sub.save()

    // Upgrade user plan
    await User.findByIdAndUpdate(userId, { plan: sub.plan })

    res.json({ success: true, plan: sub.plan })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/cancel ───────────────────────────────────────────────────────
// User-initiated cancellation — cancels at period end.
export async function cancelSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    const sub = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'authenticated'] },
    })
    if (!sub) throw createError('No active subscription found', 404)

    // Cancel at period end (cancel_at_cycle_end = true)
    await rzp().subscriptions.cancel(sub.razorpaySubId, true)

    sub.cancelAtPeriodEnd = true
    sub.cancelledAt = new Date()
    await sub.save()

    res.json({ success: true, cancelAtPeriodEnd: true, currentPeriodEnd: sub.currentPeriodEnd })
  } catch (err) {
    next(err)
  }
}

// ── POST /billing/webhook ──────────────────────────────────────────────────────
// Razorpay webhook handler — verifies signature then processes events.
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

        // Keep user plan in sync
        await User.findByIdAndUpdate(dbSub.userId, { plan: dbSub.plan })

        // Log revenue on charge event
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
              amountPaid:        payment.amount / 100, // paise → rupees
              billingInterval:   dbSub.billingInterval,
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

        // Downgrade user to free
        await User.findByIdAndUpdate(dbSub.userId, { plan: 'free' })
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

// ── GET /billing/pricing ───────────────────────────────────────────────────────
// Public endpoint — returns pricing data so frontend doesn't need env vars.
export function getPricing(_req: Request, res: Response) {
  res.json({ pricing: PRICING, plans: ['free', 'pro', 'ultimate'] })
}

import { Schema, model, Document } from 'mongoose'
import type { PlanName } from '../config/plans'

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'on_hold'
  | 'failed'
  | 'cancelled'
  | 'completed'
  | 'expired'

export type PaymentSource = 'razorpay' | 'manual' | 'dodo'

export interface ISubscription extends Document {
  userId:              string
  plan:                PlanName
  /** Provider subscription id (Razorpay / Dodo / synthetic manual_...). */
  razorpaySubId:       string
  razorpayCustomerId:  string
  /** Dodo checkout session id — links pre-payment row to post-payment webhook. */
  dodoCheckoutSessionId: string
  status:              SubscriptionStatus
  billingInterval:     'monthly' | 'yearly'
  currentPeriodStart:  Date | null
  currentPeriodEnd:    Date | null
  cancelAtPeriodEnd:   boolean
  cancelledAt:         Date | null
  paymentSource:       PaymentSource
  /** ISO 4217 currency code (INR for Razorpay; any Dodo-supported code for international). */
  currency:            string
  paidMonths:          number | null
  onboardingNote:      string
  createdAt:           Date
  updatedAt:           Date
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId:              { type: String, required: true, index: true },
    plan:                { type: String, enum: ['free', 'pro', 'ultimate'], required: true },
    razorpaySubId:       { type: String, required: true, unique: true },
    razorpayCustomerId:  { type: String, default: '' },
    dodoCheckoutSessionId: { type: String, default: '', index: true },
    status:              {
      type: String,
      enum: [
        'created', 'authenticated', 'active', 'pending', 'halted',
        'on_hold', 'failed', 'cancelled', 'completed', 'expired',
      ],
      default: 'created',
    },
    billingInterval:     { type: String, enum: ['monthly', 'yearly'], required: true },
    currentPeriodStart:  { type: Date, default: null },
    currentPeriodEnd:    { type: Date, default: null },
    cancelAtPeriodEnd:   { type: Boolean, default: false },
    cancelledAt:         { type: Date, default: null },
    paymentSource:       { type: String, enum: ['razorpay', 'manual', 'dodo'], default: 'razorpay' },
    currency:            { type: String, default: 'INR' },
    paidMonths:          { type: Number, default: null },
    onboardingNote:      { type: String, default: '' },
  },
  { timestamps: true },
)

subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ razorpaySubId: 1 })

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema)

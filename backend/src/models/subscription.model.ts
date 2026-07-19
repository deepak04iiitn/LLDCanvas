import { Schema, model, Document } from 'mongoose'
import type { PlanName } from '../config/plans'

export interface ISubscription extends Document {
  userId:              string
  plan:                PlanName
  razorpaySubId:       string         // subscription_XXXX (or a synthetic "manual_..." id for manually-onboarded subs)
  razorpayCustomerId:  string         // customer_XXXX (if created)
  status:              'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired'
  billingInterval:     'monthly' | 'yearly'
  currentPeriodStart:  Date | null
  currentPeriodEnd:    Date | null
  cancelAtPeriodEnd:   boolean
  cancelledAt:         Date | null
  paymentSource:       'razorpay' | 'manual'
  currency:            'INR' | 'USD'
  paidMonths:          number | null   // exact prepaid duration for manual onboarding (e.g. 3, 6) — null for razorpay subs
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
    status:              {
      type: String,
      enum: ['created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired'],
      default: 'created',
    },
    billingInterval:     { type: String, enum: ['monthly', 'yearly'], required: true },
    currentPeriodStart:  { type: Date, default: null },
    currentPeriodEnd:    { type: Date, default: null },
    cancelAtPeriodEnd:   { type: Boolean, default: false },
    cancelledAt:         { type: Date, default: null },
    paymentSource:       { type: String, enum: ['razorpay', 'manual'], default: 'razorpay' },
    currency:            { type: String, enum: ['INR', 'USD'], default: 'INR' },
    paidMonths:          { type: Number, default: null },
    onboardingNote:      { type: String, default: '' },
  },
  { timestamps: true },
)

subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ razorpaySubId: 1 })

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema)

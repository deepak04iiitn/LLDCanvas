import { Schema, model, Document } from 'mongoose'
import type { PlanName } from '../config/plans'

export interface ISubscription extends Document {
  userId:              string
  plan:                PlanName
  razorpaySubId:       string         // subscription_XXXX
  razorpayCustomerId:  string         // customer_XXXX (if created)
  status:              'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired'
  billingInterval:     'monthly' | 'yearly'
  currentPeriodStart:  Date | null
  currentPeriodEnd:    Date | null
  cancelAtPeriodEnd:   boolean
  cancelledAt:         Date | null
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
  },
  { timestamps: true },
)

subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ razorpaySubId: 1 })

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema)

import { Schema, model, Document } from 'mongoose'

export interface IRevenueEvent extends Document {
  userId:          string
  subscriptionId:  string        // our DB subscription _id
  razorpaySubId:   string        // subscription_XXXX
  razorpayPaymentId: string      // pay_XXXX
  plan:            string
  currency:        'INR'
  amountPaid:      number        // in rupees (not paise)
  billingInterval: 'monthly' | 'yearly'
  createdAt:       Date
}

const schema = new Schema<IRevenueEvent>(
  {
    userId:            { type: String, required: true, index: true },
    subscriptionId:    { type: String, required: true },
    razorpaySubId:     { type: String, required: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    plan:              { type: String, required: true },
    currency:          { type: String, default: 'INR' },
    amountPaid:        { type: Number, required: true },
    billingInterval:   { type: String, enum: ['monthly', 'yearly'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

schema.index({ createdAt: -1 })
schema.index({ userId: 1, createdAt: -1 })
schema.index({ plan: 1, createdAt: -1 })

export const RevenueEvent = model<IRevenueEvent>('RevenueEvent', schema)

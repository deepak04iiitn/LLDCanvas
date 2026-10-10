import { Schema, model, Document } from 'mongoose'

export type TipMoment = 'starting' | 'designing' | 'patterns' | 'followups' | 'explaining'

export interface IJourneyTip extends Document {
  moment: TipMoment
  title: string
  body: string
  order: number
  status: 'published' | 'draft'
  createdAt: Date
  updatedAt: Date
}

const journeyTipSchema = new Schema<IJourneyTip>(
  {
    moment: { type: String, enum: ['starting', 'designing', 'patterns', 'followups', 'explaining'], required: true, index: true },
    title:  { type: String, required: true },
    body:   { type: String, required: true },
    order:  { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  },
  { timestamps: true },
)

export const JourneyTip = model<IJourneyTip>('JourneyTip', journeyTipSchema)

import { Schema, model, Document } from 'mongoose'

export type PreviewSource = 'hub' | 'setup' | 'generate'

/**
 * One doc per user who opened Plannr while on Free/Pro (preview / try access).
 * Used for admin analytics: how many users are viewing preview access.
 */
export interface IPlannrPreviewVisit extends Document {
  userId: string
  userPlan: 'free' | 'pro'
  firstViewedAt: Date
  lastViewedAt: Date
  visitCount: number
  sources: PreviewSource[]
  createdAt: Date
  updatedAt: Date
}

const plannrPreviewVisitSchema = new Schema<IPlannrPreviewVisit>(
  {
    userId:        { type: String, required: true, unique: true, index: true },
    userPlan:      { type: String, enum: ['free', 'pro'], required: true },
    firstViewedAt: { type: Date, required: true },
    lastViewedAt:  { type: Date, required: true, index: true },
    visitCount:    { type: Number, default: 1 },
    sources:       { type: [String], default: [] },
  },
  { timestamps: true },
)

export const PlannrPreviewVisit = model<IPlannrPreviewVisit>(
  'PlannrPreviewVisit',
  plannrPreviewVisitSchema,
)

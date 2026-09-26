import { Schema, model, Document } from 'mongoose'

export type ActivityType = 'read' | 'practice' | 'quiz' | 'design' | 'explain' | 'followup' | 'experience'
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor'

export interface IJourneyActivity extends Document {
  userId: string
  topicSlug?: string
  activityType: ActivityType
  performance?: PerformanceLevel
  skillsImproved: string[]
  duration?: number
  metadata?: Record<string, unknown>
  completedAt: Date
  createdAt: Date
}

const journeyActivitySchema = new Schema<IJourneyActivity>(
  {
    userId:          { type: String, required: true, index: true },
    topicSlug:       { type: String },
    activityType:    { type: String, enum: ['read', 'practice', 'quiz', 'design', 'explain', 'followup', 'experience'], required: true },
    performance:     { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    skillsImproved:  { type: [String], default: [] },
    duration:        { type: Number },
    metadata:        { type: Schema.Types.Mixed },
    completedAt:     { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
)

journeyActivitySchema.index({ userId: 1, completedAt: -1 })

export const JourneyActivity = model<IJourneyActivity>('JourneyActivity', journeyActivitySchema)

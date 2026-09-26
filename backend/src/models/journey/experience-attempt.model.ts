import { Schema, model, Document } from 'mongoose'

export interface IExperienceAttempt extends Document {
  userId: string
  experienceSlug: string
  probeAnswers: Array<{ probe: string; answer: string }>
  classesDrawn: number
  score: number
  skillsImproved: string[]
  completedAt: Date
}

const schema = new Schema<IExperienceAttempt>({
  userId:         { type: String, required: true, index: true },
  experienceSlug: { type: String, required: true },
  probeAnswers:   [{ probe: String, answer: String }],
  classesDrawn:   { type: Number, default: 0 },
  score:          { type: Number, default: 0 },
  skillsImproved: [String],
  completedAt:    { type: Date, default: Date.now },
}, { timestamps: false })

schema.index({ userId: 1, experienceSlug: 1 })

export const ExperienceAttempt = model<IExperienceAttempt>('ExperienceAttempt', schema)

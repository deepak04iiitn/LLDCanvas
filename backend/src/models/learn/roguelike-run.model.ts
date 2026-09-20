import { Schema, model, Document, Types } from 'mongoose'

export type RoguelikeRunStatus = 'active' | 'completed' | 'abandoned'

export interface IRoguelikeRun extends Document {
  userId: Types.ObjectId
  level: number
  modifiers: string[]
  status: RoguelikeRunStatus
  score: number
  currentPrompt: string
  createdAt: Date
  updatedAt: Date
}

const roguelikeRunSchema = new Schema<IRoguelikeRun>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    level: { type: Number, default: 1 },
    modifiers: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    score: { type: Number, default: 0 },
    currentPrompt: { type: String, default: '' },
  },
  { timestamps: true },
)

export const RoguelikeRun = model<IRoguelikeRun>('RoguelikeRun', roguelikeRunSchema)

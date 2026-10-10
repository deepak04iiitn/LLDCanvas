import { Schema, model, Document } from 'mongoose'

export interface IScoreHeuristicConfig extends Document {
  version: string
  active: boolean
  weights: {
    coupling: number
    cohesion: number
    complexity: number
    extensibility: number
    solid: number
  }
  copy: {
    disclaimer: string
  }
  createdAt: Date
  updatedAt: Date
}

const scoreHeuristicConfigSchema = new Schema<IScoreHeuristicConfig>(
  {
    version: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false, index: true },
    weights: {
      coupling: { type: Number, default: 1 },
      cohesion: { type: Number, default: 1 },
      complexity: { type: Number, default: 1 },
      extensibility: { type: Number, default: 1 },
      solid: { type: Number, default: 1 },
    },
    copy: {
      disclaimer: {
        type: String,
        default: 'Design Score is structured feedback, not an absolute measure of design quality.',
      },
    },
  },
  { timestamps: true },
)

export const ScoreHeuristicConfig = model<IScoreHeuristicConfig>(
  'ScoreHeuristicConfig',
  scoreHeuristicConfigSchema,
)

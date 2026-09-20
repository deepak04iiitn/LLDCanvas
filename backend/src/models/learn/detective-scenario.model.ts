import { Schema, model, Document } from 'mongoose'

export type DetectiveMode = 'identify' | 'detect' | 'explain'
export type DetectiveStatus = 'draft' | 'published' | 'archived'

export interface IDetectiveScenario extends Document {
  slug: string
  title: string
  mode: DetectiveMode
  difficulty: 'easy' | 'medium' | 'hard'
  stem: string
  /** Pattern key or "none" */
  answer: string
  choices: string[]
  explanation: string
  diagramSnapshot?: Record<string, unknown>
  status: DetectiveStatus
  order: number
  createdAt: Date
  updatedAt: Date
}

const detectiveScenarioSchema = new Schema<IDetectiveScenario>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    mode: { type: String, enum: ['identify', 'detect', 'explain'], default: 'identify' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    stem: { type: String, required: true },
    answer: { type: String, required: true },
    choices: { type: [String], default: [] },
    explanation: { type: String, default: '' },
    diagramSnapshot: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

detectiveScenarioSchema.index({ status: 1, order: 1 })

export const DetectiveScenario = model<IDetectiveScenario>(
  'DetectiveScenario',
  detectiveScenarioSchema,
)

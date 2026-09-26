import { Schema, model, Document } from 'mongoose'

export type DetectiveMode = 'identify' | 'detect' | 'explain' | 'suggest' | 'compare'
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

  // Mode 'suggest' — prose problem, user suggests which pattern to apply
  problemContext?: string   // prose description of the problem
  keyPatterns?: string[]    // valid pattern names accepted as correct

  // Mode 'compare' — user explains the tradeoff between two patterns
  patternA?: string         // first pattern name (shown to user)
  patternB?: string         // second pattern name (shown to user)
  comparisonContext?: string // design context for the comparison
  keyTradeoffs?: string[]   // keywords that should appear in a good answer
}

const detectiveScenarioSchema = new Schema<IDetectiveScenario>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    mode: {
      type: String,
      enum: ['identify', 'detect', 'explain', 'suggest', 'compare'],
      default: 'identify',
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    stem: { type: String, required: true },
    answer: { type: String, required: true },
    choices: { type: [String], default: [] },
    explanation: { type: String, default: '' },
    diagramSnapshot: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    order: { type: Number, default: 0 },

    // suggest fields
    problemContext: { type: String },
    keyPatterns: { type: [String] },

    // compare fields
    patternA: { type: String },
    patternB: { type: String },
    comparisonContext: { type: String },
    keyTradeoffs: { type: [String] },
  },
  { timestamps: true },
)

detectiveScenarioSchema.index({ status: 1, order: 1 })

export const DetectiveScenario = model<IDetectiveScenario>(
  'DetectiveScenario',
  detectiveScenarioSchema,
)

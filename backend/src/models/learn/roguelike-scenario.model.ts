import { Schema, model, Document } from 'mongoose'

export type EventType = 'requirement' | 'scale' | 'failure' | 'business' | 'team' | 'time' | 'constraint' | 'boss'
export type RunMode = 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'
export type RunDifficulty = 'easy' | 'medium' | 'hard' | 'hardcore'

export interface IDecisionOption {
  id: 'A' | 'B' | 'C' | 'D'
  label: string
  description: string
  healthDelta: {
    coupling?: number
    cohesion?: number
    extensibility?: number
    complexity?: number
    reliability?: number
    debt?: number
  }
  tags: string[]
  consequence: string
}

export interface IStageEvent {
  type: EventType
  title: string
  description: string
  icon: string
  decisions?: IDecisionOption[]
  requiresDesign: boolean
  hint?: string
  successCriteria?: string
}

export interface IStage {
  id: string
  order: number
  title: string
  event: IStageEvent
  isBoss: boolean
  isCheckpoint: boolean
  failureExplanation?: string
  nextStageIds?: string[]
}

export interface IInitialConstraints {
  complexityBudget: number
  engineeringHours: number
  teamSize: number
  infraBudget: number
  maxStructuralChanges: number
  expectedUsers: string
}

export interface IRoguelikeScenario extends Document {
  slug: string
  title: string
  icon: string
  description: string
  systemContext: string
  initialRequirement: string
  difficulty: RunDifficulty
  modes: RunMode[]
  stages: IStage[]
  initialConstraints: IInitialConstraints
  tags: string[]
  status: 'draft' | 'published'
  order: number
  estimatedMinutes: number
  createdAt: Date
  updatedAt: Date
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const healthDeltaSchema = new Schema(
  {
    coupling: Number,
    cohesion: Number,
    extensibility: Number,
    complexity: Number,
    reliability: Number,
    debt: Number,
  },
  { _id: false },
)

const decisionOptionSchema = new Schema<IDecisionOption>(
  {
    id: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    healthDelta: { type: healthDeltaSchema, default: {} },
    tags: { type: [String], default: [] },
    consequence: { type: String, default: '' },
  },
  { _id: false },
)

const stageEventSchema = new Schema<IStageEvent>(
  {
    type: {
      type: String,
      enum: ['requirement', 'scale', 'failure', 'business', 'team', 'time', 'constraint', 'boss'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '📋' },
    decisions: { type: [decisionOptionSchema], default: undefined },
    requiresDesign: { type: Boolean, default: false },
    hint: String,
    successCriteria: String,
  },
  { _id: false },
)

const stageSchema = new Schema<IStage>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    event: { type: stageEventSchema, required: true },
    isBoss: { type: Boolean, default: false },
    isCheckpoint: { type: Boolean, default: false },
    failureExplanation: String,
    nextStageIds: { type: [String], default: undefined },
  },
  { _id: false },
)

const initialConstraintsSchema = new Schema<IInitialConstraints>(
  {
    complexityBudget: { type: Number, required: true },
    engineeringHours: { type: Number, required: true },
    teamSize: { type: Number, required: true },
    infraBudget: { type: Number, required: true },
    maxStructuralChanges: { type: Number, required: true },
    expectedUsers: { type: String, required: true },
  },
  { _id: false },
)

// ── Root schema ──────────────────────────────────────────────────────────────

const roguelikeScenarioSchema = new Schema<IRoguelikeScenario>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    icon: { type: String, default: '🎮' },
    description: { type: String, default: '' },
    systemContext: { type: String, default: '' },
    initialRequirement: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'hardcore'],
      default: 'medium',
    },
    modes: {
      type: [String],
      enum: ['beginner', 'interview', 'survival', 'hardcore', 'endless'],
      default: ['beginner', 'interview', 'survival', 'hardcore', 'endless'],
    },
    stages: { type: [stageSchema], default: [] },
    initialConstraints: { type: initialConstraintsSchema, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    order: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 30 },
  },
  { timestamps: true },
)

roguelikeScenarioSchema.index({ status: 1, order: 1 })
roguelikeScenarioSchema.index({ slug: 1 })

export const RoguelikeScenario = model<IRoguelikeScenario>(
  'RoguelikeScenario',
  roguelikeScenarioSchema,
)

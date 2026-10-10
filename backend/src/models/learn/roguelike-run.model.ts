import { Schema, model, Document, Types } from 'mongoose'

export type RunStatus = 'active' | 'completed' | 'failed' | 'abandoned'
export type RunMode = 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'
export type RunEnding = 'survived' | 'survived_with_debt' | 'refactor_required' | 'collapse' | 'strategic_exit'

export interface ArchitectureHealth {
  coupling: number
  cohesion: number
  extensibility: number
  complexity: number
  reliability: number
  debt: number
}

export interface RunResources {
  engineeringHoursRemaining: number
  complexityBudgetRemaining: number
  teamSize: number
  infraBudgetRemaining: number
  changesRemaining: number
}

export interface StageResult {
  stageId: string
  stageOrder: number
  stageTitle: string
  eventType: string
  decisionMade?: string
  decisionLabel?: string
  diagramSnapshot?: { nodes: unknown[]; edges: unknown[] }
  architectureNotes?: string
  healthBefore: ArchitectureHealth
  healthAfter: ArchitectureHealth
  resourcesAfter: RunResources
  passed: boolean
  completedAt: Date
}

export interface RunCheckpoint {
  stageOrder: number
  health: ArchitectureHealth
  resources: RunResources
  diagramSnapshot?: { nodes: unknown[]; edges: unknown[] }
  savedAt: Date
}

export interface IRoguelikeRun extends Document {
  userId: Types.ObjectId
  scenarioId: Types.ObjectId
  scenarioSlug: string
  scenarioTitle: string
  mode: RunMode
  status: RunStatus
  currentStageOrder: number
  stages: StageResult[]
  health: ArchitectureHealth
  resources: RunResources
  checkpoints: RunCheckpoint[]
  ending?: RunEnding
  endingReason?: string
  totalDecisions: number
  totalRefactors: number
  majorFailures: number
  stagesTotal: number
  /** For quick runs: cap stages at this number */
  maxStages?: number
  /** Skill deltas applied when this run was ended */
  skillDeltas?: Record<string, number>
  /** Interview readiness score at time of run end */
  interviewReadiness?: number
  startedAt: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const architectureHealthSchema = new Schema<ArchitectureHealth>(
  {
    coupling: { type: Number, default: 30 },
    cohesion: { type: Number, default: 70 },
    extensibility: { type: Number, default: 60 },
    complexity: { type: Number, default: 20 },
    reliability: { type: Number, default: 65 },
    debt: { type: Number, default: 0 },
  },
  { _id: false },
)

const runResourcesSchema = new Schema<RunResources>(
  {
    engineeringHoursRemaining: { type: Number, required: true },
    complexityBudgetRemaining: { type: Number, required: true },
    teamSize: { type: Number, required: true },
    infraBudgetRemaining: { type: Number, required: true },
    changesRemaining: { type: Number, required: true },
  },
  { _id: false },
)

const diagramSnapshotSchema = new Schema(
  {
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false },
)

const stageResultSchema = new Schema<StageResult>(
  {
    stageId: { type: String, required: true },
    stageOrder: { type: Number, required: true },
    stageTitle: { type: String, required: true },
    eventType: { type: String, required: true },
    decisionMade: String,
    decisionLabel: String,
    diagramSnapshot: { type: diagramSnapshotSchema },
    architectureNotes: String,
    healthBefore: { type: architectureHealthSchema, required: true },
    healthAfter: { type: architectureHealthSchema, required: true },
    resourcesAfter: { type: runResourcesSchema, required: true },
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, required: true },
  },
  { _id: false },
)

const runCheckpointSchema = new Schema<RunCheckpoint>(
  {
    stageOrder: { type: Number, required: true },
    health: { type: architectureHealthSchema, required: true },
    resources: { type: runResourcesSchema, required: true },
    diagramSnapshot: { type: diagramSnapshotSchema },
    savedAt: { type: Date, required: true },
  },
  { _id: false },
)

// ── Root schema ──────────────────────────────────────────────────────────────

const roguelikeRunSchema = new Schema<IRoguelikeRun>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenarioId: { type: Schema.Types.ObjectId, ref: 'RoguelikeScenario', required: true },
    scenarioSlug: { type: String, required: true },
    scenarioTitle: { type: String, required: true },
    mode: {
      type: String,
      enum: ['beginner', 'interview', 'survival', 'hardcore', 'endless'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'abandoned'],
      default: 'active',
      index: true,
    },
    currentStageOrder: { type: Number, default: 1 },
    stages: { type: [stageResultSchema], default: [] },
    health: { type: architectureHealthSchema, required: true },
    resources: { type: runResourcesSchema, required: true },
    checkpoints: { type: [runCheckpointSchema], default: [] },
    ending: {
      type: String,
      enum: ['survived', 'survived_with_debt', 'refactor_required', 'collapse', 'strategic_exit'],
    },
    endingReason: String,
    totalDecisions: { type: Number, default: 0 },
    totalRefactors: { type: Number, default: 0 },
    majorFailures: { type: Number, default: 0 },
    stagesTotal: { type: Number, required: true },
    maxStages: { type: Number },
    skillDeltas: { type: Schema.Types.Mixed },
    interviewReadiness: { type: Number },
    startedAt: { type: Date, required: true },
    endedAt: Date,
  },
  { timestamps: true },
)

roguelikeRunSchema.index({ userId: 1, status: 1 })
roguelikeRunSchema.index({ userId: 1, createdAt: -1 })

export const RoguelikeRun = model<IRoguelikeRun>('RoguelikeRun', roguelikeRunSchema)

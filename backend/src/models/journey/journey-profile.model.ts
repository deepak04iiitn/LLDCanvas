import { Schema, model, Document } from 'mongoose'

export interface ISkills {
  oop: number
  solid: number
  patterns: number
  designThinking: number
  requirementAnalysis: number
  entityIdentification: number
  responsibilities: number
  relationships: number
  extensibility: number
  coupling: number
  cohesion: number
  communication: number
  tradeoffReasoning: number
  followupHandling: number
  designSpeed: number
}

export interface ISkillEvidence {
  skillKey: string
  delta: number
  reason: string
  source: 'practice' | 'check' | 'mastery' | 'mock' | 'diagnostic' | 'migration'
  topicSlug?: string
  at: Date
}

export interface IModuleTopicProgress {
  completedBlockIds: string[]
  practiceSolvedIds: string[]
  checkScores: Record<string, number>
  masteryScore: number
  lastVisitedAt?: Date
  completedAt?: Date
}

export interface IDiagnosticResult {
  score: number
  suggestedLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  suggestedStage: number
  answers: { id: string; correct: boolean }[]
  completedAt: Date
}

export interface IJourneyProfile extends Document {
  userId: string
  planName: string
  isActive: boolean
  onboardingComplete: boolean
  targetRole: 'sde1' | 'sde2' | 'backend' | 'fullstack' | 'general'
  preparationDays: 7 | 14 | 30 | 60
  currentLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  focusAreas: string[]
  interviewDate?: Date
  dailyMinutes: number
  weakSkillsOverride: string[]
  moduleProgress: Record<string, IModuleTopicProgress>
  diagnostic?: IDiagnosticResult
  skills: ISkills
  /** Append-only log of score changes with human-readable reasons */
  skillEvidence: ISkillEvidence[]
  topicsCompleted: string[]
  topicsInProgress: string[]
  /** User-bookmarked topics for the Revise page */
  revisionBookmarks: string[]
  currentFocusSlug: string
  currentStage: number
  startDate: Date
  lastActiveDate: Date
  createdAt: Date
  updatedAt: Date
}

const skillsSchema = new Schema<ISkills>(
  {
    oop: { type: Number, min: 0, max: 100, default: 0 },
    solid: { type: Number, min: 0, max: 100, default: 0 },
    patterns: { type: Number, min: 0, max: 100, default: 0 },
    designThinking: { type: Number, min: 0, max: 100, default: 0 },
    requirementAnalysis: { type: Number, min: 0, max: 100, default: 0 },
    entityIdentification: { type: Number, min: 0, max: 100, default: 0 },
    responsibilities: { type: Number, min: 0, max: 100, default: 0 },
    relationships: { type: Number, min: 0, max: 100, default: 0 },
    extensibility: { type: Number, min: 0, max: 100, default: 0 },
    coupling: { type: Number, min: 0, max: 100, default: 0 },
    cohesion: { type: Number, min: 0, max: 100, default: 0 },
    communication: { type: Number, min: 0, max: 100, default: 0 },
    tradeoffReasoning: { type: Number, min: 0, max: 100, default: 0 },
    followupHandling: { type: Number, min: 0, max: 100, default: 0 },
    designSpeed: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
)

const skillEvidenceSchema = new Schema(
  {
    skillKey: { type: String, required: true },
    delta: { type: Number, required: true },
    reason: { type: String, required: true },
    source: {
      type: String,
      enum: ['practice', 'check', 'mastery', 'mock', 'diagnostic', 'migration'],
      required: true,
    },
    topicSlug: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
)

const moduleTopicProgressSchema = new Schema(
  {
    completedBlockIds: { type: [String], default: [] },
    practiceSolvedIds: { type: [String], default: [] },
    checkScores: { type: Map, of: Number, default: {} },
    masteryScore: { type: Number, default: 0 },
    lastVisitedAt: Date,
    completedAt: Date,
  },
  { _id: false },
)

const diagnosticSchema = new Schema(
  {
    score: Number,
    suggestedLevel: { type: String, enum: ['scratch', 'oop', 'basic-lld', 'solving'] },
    suggestedStage: Number,
    answers: [{ id: String, correct: Boolean }],
    completedAt: Date,
  },
  { _id: false },
)

const journeyProfileSchema = new Schema<IJourneyProfile>(
  {
    userId: { type: String, required: true, index: true },
    planName: { type: String, default: 'My Plannr' },
    isActive: { type: Boolean, default: true, index: true },
    onboardingComplete: { type: Boolean, default: false },
    targetRole: {
      type: String,
      enum: ['sde1', 'sde2', 'backend', 'fullstack', 'general'],
      default: 'general',
    },
    preparationDays: { type: Number, enum: [7, 14, 30, 60], default: 30 },
    currentLevel: {
      type: String,
      enum: ['scratch', 'oop', 'basic-lld', 'solving'],
      default: 'scratch',
    },
    focusAreas: { type: [String], default: [] },
    interviewDate: { type: Date },
    dailyMinutes: { type: Number, default: 45 },
    weakSkillsOverride: { type: [String], default: [] },
    moduleProgress: { type: Map, of: moduleTopicProgressSchema, default: {} },
    diagnostic: { type: diagnosticSchema },
    skills: { type: skillsSchema, default: () => ({}) },
    skillEvidence: { type: [skillEvidenceSchema], default: [] },
    topicsCompleted: { type: [String], default: [] },
    topicsInProgress: { type: [String], default: [] },
    revisionBookmarks: { type: [String], default: [] },
    currentFocusSlug: { type: String, default: '' },
    currentStage: { type: Number, default: 1 },
    startDate: { type: Date },
    lastActiveDate: { type: Date },
  },
  { timestamps: true },
)

journeyProfileSchema.index({ userId: 1, isActive: 1 })

export const JourneyProfile = model<IJourneyProfile>('JourneyProfile', journeyProfileSchema)

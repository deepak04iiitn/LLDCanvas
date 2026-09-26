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

export interface IJourneyProfile extends Document {
  userId: string
  planName: string
  isActive: boolean
  onboardingComplete: boolean
  targetRole: 'sde1' | 'sde2' | 'backend' | 'fullstack' | 'general'
  preparationDays: 7 | 14 | 30 | 60
  currentLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  skills: ISkills
  topicsCompleted: string[]
  topicsInProgress: string[]
  currentFocusSlug: string
  currentStage: number
  startDate: Date
  lastActiveDate: Date
  createdAt: Date
  updatedAt: Date
}

const skillsSchema = new Schema<ISkills>(
  {
    oop:                 { type: Number, min: 0, max: 100, default: 10 },
    solid:               { type: Number, min: 0, max: 100, default: 10 },
    patterns:            { type: Number, min: 0, max: 100, default: 10 },
    designThinking:      { type: Number, min: 0, max: 100, default: 10 },
    requirementAnalysis: { type: Number, min: 0, max: 100, default: 10 },
    entityIdentification:{ type: Number, min: 0, max: 100, default: 10 },
    responsibilities:    { type: Number, min: 0, max: 100, default: 10 },
    relationships:       { type: Number, min: 0, max: 100, default: 10 },
    extensibility:       { type: Number, min: 0, max: 100, default: 10 },
    coupling:            { type: Number, min: 0, max: 100, default: 10 },
    cohesion:            { type: Number, min: 0, max: 100, default: 10 },
    communication:       { type: Number, min: 0, max: 100, default: 10 },
    tradeoffReasoning:   { type: Number, min: 0, max: 100, default: 10 },
    followupHandling:    { type: Number, min: 0, max: 100, default: 10 },
    designSpeed:         { type: Number, min: 0, max: 100, default: 10 },
  },
  { _id: false },
)

const journeyProfileSchema = new Schema<IJourneyProfile>(
  {
    userId:             { type: String, required: true, index: true },
    planName:           { type: String, default: 'My Plannr' },
    isActive:           { type: Boolean, default: true, index: true },
    onboardingComplete: { type: Boolean, default: false },
    targetRole:         { type: String, enum: ['sde1', 'sde2', 'backend', 'fullstack', 'general'], default: 'general' },
    preparationDays:    { type: Number, enum: [7, 14, 30, 60], default: 30 },
    currentLevel:       { type: String, enum: ['scratch', 'oop', 'basic-lld', 'solving'], default: 'scratch' },
    skills:             { type: skillsSchema, default: () => ({}) },
    topicsCompleted:    { type: [String], default: [] },
    topicsInProgress:   { type: [String], default: [] },
    currentFocusSlug:   { type: String, default: '' },
    currentStage:       { type: Number, default: 1 },
    startDate:          { type: Date },
    lastActiveDate:     { type: Date },
  },
  { timestamps: true },
)

// Compound index: fast lookup of active plan per user
journeyProfileSchema.index({ userId: 1, isActive: 1 })

export const JourneyProfile = model<IJourneyProfile>('JourneyProfile', journeyProfileSchema)

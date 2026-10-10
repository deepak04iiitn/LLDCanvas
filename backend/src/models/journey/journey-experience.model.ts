import { Schema, model, Document } from 'mongoose'

export interface ISkillBar {
  skill: string
  weight: number
}

export interface IJourneyExperience extends Document {
  slug: string
  title: string
  company?: string
  round: string
  durationMinutes: number
  problem: string
  problemDescription: string
  followUps: string[]
  conceptsTested: string[]
  skillBars: ISkillBar[]
  difficultyDimensions: Record<string, string>
  interviewerProbes: string[]
  prerequisiteTopics: string[]
  interviewerChecklist: string[]
  tags: string[]
  order: number
  status: 'published' | 'draft'
  createdAt: Date
  updatedAt: Date
}

const skillBarSchema = new Schema<ISkillBar>(
  {
    skill:  { type: String, required: true },
    weight: { type: Number, min: 1, max: 10, required: true },
  },
  { _id: false },
)

const journeyExperienceSchema = new Schema<IJourneyExperience>(
  {
    slug:               { type: String, required: true, unique: true, index: true },
    title:              { type: String, required: true },
    company:            { type: String },
    round:              { type: String, default: 'LLD Round' },
    durationMinutes:    { type: Number, default: 45 },
    problem:            { type: String, required: true },
    problemDescription: { type: String, required: true },
    followUps:          { type: [String], default: [] },
    conceptsTested:     { type: [String], default: [] },
    skillBars:          { type: [skillBarSchema], default: [] },
    difficultyDimensions:{ type: Map, of: String, default: {} },
    interviewerProbes:  { type: [String], default: [] },
    prerequisiteTopics: { type: [String], default: [] },
    interviewerChecklist:{ type: [String], default: [] },
    tags:               { type: [String], default: [] },
    order:              { type: Number, default: 0, index: true },
    status:             { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  },
  { timestamps: true },
)

export const JourneyExperience = model<IJourneyExperience>('JourneyExperience', journeyExperienceSchema)

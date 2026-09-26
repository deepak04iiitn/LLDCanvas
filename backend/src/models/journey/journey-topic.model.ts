import { Schema, model, Document } from 'mongoose'

export interface ITopicContent {
  learn: string
  whyItMatters: string
  interviewTip: string
  realExperience?: string
  spotItPrompt?: string
  spotItDesign?: string
  spotItAnswer?: string
  fixItPrompt?: string
  fixItAnswer?: string
  interviewQuestion?: string
  interviewAnswer?: string
  followUp?: string
  followUpAnswer?: string
}

export interface IDifficultyDimensions {
  oop: 'easy' | 'medium' | 'hard'
  solid: 'easy' | 'medium' | 'hard'
  patterns: 'easy' | 'medium' | 'hard'
  extensibility: 'easy' | 'medium' | 'hard'
  requirementAmbiguity: 'easy' | 'medium' | 'hard'
}

export interface IPatternMapStep {
  label: string
  description: string
}

export interface IJourneyTopic extends Document {
  slug: string
  title: string
  subtitle: string
  stage: 1 | 2 | 3 | 4 | 5
  order: number
  type: 'concept' | 'practice' | 'interview'
  description: string
  estimatedMinutes: number
  icon: string
  content: ITopicContent
  difficultyDimensions: IDifficultyDimensions
  buildsSkills: string[]
  prerequisites: string[]
  interviewerProbes: string[]
  commonMistakes: string[]
  patternMapSteps: IPatternMapStep[]
  tags: string[]
  status: 'published' | 'draft'
  exerciseType?: 'detective_scenario' | 'design_bug' | 'quiz_set' | 'none'
  exerciseId?: string // ID or slug of the linked exercise
  linkedStudioPack?: string // slug of a linked Design Studio pack
  linkedLearnExercise?: string // slug/id of a linked Learn exercise
  createdAt: Date
  updatedAt: Date
}

const topicContentSchema = new Schema<ITopicContent>(
  {
    learn:             { type: String, required: true },
    whyItMatters:      { type: String, required: true },
    interviewTip:      { type: String, required: true },
    realExperience:    { type: String },
    spotItPrompt:      { type: String },
    spotItDesign:      { type: String },
    spotItAnswer:      { type: String },
    fixItPrompt:       { type: String },
    fixItAnswer:       { type: String },
    interviewQuestion: { type: String },
    interviewAnswer:   { type: String },
    followUp:          { type: String },
    followUpAnswer:    { type: String },
  },
  { _id: false },
)

const difficultyDimensionsSchema = new Schema<IDifficultyDimensions>(
  {
    oop:                 { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    solid:               { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    patterns:            { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    extensibility:       { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    requirementAmbiguity:{ type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  },
  { _id: false },
)

const patternMapStepSchema = new Schema<IPatternMapStep>(
  {
    label:       { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
)

const journeyTopicSchema = new Schema<IJourneyTopic>(
  {
    slug:                { type: String, required: true, unique: true, index: true },
    title:               { type: String, required: true },
    subtitle:            { type: String, default: '' },
    stage:               { type: Number, enum: [1, 2, 3, 4, 5], required: true, index: true },
    order:               { type: Number, required: true },
    type:                { type: String, enum: ['concept', 'practice', 'interview'], default: 'concept' },
    description:         { type: String, required: true },
    estimatedMinutes:    { type: Number, default: 15 },
    icon:                { type: String, default: '📖' },
    content:             { type: topicContentSchema, required: true },
    difficultyDimensions:{ type: difficultyDimensionsSchema, default: () => ({}) },
    buildsSkills:        { type: [String], default: [] },
    prerequisites:       { type: [String], default: [] },
    interviewerProbes:   { type: [String], default: [] },
    commonMistakes:      { type: [String], default: [] },
    patternMapSteps:     { type: [patternMapStepSchema], default: [] },
    tags:                { type: [String], default: [] },
    status:              { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    exerciseType:        { type: String, enum: ['detective_scenario', 'design_bug', 'quiz_set', 'none'] },
    exerciseId:          { type: String },
    linkedStudioPack:    { type: String },
    linkedLearnExercise: { type: String },
  },
  { timestamps: true },
)

export const JourneyTopic = model<IJourneyTopic>('JourneyTopic', journeyTopicSchema)

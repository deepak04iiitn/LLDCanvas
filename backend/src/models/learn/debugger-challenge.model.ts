import { Schema, model, Document } from 'mongoose'

export type BugType =
  | 'logic'
  | 'off-by-one'
  | 'null-check'
  | 'wrong-algorithm'
  | 'edge-case'
  | 'type-error'
  | 'infinite-loop'
  | 'boundary'
  | 'operator'
  | 'missing-return'

export interface IDebuggerChallenge extends Document {
  slug: string
  title: string
  description: string
  variants: { language: string; buggyCode: string }[]
  expectedOutput: string
  testInput: string
  hint: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  bugType: BugType
  tags: string[]
  status: 'draft' | 'published'
  order: number
  createdAt: Date
  updatedAt: Date
}

const variantSchema = new Schema(
  { language: String, buggyCode: String },
  { _id: false },
)

const debuggerChallengeSchema = new Schema<IDebuggerChallenge>(
  {
    slug:           { type: String, required: true, unique: true },
    title:          { type: String, required: true },
    description:    { type: String, required: true },
    variants:       { type: [variantSchema], required: true, default: [] },
    expectedOutput: { type: String, required: true },
    testInput:      { type: String, default: '' },
    hint:           { type: String, default: '' },
    explanation:    { type: String, default: '' },
    difficulty:     { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    bugType: {
      type: String,
      enum: [
        'logic', 'off-by-one', 'null-check', 'wrong-algorithm',
        'edge-case', 'type-error', 'infinite-loop', 'boundary',
        'operator', 'missing-return',
      ],
      default: 'logic',
    },
    tags:   { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    order:  { type: Number, default: 0 },
  },
  { timestamps: true },
)

debuggerChallengeSchema.index({ status: 1, order: 1 })

export const DebuggerChallenge = model<IDebuggerChallenge>(
  'DebuggerChallenge',
  debuggerChallengeSchema,
)

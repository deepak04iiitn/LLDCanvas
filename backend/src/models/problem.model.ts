import { Schema, model, Document } from 'mongoose'

export interface IProblem extends Document {
  slug:       string
  title:      string
  difficulty: 'easy' | 'medium' | 'hard'
  category:   string
  description: string
  companies:  string[]
  tags:       string[]
  functionalRequirements:    string[]
  nonFunctionalRequirements: string[]
  hints:      string[]   // exactly 3
  order:      number     // sort within difficulty
  isActive:   boolean

  // SEO/public-page copy — narrative content for the public preview pages,
  // distinct from functionalRequirements/hints which stay gated behind auth.
  realWorldApplications: string[]   // 3-4 short bullets
  learningObjectives:    string[]   // 3-4 short bullets
  whyAsked:              string     // 1-2 sentence paragraph

  createdAt:  Date
  updatedAt:  Date
}

const schema = new Schema<IProblem>(
  {
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    title:      { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category:   { type: String, required: true },
    description: { type: String, required: true },
    companies:  { type: [String], default: [] },
    tags:       { type: [String], default: [] },
    functionalRequirements:    { type: [String], default: [] },
    nonFunctionalRequirements: { type: [String], default: [] },
    hints:      { type: [String], default: [] },
    order:      { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },

    realWorldApplications: { type: [String], default: [] },
    learningObjectives:    { type: [String], default: [] },
    whyAsked:               { type: String, default: '' },
  },
  { timestamps: true },
)

schema.index({ difficulty: 1, order: 1 })
schema.index({ isActive: 1 })

export const Problem = model<IProblem>('Problem', schema)

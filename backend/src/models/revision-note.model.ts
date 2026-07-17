import { Schema, model, Document } from 'mongoose'

export interface IRevisionNote extends Document {
  slug:       string
  title:      string
  category:   string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  summary:    string
  keyPoints:  string[]
  analogy:    string
  codeHint:   string
  tags:       string[]
  order:      number
  isActive:   boolean
  createdAt:  Date
  updatedAt:  Date
}

const schema = new Schema<IRevisionNote>(
  {
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    title:      { type: String, required: true },
    category:   { type: String, required: true },
    difficulty: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'basic' },
    summary:    { type: String, required: true },
    keyPoints:  { type: [String], default: [] },
    analogy:    { type: String, default: '' },
    codeHint:   { type: String, default: '' },
    tags:       { type: [String], default: [] },
    order:      { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true },
)

schema.index({ category: 1, order: 1 })
schema.index({ isActive: 1 })

export const RevisionNote = model<IRevisionNote>('RevisionNote', schema)

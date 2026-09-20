import { Schema, model, Document } from 'mongoose'

export type MashupStatus = 'draft' | 'published' | 'archived'

export interface IMashupRecipe extends Document {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  summary: string
  constraints: string[]
  problemLabels: string[]
  status: MashupStatus
  order: number
  createdAt: Date
  updatedAt: Date
}

const mashupRecipeSchema = new Schema<IMashupRecipe>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    summary: { type: String, default: '' },
    constraints: { type: [String], default: [] },
    problemLabels: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

mashupRecipeSchema.index({ status: 1, order: 1 })

export const MashupRecipe = model<IMashupRecipe>('MashupRecipe', mashupRecipeSchema)

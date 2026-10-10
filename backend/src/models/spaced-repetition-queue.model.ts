import { Schema, model, Document } from 'mongoose'

export interface ISpacedRepetitionItem extends Document {
  userId: string
  itemType: 'topic' | 'studio_challenge' | 'quiz_question'
  itemId: string
  itemTitle: string
  itemHref: string
  dueDate: Date
  lastReviewedAt?: Date
  reviewCount: number
  isActive: boolean
}

const schema = new Schema<ISpacedRepetitionItem>({
  userId:         { type: String, required: true, index: true },
  itemType:       { type: String, enum: ['topic', 'studio_challenge', 'quiz_question'], required: true },
  itemId:         { type: String, required: true },
  itemTitle:      { type: String, required: true },
  itemHref:       { type: String, required: true },
  dueDate:        { type: Date, required: true, index: true },
  lastReviewedAt: Date,
  reviewCount:    { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true })

schema.index({ userId: 1, dueDate: 1, isActive: 1 })

export const SpacedRepetitionQueue = model<ISpacedRepetitionItem>('SpacedRepetitionQueue', schema)

import { Schema, model, Document, Types } from 'mongoose'

export interface IQuizRevisit extends Document {
  userId: string
  questionId: Types.ObjectId
  addedAt: Date
  reviewedAt?: Date
  isResolved: boolean
}

const schema = new Schema<IQuizRevisit>(
  {
    userId: String,
    questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
    addedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: false },
)

schema.index({ userId: 1, isResolved: 1 })

export const QuizRevisit = model<IQuizRevisit>('QuizRevisit', schema)

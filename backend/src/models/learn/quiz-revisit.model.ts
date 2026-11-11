import { Schema, model, Document, Types } from 'mongoose'

export interface IQuizRevisit extends Document {
  userId: string
  questionId: Types.ObjectId
  userChoiceIndex?: number   // the wrong answer the user picked
  addedAt: Date
  reviewedAt?: Date
  isResolved: boolean
}

const schema = new Schema<IQuizRevisit>(
  {
    userId: String,
    questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
    userChoiceIndex: { type: Number },
    addedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: false },
)

schema.index({ userId: 1, isResolved: 1 })
// reviewedAt is only set when an entry is resolved, so unresolved revisits
// (no reviewedAt) never expire. Resolved ones are cleaned up after 90 days.
schema.index({ reviewedAt: 1 }, { expireAfterSeconds: 7776000, name: 'resolved_ttl_90d' })

export const QuizRevisit = model<IQuizRevisit>('QuizRevisit', schema)

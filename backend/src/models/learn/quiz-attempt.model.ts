import { Schema, model, Document, Types } from 'mongoose'

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId
  dateKey: string
  setId?: Types.ObjectId
  answers: { questionId: Types.ObjectId; choiceIndex: number; correct: boolean }[]
  correctCount: number
  total: number
  createdAt: Date
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true },
    setId: { type: Schema.Types.ObjectId, ref: 'DailyQuizSet' },
    answers: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
      choiceIndex: { type: Number, required: true },
      correct: { type: Boolean, default: false },
    }],
    correctCount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

quizAttemptSchema.index({ userId: 1, dateKey: 1 })

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema)

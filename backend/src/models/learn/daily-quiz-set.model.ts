import { Schema, model, Document, Types } from 'mongoose'

export interface IDailyQuizSet extends Document {
  /** YYYY-MM-DD (UTC) */
  dateKey: string
  questionIds: Types.ObjectId[]
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
}

const dailyQuizSetSchema = new Schema<IDailyQuizSet>(
  {
    dateKey: { type: String, required: true, unique: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'QuizQuestion' }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  },
  { timestamps: true },
)

export const DailyQuizSet = model<IDailyQuizSet>('DailyQuizSet', dailyQuizSetSchema)

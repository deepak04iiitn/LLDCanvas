import { Schema, model, Document, Types } from 'mongoose'

export interface IUserSolution extends Document {
  problemId:   Types.ObjectId
  userId:      string
  diagramId:   Types.ObjectId | null
  status:      'in_progress' | 'submitted'
  submittedAt: Date | null
  createdAt:   Date
  updatedAt:   Date
}

const schema = new Schema<IUserSolution>(
  {
    problemId:   { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    userId:      { type: String, required: true },
    diagramId:   { type: Schema.Types.ObjectId, ref: 'Diagram', default: null },
    status:      { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

// One solution per user per problem
schema.index({ problemId: 1, userId: 1 }, { unique: true })
schema.index({ userId: 1, status: 1 })
schema.index({ problemId: 1, status: 1, submittedAt: -1 })

export const UserSolution = model<IUserSolution>('UserSolution', schema)

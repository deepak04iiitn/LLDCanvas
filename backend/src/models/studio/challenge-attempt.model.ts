import { Schema, model, Document, Types } from 'mongoose'

export type DebuggerStage = 'detect' | 'diagnose' | 'repair' | 'verify' | 'complete'

export interface IChallengeAttempt extends Document {
  packId: Types.ObjectId
  userId: Types.ObjectId
  type: string
  status: 'in_progress' | 'submitted' | 'revealed'
  stage: DebuggerStage
  marks: unknown[]
  diagramData?: Record<string, unknown>
  result?: Record<string, unknown>
  hintsUsed: number
  consoleLog: unknown[]
  startedAt: Date
  createdAt: Date
  updatedAt: Date
}

const challengeAttemptSchema = new Schema<IChallengeAttempt>(
  {
    packId: { type: Schema.Types.ObjectId, ref: 'ChallengePack', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['in_progress', 'submitted', 'revealed'], default: 'in_progress' },
    stage: {
      type: String,
      enum: ['detect', 'diagnose', 'repair', 'verify', 'complete'],
      default: 'detect',
    },
    marks: { type: [Schema.Types.Mixed], default: [] },
    diagramData: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    hintsUsed: { type: Number, default: 0 },
    consoleLog: { type: [Schema.Types.Mixed], default: [] },
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const ChallengeAttempt = model<IChallengeAttempt>('ChallengeAttempt', challengeAttemptSchema)

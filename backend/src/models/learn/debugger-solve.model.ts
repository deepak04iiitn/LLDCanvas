import { Schema, model, Document } from 'mongoose'
import { Types } from 'mongoose'

export interface IDebuggerSolve extends Document {
  userId: string
  challengeId: Types.ObjectId
  mode: 'code' | 'design'
  timeTakenSeconds: number
  isSolved: boolean
  solvedAt: Date
}

const schema = new Schema<IDebuggerSolve>({
  userId:           { type: String, required: true, index: true },
  challengeId:      { type: Schema.Types.ObjectId, required: true },
  mode:             { type: String, enum: ['code', 'design'], default: 'code' },
  timeTakenSeconds: { type: Number, default: 0 },
  isSolved:         { type: Boolean, default: false },
  solvedAt:         { type: Date, default: Date.now },
}, { timestamps: false })

schema.index({ userId: 1, challengeId: 1 })

export const DebuggerSolve = model<IDebuggerSolve>('DebuggerSolve', schema)

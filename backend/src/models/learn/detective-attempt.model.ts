import { Schema, model, Document } from 'mongoose'
import { Types } from 'mongoose'

export interface IDetectiveAttempt extends Document {
  userId: string
  scenarioId: Types.ObjectId
  answer: string
  isCorrect: boolean
  timeTakenSeconds: number
  timestamp: Date
}

const schema = new Schema<IDetectiveAttempt>({
  userId: { type: String, required: true, index: true },
  scenarioId: { type: Schema.Types.ObjectId, ref: 'DetectiveScenario', required: true },
  answer: String,
  isCorrect: { type: Boolean, default: false },
  timeTakenSeconds: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false })

schema.index({ userId: 1, scenarioId: 1 })

export const DetectiveAttempt = model<IDetectiveAttempt>('DetectiveAttempt', schema)

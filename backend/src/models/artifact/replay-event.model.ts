import { Schema, model, Document, Types } from 'mongoose'

export interface IReplayEvent extends Document {
  /** Artifact id (= diagram id) */
  artifactId: Types.ObjectId
  diagramId: Types.ObjectId
  type: string
  payload: Record<string, unknown>
  /** Offset from session start in milliseconds */
  t: number
  userId: Types.ObjectId
  createdAt: Date
}

const replayEventSchema = new Schema<IReplayEvent>(
  {
    artifactId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true, index: true },
    diagramId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    t: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

replayEventSchema.index({ artifactId: 1, t: 1 })
replayEventSchema.index({ diagramId: 1, t: 1 })

export const ReplayEvent = model<IReplayEvent>('ReplayEvent', replayEventSchema)

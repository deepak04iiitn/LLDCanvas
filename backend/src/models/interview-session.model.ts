import { Schema, model, Document, Types } from 'mongoose'

export interface IInterviewSession extends Document {
  userId: string
  diagramId: string | null
  title: string
  status: 'active' | 'completed' | 'abandoned'
  durationLimit: number | null  // planned seconds (null = no limit)
  timeElapsed: number           // seconds actually spent
  notes: string
  canvasSnapshot: unknown       // { nodes, edges } saved at session end
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const schema = new Schema<IInterviewSession>(
  {
    userId:          { type: String, required: true, index: true },
    diagramId:       { type: String, default: null },
    title:           { type: String, default: 'Practice Session' },
    status:          { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    durationLimit:   { type: Number, default: null },
    timeElapsed:     { type: Number, default: 0 },
    notes:           { type: String, default: '' },
    canvasSnapshot:  { type: Schema.Types.Mixed, default: null },
    startedAt:       { type: Date, default: Date.now },
    completedAt:     { type: Date, default: null },
  },
  { timestamps: true },
)

schema.index({ userId: 1, createdAt: -1 })

export const InterviewSession = model<IInterviewSession>('InterviewSession', schema)

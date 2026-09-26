import { Schema, model, Document } from 'mongoose'

export interface IDiagramScoreRecord extends Document {
  userId: string
  diagramId: string
  diagramTitle: string
  scores: {
    coupling: number
    cohesion: number
    complexity: number
    extensibility: number
    solid: number
    overall: number
  }
  timestamp: Date
}

const schema = new Schema<IDiagramScoreRecord>({
  userId: { type: String, required: true, index: true },
  diagramId: { type: String, required: true },
  diagramTitle: { type: String, default: 'Untitled' },
  scores: {
    coupling: Number,
    cohesion: Number,
    complexity: Number,
    extensibility: Number,
    solid: Number,
    overall: Number,
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false })

schema.index({ userId: 1, timestamp: -1 })

export const DiagramScoreRecord = model<IDiagramScoreRecord>('DiagramScoreRecord', schema)

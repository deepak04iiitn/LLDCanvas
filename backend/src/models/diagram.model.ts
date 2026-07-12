import { Schema, model, Document, Types } from 'mongoose'

interface DiagramMeta {
  theme: 'light' | 'dark' | 'whiteboard'
  zoom: number
  panX: number
  panY: number
}

interface DiagramData {
  version: number
  nodes: unknown[]
  edges: unknown[]
  meta: DiagramMeta
}

export interface IDiagram extends Document {
  userId: Types.ObjectId
  title: string
  thumbnail?: string
  isTemplate: boolean
  diagramData: DiagramData
  createdAt: Date
  updatedAt: Date
}

const diagramSchema = new Schema<IDiagram>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Diagram' },
    thumbnail: { type: String },
    isTemplate: { type: Boolean, default: false },
    diagramData: {
      version: { type: Number, default: 1 },
      nodes: { type: Array, default: [] },
      edges: { type: Array, default: [] },
      meta: {
        theme: { type: String, enum: ['light', 'dark', 'whiteboard'], default: 'light' },
        zoom: { type: Number, default: 1 },
        panX: { type: Number, default: 0 },
        panY: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
)

// Index for fast user-scoped queries
diagramSchema.index({ userId: 1, updatedAt: -1 })
diagramSchema.index({ isTemplate: 1 })

export const Diagram = model<IDiagram>('Diagram', diagramSchema)

import { Schema, model, Document, Types } from 'mongoose'

export interface IDiagramVersion extends Document {
  diagramId:  Types.ObjectId
  userId:     string
  userName:   string
  nodeCount:  number
  edgeCount:  number
  createdAt:  Date
}

const diagramVersionSchema = new Schema<IDiagramVersion>(
  {
    diagramId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true },
    userId:    { type: String, required: true },
    userName:  { type: String, default: 'Unknown' },
    nodeCount: { type: Number, default: 0 },
    edgeCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

diagramVersionSchema.index({ diagramId: 1, createdAt: -1 })
diagramVersionSchema.index({ userId: 1, createdAt: -1 })

export const DiagramVersion = model<IDiagramVersion>('DiagramVersion', diagramVersionSchema)

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
// Lightweight activity-timeline rows (counts only, no diagram data). The UI
// shows the latest 50, so very old rows are dead weight.
diagramVersionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000, name: 'createdAt_ttl_180d' })

export const DiagramVersion = model<IDiagramVersion>('DiagramVersion', diagramVersionSchema)

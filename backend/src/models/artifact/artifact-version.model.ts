import { Schema, model, Document, Types } from 'mongoose'

/** Full diagram snapshot for versions / evolution / UML diff. */
export interface IArtifactVersion extends Document {
  diagramId: Types.ObjectId
  userId: Types.ObjectId
  label?: string
  diagramData: Record<string, unknown>
  nodeCount: number
  edgeCount: number
  createdAt: Date
}

const artifactVersionSchema = new Schema<IArtifactVersion>(
  {
    diagramId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String },
    diagramData: { type: Schema.Types.Mixed, required: true },
    nodeCount: { type: Number, default: 0 },
    edgeCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

artifactVersionSchema.index({ diagramId: 1, createdAt: -1 })

export const ArtifactVersion = model<IArtifactVersion>('ArtifactVersion', artifactVersionSchema)

import { Schema, model, Document, Types } from 'mongoose'

export interface IDesignDecision extends Document {
  artifactId: Types.ObjectId
  elementId: string
  decision: string
  why: string
  alternatives: string
  tradeoffs: string
  userId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const designDecisionSchema = new Schema<IDesignDecision>(
  {
    artifactId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true, index: true },
    elementId: { type: String, required: true },
    decision: { type: String, required: true },
    why: { type: String, default: '' },
    alternatives: { type: String, default: '' },
    tradeoffs: { type: String, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

designDecisionSchema.index({ artifactId: 1, elementId: 1 })

export const DesignDecision = model<IDesignDecision>('DesignDecision', designDecisionSchema)

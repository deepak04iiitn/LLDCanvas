import { Schema, model, Document, Types } from 'mongoose'

export interface ICollabInvite extends Document {
  diagramId: Types.ObjectId
  email: string
  userId?: string
  role: 'editor' | 'viewer'
  status: 'pending' | 'accepted' | 'revoked'
  invitedBy: string
  token: string
  createdAt: Date
  updatedAt: Date
}

const collabInviteSchema = new Schema<ICollabInvite>(
  {
    diagramId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    userId:    { type: String },
    role:      { type: String, enum: ['editor', 'viewer'], default: 'editor' },
    status:    { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
    invitedBy: { type: String, required: true },
    token:     { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

collabInviteSchema.index({ diagramId: 1 })
collabInviteSchema.index({ email: 1, diagramId: 1 })

export const CollabInvite = model<ICollabInvite>('CollabInvite', collabInviteSchema)

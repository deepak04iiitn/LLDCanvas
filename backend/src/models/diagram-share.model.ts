import { Schema, model, Document } from 'mongoose'
import { randomBytes } from 'crypto'

function generateToken() {
  return randomBytes(15).toString('base64url') // 20 URL-safe chars
}

export interface IDiagramShare extends Document {
  diagramId: string
  ownerId:   string
  visibility: 'public' | 'private'
  permission: 'view' | 'edit'
  token:      string
  allowedEmails: string[]
  createdAt: Date
  updatedAt: Date
}

const schema = new Schema<IDiagramShare>(
  {
    diagramId:     { type: String, required: true, index: true, unique: true },
    ownerId:       { type: String, required: true },
    visibility:    { type: String, enum: ['public', 'private'], default: 'public' },
    permission:    { type: String, enum: ['view', 'edit'],      default: 'view'   },
    token:         { type: String, required: true, unique: true, default: generateToken },
    allowedEmails: { type: [String], default: [] },
  },
  { timestamps: true },
)

export const DiagramShare = model<IDiagramShare>('DiagramShare', schema)

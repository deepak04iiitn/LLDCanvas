import { Schema, model, Document } from 'mongoose'

export interface ICodeBan extends Document {
  userId:    string
  reason:    string | null
  bannedBy:  string
  createdAt: Date
}

const schema = new Schema<ICodeBan>(
  {
    userId:   { type: String, required: true, unique: true, index: true },
    reason:   { type: String, default: null },
    bannedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const CodeBan = model<ICodeBan>('CodeBan', schema)

import { Schema, model, Document, Types } from 'mongoose'

export interface IUserRevision extends Document {
  userId:     string
  noteId:     Types.ObjectId
  status:     'unread' | 'revised'
  bookmarked: boolean
  revisedAt:  Date | null
  createdAt:  Date
  updatedAt:  Date
}

const schema = new Schema<IUserRevision>(
  {
    userId:     { type: String, required: true },
    noteId:     { type: Schema.Types.ObjectId, ref: 'RevisionNote', required: true },
    status:     { type: String, enum: ['unread', 'revised'], default: 'unread' },
    bookmarked: { type: Boolean, default: false },
    revisedAt:  { type: Date, default: null },
  },
  { timestamps: true },
)

schema.index({ userId: 1, noteId: 1 }, { unique: true })
schema.index({ userId: 1, bookmarked: 1 })
schema.index({ userId: 1, status: 1 })

export const UserRevision = model<IUserRevision>('UserRevision', schema)

import { Schema, model, Document, Types } from 'mongoose'

export interface IPublishedDesign extends Document {
  diagramId: Types.ObjectId
  userId: Types.ObjectId
  slug: string
  title: string
  summary: string
  visibility: 'public' | 'unlisted' | 'private'
  featured: boolean
  thumbnail?: string
  problemId?: Types.ObjectId
  forkParentId?: Types.ObjectId
  replayEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const publishedDesignSchema = new Schema<IPublishedDesign>(
  {
    diagramId: { type: Schema.Types.ObjectId, ref: 'Diagram', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public', index: true },
    featured: { type: Boolean, default: false },
    thumbnail: { type: String },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    forkParentId: { type: Schema.Types.ObjectId, ref: 'PublishedDesign' },
    replayEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
)

publishedDesignSchema.index({ visibility: 1, featured: -1, createdAt: -1 })

export const PublishedDesign = model<IPublishedDesign>('PublishedDesign', publishedDesignSchema)

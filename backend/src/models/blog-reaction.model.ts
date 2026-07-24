import { Schema, model, Document, Types } from 'mongoose'

export interface IBlogReaction extends Document {
  blogId:  Types.ObjectId
  userId:  string
  type:    'like' | 'dislike'
}

const schema = new Schema<IBlogReaction>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: String, required: true },
    type:   { type: String, enum: ['like', 'dislike'], required: true },
  },
  { timestamps: true },
)

schema.index({ blogId: 1, userId: 1 }, { unique: true })

export const BlogReaction = model<IBlogReaction>('BlogReaction', schema)

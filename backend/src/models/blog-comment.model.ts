import { Schema, model, Document, Types } from 'mongoose'

export interface IBlogComment extends Document {
  blogId:      Types.ObjectId
  parentId?:   Types.ObjectId   // null = top-level, set = reply
  authorId:    string
  authorName:  string
  authorImage?: string
  content:     string
  likes:       number
  isDeleted:   boolean
  isReported:  boolean
  createdAt:   Date
  updatedAt:   Date
}

const schema = new Schema<IBlogComment>(
  {
    blogId:     { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    parentId:   { type: Schema.Types.ObjectId, ref: 'BlogComment', default: null },
    authorId:   { type: String, required: true },
    authorName: { type: String, required: true },
    authorImage:{ type: String },
    content:    { type: String, required: true, maxlength: 4000 },
    likes:      { type: Number, default: 0 },
    isDeleted:  { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true },
)

schema.index({ blogId: 1, parentId: 1, createdAt: -1 })

export const BlogComment = model<IBlogComment>('BlogComment', schema)

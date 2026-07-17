import { Schema, model, Document, Types } from 'mongoose'

interface CommentReply {
  authorId:   string
  authorName: string
  authorImage?: string
  content:    string
  mentions:   string[]
  createdAt:  Date
}

export interface IComment extends Document {
  diagramId:   Types.ObjectId
  authorId:    string
  authorName:  string
  authorImage?: string
  content:     string
  nodeId?:     string
  position:    { x: number; y: number }
  resolved:    boolean
  mentions:    string[]
  replies:     CommentReply[]
  createdAt:   Date
  updatedAt:   Date
}

const replySchema = new Schema<CommentReply>(
  {
    authorId:    { type: String, required: true },
    authorName:  { type: String, required: true },
    authorImage: { type: String },
    content:     { type: String, required: true },
    mentions:    [{ type: String }],
    createdAt:   { type: Date, default: Date.now },
  },
  { _id: true },
)

const commentSchema = new Schema<IComment>(
  {
    diagramId:   { type: Schema.Types.ObjectId, ref: 'Diagram', required: true },
    authorId:    { type: String, required: true },
    authorName:  { type: String, required: true },
    authorImage: { type: String },
    content:     { type: String, required: true },
    nodeId:      { type: String },
    position:    { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
    resolved:    { type: Boolean, default: false },
    mentions:    [{ type: String }],
    replies:     [replySchema],
  },
  { timestamps: true },
)

commentSchema.index({ diagramId: 1, createdAt: -1 })
commentSchema.index({ diagramId: 1, resolved: 1 })

export const Comment = model<IComment>('Comment', commentSchema)

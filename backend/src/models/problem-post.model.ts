import { Schema, model, Document, Types } from 'mongoose'

export interface IPostReply {
  _id:          Types.ObjectId
  authorId:     string
  authorName:   string
  authorImage:  string | null
  content:      string
  code:         string | null
  codeLanguage: string | null
  createdAt:    Date
}

export interface IProblemPost extends Document {
  problemId:    Types.ObjectId
  authorId:     string
  authorName:   string
  authorImage:  string | null
  title:        string
  content:      string
  code:         string | null
  codeLanguage: string | null
  type:         'question' | 'discussion' | 'solution'
  upvotes:      string[]
  replies:      IPostReply[]
  createdAt:    Date
  updatedAt:    Date
}

const replySchema = new Schema<IPostReply>(
  {
    authorId:     { type: String, required: true },
    authorName:   { type: String, default: 'Anonymous' },
    authorImage:  { type: String, default: null },
    content:      { type: String, required: true },
    code:         { type: String, default: null },
    codeLanguage: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true },
)

const problemPostSchema = new Schema<IProblemPost>(
  {
    problemId:    { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    authorId:     { type: String, required: true },
    authorName:   { type: String, default: 'Anonymous' },
    authorImage:  { type: String, default: null },
    title:        { type: String, required: true, trim: true, maxlength: 200 },
    content:      { type: String, required: true, maxlength: 10_000 },
    code:         { type: String, default: null, maxlength: 50_000 },
    codeLanguage: { type: String, default: null },
    type:         { type: String, enum: ['question', 'discussion', 'solution'], default: 'discussion' },
    upvotes:      [{ type: String }],
    replies:      [replySchema],
  },
  { timestamps: true },
)

problemPostSchema.index({ problemId: 1, createdAt: -1 })
problemPostSchema.index({ authorId: 1 })

export const ProblemPost = model<IProblemPost>('ProblemPost', problemPostSchema)

import { Schema, model, Document } from 'mongoose'

export type FeedbackType     = 'bug' | 'feature' | 'improvement' | 'other'
export type FeedbackStatus   = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

export interface IFeedback extends Document {
  type:        FeedbackType
  title:       string
  description: string
  status:      FeedbackStatus
  priority:    FeedbackPriority
  // submitter info
  userId:      string | null   // null if anonymous
  name:        string
  email:       string
  // admin meta
  adminNote:   string
  tags:        string[]
  upvotes:     number
  // environment snapshot
  pageUrl:     string
  userAgent:   string
  createdAt:   Date
  updatedAt:   Date
}

const feedbackSchema = new Schema<IFeedback>(
  {
    type:        { type: String, enum: ['bug','feature','improvement','other'], required: true },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status:      { type: String, enum: ['open','in_progress','resolved','closed','duplicate'], default: 'open', index: true },
    priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium', index: true },
    userId:      { type: String, default: null, index: true },
    name:        { type: String, default: 'Anonymous' },
    email:       { type: String, default: '' },
    adminNote:   { type: String, default: '' },
    tags:        { type: [String], default: [] },
    upvotes:     { type: Number, default: 0 },
    pageUrl:     { type: String, default: '' },
    userAgent:   { type: String, default: '' },
  },
  { timestamps: true },
)

export const Feedback = model<IFeedback>('Feedback', feedbackSchema)

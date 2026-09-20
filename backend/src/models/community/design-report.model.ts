import { Schema, model, Document, Types } from 'mongoose'

export interface IDesignReport extends Document {
  slug: string
  reason: string
  reporterId?: Types.ObjectId
  status: 'open' | 'reviewed' | 'dismissed'
  createdAt: Date
  updatedAt: Date
}

const designReportSchema = new Schema<IDesignReport>(
  {
    slug: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  },
  { timestamps: true },
)

export const DesignReport = model<IDesignReport>('DesignReport', designReportSchema)

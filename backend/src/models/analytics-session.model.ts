import { Schema, model, Document } from 'mongoose'

export interface IAnalyticsSession extends Document {
  sessionId: string         // nanoid generated in browser (sessionStorage — resets per tab)
  visitorId: string         // nanoid from localStorage (persists across tabs/restarts)
  userId: string | null     // Better Auth user id if signed in
  isReturning: boolean      // visitorId seen in a previous session
  startedAt: Date
  lastHeartbeat: Date
  currentPage: string
  totalDurationSeconds: number
  pageViews: number
  pages: string[]           // ordered list of pages visited this session
  userAgent: string
  country: string | null
}

const schema = new Schema<IAnalyticsSession>({
  sessionId:            { type: String, required: true, unique: true },
  visitorId:            { type: String, required: true },
  userId:               { type: String, default: null },
  isReturning:          { type: Boolean, default: false },
  startedAt:            { type: Date, default: Date.now },
  lastHeartbeat:        { type: Date, default: Date.now },
  currentPage:          { type: String, default: '/' },
  totalDurationSeconds: { type: Number, default: 0 },
  pageViews:            { type: Number, default: 1 },
  pages:                { type: [String], default: [] },
  userAgent:            { type: String, default: '' },
  country:              { type: String, default: null },
})

// Indexes for fast live-user and time-range queries
schema.index({ lastHeartbeat: -1 })
schema.index({ visitorId: 1 })
schema.index({ startedAt: -1 })
schema.index({ userId: 1 })

export const AnalyticsSession = model<IAnalyticsSession>('AnalyticsSession', schema)

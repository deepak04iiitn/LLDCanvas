import { Schema, model, Document } from 'mongoose'

interface DailyActivity {
  date: string          // YYYY-MM-DD
  sessionCount: number
  timeSeconds: number
}

export interface IPracticeStats extends Document {
  userId: string
  totalSessions: number
  totalTimeSeconds: number
  longestStreakDays: number
  currentStreakDays: number
  lastPracticeDate: string | null  // YYYY-MM-DD
  dailyActivity: DailyActivity[]
  updatedAt: Date
}

const schema = new Schema<IPracticeStats>(
  {
    userId:             { type: String, required: true, unique: true },
    totalSessions:      { type: Number, default: 0 },
    totalTimeSeconds:   { type: Number, default: 0 },
    longestStreakDays:  { type: Number, default: 0 },
    currentStreakDays:  { type: Number, default: 0 },
    lastPracticeDate:   { type: String, default: null },
    dailyActivity: [{
      date:         { type: String, required: true },
      sessionCount: { type: Number, default: 0 },
      timeSeconds:  { type: Number, default: 0 },
    }],
  },
  { timestamps: true },
)

export const PracticeStats = model<IPracticeStats>('PracticeStats', schema)

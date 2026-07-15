import { Request, Response, NextFunction } from 'express'
import { PracticeStats } from '../models/practice-stats.model'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// GET /stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await PracticeStats.findOne({ userId: req.user!.id }).lean()
    if (!stats) {
      return res.json({
        totalSessions:    0,
        totalTimeSeconds: 0,
        longestStreakDays: 0,
        currentStreakDays: 0,
        lastPracticeDate:  null,
        dailyActivity:     [],
      })
    }
    res.json(stats)
  } catch (err) {
    next(err)
  }
}

// POST /stats/sync  — called when a session completes
// Body: { timeElapsed: number }
export async function syncStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { timeElapsed = 0 } = req.body as { timeElapsed?: number }
    const today     = todayISO()
    const yesterday = yesterdayISO()

    // Upsert the stats document
    let stats = await PracticeStats.findOne({ userId: req.user!.id })
    if (!stats) {
      stats = new PracticeStats({ userId: req.user!.id })
    }

    // Update totals
    stats.totalSessions    += 1
    stats.totalTimeSeconds += timeElapsed

    // Update streak
    if (stats.lastPracticeDate === today) {
      // Already practiced today — no streak change
    } else if (stats.lastPracticeDate === yesterday) {
      stats.currentStreakDays += 1
    } else {
      stats.currentStreakDays = 1
    }
    stats.longestStreakDays = Math.max(stats.longestStreakDays, stats.currentStreakDays)
    stats.lastPracticeDate  = today

    // Upsert daily activity entry
    const dayIdx = stats.dailyActivity.findIndex(d => d.date === today)
    if (dayIdx >= 0) {
      stats.dailyActivity[dayIdx].sessionCount += 1
      stats.dailyActivity[dayIdx].timeSeconds  += timeElapsed
    } else {
      stats.dailyActivity.push({ date: today, sessionCount: 1, timeSeconds: timeElapsed })
    }

    // Keep only the last 400 days to avoid unbounded growth
    if (stats.dailyActivity.length > 400) {
      stats.dailyActivity = stats.dailyActivity.slice(-400)
    }

    await stats.save()
    res.json({ ok: true, stats })
  } catch (err) {
    next(err)
  }
}

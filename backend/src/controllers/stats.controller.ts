import { Request, Response, NextFunction } from 'express'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth,
         subWeeks, subMonths, format, getISOWeek, getYear } from 'date-fns'
import { PracticeStats } from '../models/practice-stats.model'
import { InterviewSession } from '../models/interview-session.model'
import { UserSolution } from '../models/user-solution.model'

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

// GET /stats/advanced
export async function getAdvancedStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    const [stats, sessions, totalProblems] = await Promise.all([
      PracticeStats.findOne({ userId }).lean(),
      InterviewSession.find({ userId, status: 'completed' })
        .sort({ completedAt: -1 })
        .limit(200)
        .lean(),
      UserSolution.countDocuments({ userId }),
    ])

    const activity = stats?.dailyActivity ?? []

    // ── Helper: ISO week key ──────────────────────────────────────────────────
    function weekKey(d: Date) {
      return `${getYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`
    }

    // ── Weekly reports (last 12 weeks) ────────────────────────────────────────
    const now = new Date()
    const weeklyReports = []
    for (let i = 11; i >= 0; i--) {
      const ref   = subWeeks(now, i)
      const start = startOfWeek(ref, { weekStartsOn: 1 })
      const end   = endOfWeek(ref, { weekStartsOn: 1 })
      const startStr = format(start, 'yyyy-MM-dd')
      const endStr   = format(end,   'yyyy-MM-dd')

      const days = activity.filter(d => d.date >= startStr && d.date <= endStr)
      const wSessions = days.reduce((s, d) => s + d.sessionCount, 0)
      const wTime     = days.reduce((s, d) => s + d.timeSeconds,  0)
      const wAvg      = wSessions > 0 ? Math.round(wTime / wSessions) : 0

      const wProblems = await UserSolution.countDocuments({
        userId,
        createdAt: { $gte: start, $lte: end },
      })

      weeklyReports.push({
        weekStart:      startStr,
        weekLabel:      `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`,
        sessions:       wSessions,
        timeSeconds:    wTime,
        avgTimeSeconds: wAvg,
        problemsSolved: wProblems,
      })
    }

    // ── Monthly reports (last 12 months) ─────────────────────────────────────
    const monthlyReports = []
    for (let i = 11; i >= 0; i--) {
      const ref   = subMonths(now, i)
      const start = startOfMonth(ref)
      const end   = endOfMonth(ref)
      const startStr = format(start, 'yyyy-MM-dd')
      const endStr   = format(end,   'yyyy-MM-dd')

      const days = activity.filter(d => d.date >= startStr && d.date <= endStr)
      const mSessions = days.reduce((s, d) => s + d.sessionCount, 0)
      const mTime     = days.reduce((s, d) => s + d.timeSeconds,  0)
      const mAvg      = mSessions > 0 ? Math.round(mTime / mSessions) : 0

      const mProblems = await UserSolution.countDocuments({
        userId,
        createdAt: { $gte: start, $lte: end },
      })

      monthlyReports.push({
        month:          format(start, 'MMM yyyy'),
        sessions:       mSessions,
        timeSeconds:    mTime,
        avgTimeSeconds: mAvg,
        problemsSolved: mProblems,
      })
    }

    // ── Avg time computation ─────────────────────────────────────────────────
    const completedSessions = sessions.filter(s => s.timeElapsed > 0)
    const avgTimePerSession = completedSessions.length
      ? Math.round(completedSessions.reduce((s, c) => s + c.timeElapsed, 0) / completedSessions.length)
      : 0

    const thisWeekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const thisWeekEnd   = format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const lastWeekStart = format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const lastWeekEnd   = format(endOfWeek(subWeeks(now, 1),   { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const thisWeekSessions = completedSessions.filter(s => {
      const d = format(new Date(s.completedAt!), 'yyyy-MM-dd')
      return d >= thisWeekStart && d <= thisWeekEnd
    })
    const lastWeekSessions = completedSessions.filter(s => {
      const d = format(new Date(s.completedAt!), 'yyyy-MM-dd')
      return d >= lastWeekStart && d <= lastWeekEnd
    })

    const avgTimeThisWeek = thisWeekSessions.length
      ? Math.round(thisWeekSessions.reduce((s, c) => s + c.timeElapsed, 0) / thisWeekSessions.length)
      : 0
    const avgTimeLastWeek = lastWeekSessions.length
      ? Math.round(lastWeekSessions.reduce((s, c) => s + c.timeElapsed, 0) / lastWeekSessions.length)
      : 0

    let improvementPercent: number | null = null
    if (avgTimeLastWeek > 0 && avgTimeThisWeek > 0) {
      // Positive = getting faster (took less time this week)
      improvementPercent = Math.round(((avgTimeLastWeek - avgTimeThisWeek) / avgTimeLastWeek) * 100)
    }

    // ── Trend data (last 16 weeks avg session minutes) ────────────────────────
    const trendData = []
    for (let i = 15; i >= 0; i--) {
      const ref   = subWeeks(now, i)
      const wStart = format(startOfWeek(ref, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const wEnd   = format(endOfWeek(ref,   { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const wLabel = format(startOfWeek(ref, { weekStartsOn: 1 }), 'MMM d')

      const wSessions = completedSessions.filter(s => {
        const d = format(new Date(s.completedAt!), 'yyyy-MM-dd')
        return d >= wStart && d <= wEnd
      })
      const wAvgMins = wSessions.length
        ? Math.round(wSessions.reduce((s, c) => s + c.timeElapsed, 0) / wSessions.length / 60 * 10) / 10
        : 0

      trendData.push({ weekLabel: wLabel, avgMinutes: wAvgMins })
    }

    // ── Personal bests ────────────────────────────────────────────────────────
    const longestSession = completedSessions.reduce<typeof completedSessions[0] | null>((best, s) =>
      !best || s.timeElapsed > best.timeElapsed ? s : best, null)

    const fastestSession = completedSessions.filter(s => s.timeElapsed > 30).reduce<typeof completedSessions[0] | null>((best, s) =>
      !best || s.timeElapsed < best.timeElapsed ? s : best, null)

    const bestDay = activity.reduce<{ date: string; sessions: number; timeSeconds: number } | null>((best, d) =>
      !best || d.timeSeconds > best.timeSeconds ? { date: d.date, sessions: d.sessionCount, timeSeconds: d.timeSeconds } : best, null)

    const bestWeekData = weeklyReports.reduce<typeof weeklyReports[0] | null>((best, w) =>
      !best || w.timeSeconds > best.timeSeconds ? w : best, null)

    res.json({
      avgTimePerSession,
      avgTimeThisWeek,
      avgTimeLastWeek,
      improvementPercent,
      weeklyReports,
      monthlyReports,
      trendData,
      personalBests: {
        longestStreakDays:  stats?.longestStreakDays ?? 0,
        longestSession: longestSession ? {
          timeSeconds: longestSession.timeElapsed,
          title:       longestSession.title,
          date:        format(new Date(longestSession.completedAt!), 'MMM d, yyyy'),
        } : null,
        fastestSession: fastestSession ? {
          timeSeconds: fastestSession.timeElapsed,
          title:       fastestSession.title,
          date:        format(new Date(fastestSession.completedAt!), 'MMM d, yyyy'),
        } : null,
        bestDay,
        bestWeek: bestWeekData ? {
          weekLabel:   bestWeekData.weekLabel,
          sessions:    bestWeekData.sessions,
          timeSeconds: bestWeekData.timeSeconds,
        } : null,
        totalProblems,
      },
    })
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

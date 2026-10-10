/**
 * Per-feature user activity analytics.
 * Aggregates from the feature-specific attempt/solve/run models,
 * then joins with the User model for name/email enrichment.
 */
import { Request, Response, NextFunction } from 'express'
import { User }              from '../../../models/user.model'
import { QuizAttempt }       from '../../../models/learn/quiz-attempt.model'
import { DetectiveAttempt }  from '../../../models/learn/detective-attempt.model'
import { DebuggerSolve }     from '../../../models/learn/debugger-solve.model'
import { RoguelikeRun }      from '../../../models/learn/roguelike-run.model'
import { JourneyActivity }   from '../../../models/journey/journey-activity.model'
import { AnalyticsSession }  from '../../../models/analytics-session.model'

// Map of challenge pack type → readable label
const STUDIO_TYPE_TO_LABEL: Record<string, string> = {
  debugger:   'Debug and Fix',
  refactor:   'Refactor',
  change_one: 'Change One Thing',
  evolution:  'Evolution',
  budget:     'Budget Pressure',
}

// Map feature slug → studio pack type
const SLUG_TO_PACK_TYPE: Record<string, string> = {
  'debug-fix':  'debugger',
  refactor:     'refactor',
  'change-one': 'change_one',
  evolution:    'evolution',
  budget:       'budget',
}

// ─── Activity row shape ───────────────────────────────────────────────────────

interface ActivityRow {
  userId:    string
  action?:   string
  timestamp: Date
}

async function getActivities(slug: string, since: Date): Promise<ActivityRow[]> {
  switch (slug) {
    case 'daily-quiz': {
      const docs = await QuizAttempt.find({ createdAt: { $gte: since } })
        .select('userId createdAt correctCount total').lean()
      return docs.map(d => {
        const correct = d.correctCount ?? 0
        const total   = d.total ?? 0
        return {
          userId: String(d.userId),
          timestamp: (d as { createdAt?: Date }).createdAt ?? new Date(),
          action: total > 0 ? `Scored ${correct}/${total}` : 'Quiz attempt',
        }
      })
    }
    case 'detective': {
      const docs = await DetectiveAttempt.find({ timestamp: { $gte: since } })
        .select('userId timestamp isCorrect').lean()
      return docs.map(d => ({ userId: String(d.userId), timestamp: d.timestamp, action: d.isCorrect ? 'Correct answer' : 'Attempt' }))
    }
    case 'debug-lab': {
      const docs = await DebuggerSolve.find({ solvedAt: { $gte: since } })
        .select('userId solvedAt isSolved').lean()
      return docs.map(d => ({ userId: String(d.userId), timestamp: d.solvedAt, action: d.isSolved ? 'Solved' : 'Attempted' }))
    }
    case 'roguelike': {
      const docs = await RoguelikeRun.find({ startedAt: { $gte: since } })
        .select('userId startedAt status').lean()
      return docs.map(d => ({ userId: String(d.userId), timestamp: d.startedAt, action: `Run ${d.status}` }))
    }
    case 'plannr': {
      const docs = await JourneyActivity.find({ completedAt: { $gte: since } })
        .select('userId completedAt activityType').lean()
      return docs.map(d => ({ userId: String(d.userId), timestamp: d.completedAt, action: d.activityType }))
    }
    default: {
      // Studio features — use analytics sessions filtering by page URL
      const packType = SLUG_TO_PACK_TYPE[slug]
      if (!packType) return []
      // Look for sessions that visited the design-studio page
      const pagePath = `/dashboard/design-studio`
      const docs = await AnalyticsSession.find({
        startedAt: { $gte: since },
        pages: { $elemMatch: { $regex: pagePath, $options: 'i' } },
        userId: { $ne: null },
      }).select('userId startedAt').lean()
      return docs.map(d => ({
        userId: String(d.userId),
        timestamp: d.startedAt,
        action: `Opened ${STUDIO_TYPE_TO_LABEL[packType] ?? slug}`,
      }))
    }
  }
}

// ─── Daily activity helper ────────────────────────────────────────────────────

function buildDailyActivity(rows: ActivityRow[], days: number): { date: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const day = r.timestamp.toISOString().slice(0, 10)
    map[day] = (map[day] ?? 0) + 1
  }
  // Fill missing days with 0
  const result: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map[key] ?? 0 })
  }
  return result
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function getFeatureActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
    const days = Math.min(90, Math.max(1, Number(req.query.days ?? 30)))

    const since = new Date(Date.now() - days * 86_400_000)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 86_400_000)

    const allRows = await getActivities(slug, since)

    const uniqueUserIds  = [...new Set(allRows.map(r => r.userId))].filter(Boolean)
    const todayRows      = allRows.filter(r => r.timestamp >= today)
    const weekRows       = allRows.filter(r => r.timestamp >= weekAgo)
    const todayUserIds   = [...new Set(todayRows.map(r => r.userId))].filter(Boolean)
    const weekUserIds    = [...new Set(weekRows.map(r => r.userId))].filter(Boolean)

    // Enrich with user details (fetch only unique users)
    const userDocs = await User.find({ _id: { $in: uniqueUserIds } }).select('name email').lean()
    const userMap: Record<string, { name: string; email: string }> = {}
    for (const u of userDocs) userMap[String(u._id)] = { name: u.name, email: u.email }

    // Recent activity feed (last 30 events, newest first)
    const recentActivity = [...allRows]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 30)
      .map(r => ({
        userId:    r.userId,
        userName:  userMap[r.userId]?.name  ?? 'Unknown',
        userEmail: userMap[r.userId]?.email ?? '',
        action:    r.action ?? 'Activity',
        timestamp: r.timestamp.toISOString(),
      }))

    // Daily breakdown
    const dailyActivity = buildDailyActivity(allRows, days)

    // Most active users
    const userActivityCount: Record<string, number> = {}
    for (const r of allRows) userActivityCount[r.userId] = (userActivityCount[r.userId] ?? 0) + 1
    const topUsers = Object.entries(userActivityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([uid, count]) => ({
        userId:    uid,
        userName:  userMap[uid]?.name  ?? 'Unknown',
        userEmail: userMap[uid]?.email ?? '',
        count,
      }))

    res.json({
      activeToday:      todayUserIds.length,
      activeThisWeek:   weekUserIds.length,
      activeThisPeriod: uniqueUserIds.length,
      totalActions:     allRows.length,
      dailyActivity,
      recentActivity,
      topUsers,
    })
  } catch (e) { next(e) }
}

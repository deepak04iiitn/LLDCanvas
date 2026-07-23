import { Request, Response, NextFunction } from 'express'
import { AnalyticsSession } from '../models/analytics-session.model'

// A visitor is "live" if they heartbeated within the last 2 minutes
const LIVE_WINDOW_MS = 2 * 60 * 1000

export const analyticsController = {

  /**
   * POST /analytics/heartbeat
   * Called every 30 s by the frontend. Creates or updates the browser session.
   */
  heartbeat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        sessionId,
        visitorId,
        userId = null,
        page = '/',
        durationDelta = 0,   // seconds since last heartbeat
      } = req.body as {
        sessionId: string
        visitorId: string
        userId?: string | null
        page?: string
        durationDelta?: number
      }

      if (!sessionId || !visitorId) {
        res.status(400).json({ error: 'sessionId and visitorId are required' })
        return
      }

      const now = new Date()

      // Determine if this visitor has been seen in a previous session (only matters for new docs)
      const isReturning = !!(await AnalyticsSession.exists({
        visitorId,
        sessionId: { $ne: sessionId },
      }))

      // Atomic upsert — $setOnInsert only runs when the document is being created,
      // preventing race conditions when concurrent heartbeats arrive simultaneously.
      const result = await AnalyticsSession.findOneAndUpdate(
        { sessionId },
        {
          $setOnInsert: {
            visitorId,
            isReturning,
            startedAt:   now,
            userAgent:   req.headers['user-agent'] ?? '',
            pageViews:   1,
            pages:       [page],
            totalDurationSeconds: 0,
          },
          $set: {
            lastHeartbeat: now,
            currentPage:   page,
            ...(userId ? { userId } : {}),
          },
          $inc: {
            totalDurationSeconds: Math.max(0, durationDelta),
          },
        },
        { upsert: true, new: false } // new:false → returns the doc BEFORE update (null if inserted)
      )

      // For existing sessions: track new page visits
      const wasExisting = result !== null
      if (wasExisting && page && result.currentPage !== page) {
        await AnalyticsSession.updateOne(
          { sessionId },
          { $push: { pages: page }, $inc: { pageViews: 1 } }
        )
      }

      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}

// ─── Admin analytics queries (used by admin overview) ─────────────────────────

export async function getLiveMetrics() {
  const now = new Date()
  const liveThreshold  = new Date(now.getTime() - LIVE_WINDOW_MS)
  const todayStart     = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const weekStart      = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
  const monthStart     = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    liveSessions,
    dauSessions,
    wauSessions,
    mauSessions,
    avgDurationAgg,
    returningAgg,
    topPagesAgg,
    hourlyAgg,
  ] = await Promise.all([
    // Live users (heartbeat in last 2 min)
    AnalyticsSession.countDocuments({ lastHeartbeat: { $gte: liveThreshold } }),

    // DAU — unique visitors today
    AnalyticsSession.distinct('visitorId', { startedAt: { $gte: todayStart } }),

    // WAU — unique visitors this week
    AnalyticsSession.distinct('visitorId', { startedAt: { $gte: weekStart } }),

    // MAU — unique visitors this month
    AnalyticsSession.distinct('visitorId', { startedAt: { $gte: monthStart } }),

    // Average session duration (seconds)
    AnalyticsSession.aggregate([
      { $match: { startedAt: { $gte: monthStart } } },
      { $group: { _id: null, avg: { $avg: '$totalDurationSeconds' }, total: { $sum: '$totalDurationSeconds' } } },
    ]),

    // Returning vs new ratio (last 30 days)
    AnalyticsSession.aggregate([
      { $match: { startedAt: { $gte: monthStart } } },
      { $group: { _id: '$isReturning', count: { $sum: 1 } } },
    ]),

    // Top 10 pages (last 30 days)
    AnalyticsSession.aggregate([
      { $match: { startedAt: { $gte: monthStart } } },
      { $unwind: '$pages' },
      { $group: { _id: '$pages', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),

    // Hourly active sessions for the last 24 hours
    AnalyticsSession.aggregate([
      { $match: { lastHeartbeat: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%dT%H:00', date: '$lastHeartbeat' },
        },
        users: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]),
  ])

  const avgDuration = avgDurationAgg[0]?.avg ?? 0
  const totalDuration = avgDurationAgg[0]?.total ?? 0

  const returningMap = new Map(returningAgg.map((r: { _id: boolean; count: number }) => [r._id, r.count]))
  const newCount = returningMap.get(false) ?? 0
  const returningCount = returningMap.get(true) ?? 0
  const totalSessions = newCount + returningCount
  const returningRate = totalSessions > 0 ? Math.round((returningCount / totalSessions) * 100) : 0

  return {
    live: liveSessions,
    dau:  dauSessions.length,
    wau:  wauSessions.length,
    mau:  mauSessions.length,
    avgSessionSeconds: Math.round(avgDuration),
    totalTimeSeconds:  Math.round(totalDuration),
    returningRate,
    newSessions:       newCount,
    returningSessions: returningCount,
    topPages: topPagesAgg.map((p: { _id: string; views: number }) => ({ page: p._id, views: p.views })),
    hourlyActiveUsers: hourlyAgg.map((h: { _id: string; users: number }) => ({ hour: h._id, users: h.users })),
  }
}

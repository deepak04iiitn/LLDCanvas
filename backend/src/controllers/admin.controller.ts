import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { getMongoClient } from '../config/auth'
import { Diagram } from '../models/diagram.model'
import { InterviewSession } from '../models/interview-session.model'
import { getLiveMetrics } from './analytics.controller'
import { createError } from '../middleware/error'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function daysAgo(n: number) {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

async function userCollection() {
  const client = await getMongoClient()
  return client.db().collection('user')
}

async function authSessionCollection() {
  const client = await getMongoClient()
  return client.db().collection('session')
}

// ─── Overview / Stats ─────────────────────────────────────────────────────────

export const adminController = {

  getOverview: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userCollection()
      const authSessions = await authSessionCollection()

      const now = new Date()
      const todayStart = startOfDay(now)
      const weekStart = daysAgo(7)
      const monthStart = daysAgo(30)

      const [
        totalUsers,
        newToday,
        newThisWeek,
        blockedCount,
        totalDiagrams,
        newDiagramsToday,
        totalSessions,
        completedSessions,
        activeSessions,
        practiceTimeAgg,
        activeToday,
      ] = await Promise.all([
        users.countDocuments(),
        users.countDocuments({ createdAt: { $gte: todayStart } }),
        users.countDocuments({ createdAt: { $gte: weekStart } }),
        users.countDocuments({ blocked: true }),
        Diagram.countDocuments({ isTemplate: false }),
        Diagram.countDocuments({ isTemplate: false, createdAt: { $gte: todayStart } }),
        InterviewSession.countDocuments(),
        InterviewSession.countDocuments({ status: 'completed' }),
        InterviewSession.countDocuments({ status: 'active' }),
        InterviewSession.aggregate([{ $group: { _id: null, total: { $sum: '$timeElapsed' } } }]),
        authSessions.distinct('userId', { createdAt: { $gte: todayStart } }),
      ])

      const totalPracticeSeconds = practiceTimeAgg[0]?.total ?? 0

      // ── 30-day user growth (one bucket per day) ────────────────────
      const userGrowth = await users.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]).toArray()

      // ── 30-day diagram activity ────────────────────────────────────
      const diagramActivity = await Diagram.aggregate([
        { $match: { isTemplate: false, createdAt: { $gte: monthStart } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ])

      // ── 30-day session activity ────────────────────────────────────
      const sessionActivity = await InterviewSession.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ])

      // ── Top 5 users by diagram count ───────────────────────────────
      const topUsersByDiagrams = await Diagram.aggregate([
        { $match: { isTemplate: false } },
        { $group: { _id: '$userId', diagrams: { $sum: 1 } } },
        { $sort: { diagrams: -1 } },
        { $limit: 5 },
      ])

      const topUserIds = topUsersByDiagrams.map(u => u._id.toString())
      const topUsersInfo = await users.find(
        { _id: { $in: topUserIds.map(id => new ObjectId(id)) } },
        { projection: { _id: 1, name: 1, email: 1 } }
      ).toArray()

      const topUsers = topUsersByDiagrams.map(u => {
        const info = topUsersInfo.find(i => i._id.toString() === u._id.toString())
        return { id: u._id, name: info?.name ?? 'Unknown', email: info?.email ?? '', diagrams: u.diagrams }
      })

      // ── Session status breakdown ───────────────────────────────────
      const abandonedSessions = await InterviewSession.countDocuments({ status: 'abandoned' })

      res.json({
        stats: {
          totalUsers,
          newToday,
          newThisWeek,
          blockedCount,
          activeToday: activeToday.length,
          totalDiagrams,
          newDiagramsToday,
          totalSessions,
          completedSessions,
          activeSessions,
          abandonedSessions,
          totalPracticeSeconds,
        },
        charts: {
          userGrowth,
          diagramActivity,
          sessionActivity,
          sessionStatus: [
            { name: 'Completed', value: completedSessions },
            { name: 'Active', value: activeSessions },
            { name: 'Abandoned', value: abandonedSessions },
          ],
          topUsers,
        },
      })
    } catch (err) {
      next(err)
    }
  },

  // ─── Users ──────────────────────────────────────────────────────────────────

  listUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userCollection()
      const page  = Math.max(1, Number(req.query.page)  || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q      = typeof req.query.q      === 'string' ? req.query.q.trim()      : ''
      const filter = typeof req.query.filter === 'string' ? req.query.filter        : 'all'
      const from   = typeof req.query.from   === 'string' ? req.query.from.trim()   : ''
      const to     = typeof req.query.to     === 'string' ? req.query.to.trim()     : ''

      const match: Record<string, unknown> = {}
      if (q) match.$or = [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
      if (filter === 'blocked') match.blocked = true
      if (filter === 'admin')   match.isAdmin = true
      if (filter === 'active')  match.blocked = { $ne: true }

      // Date range on createdAt (joined date)
      if (from || to) {
        const dateFilter: Record<string, Date> = {}
        if (from) dateFilter.$gte = new Date(from)
        if (to) {
          const toDate = new Date(to)
          toDate.setUTCHours(23, 59, 59, 999)   // inclusive: end of the chosen day
          dateFilter.$lte = toDate
        }
        match.createdAt = dateFilter
      }

      const [total, rawUsers] = await Promise.all([
        users.countDocuments(match),
        users.find(match, {
          projection: { _id: 1, name: 1, email: 1, image: 1, isAdmin: 1, blocked: 1, createdAt: 1, updatedAt: 1 },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
      ])

      // Attach diagram + session counts per user
      const userIds = rawUsers.map(u => u._id.toString())
      const [diagramCounts, sessionCounts] = await Promise.all([
        Diagram.aggregate([
          { $match: { userId: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }, isTemplate: false } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]).catch(() => []),
        InterviewSession.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]),
      ])

      const dcMap = new Map(diagramCounts.map((d: { _id: unknown; count: number }) => [d._id?.toString(), d.count]))
      const scMap = new Map(sessionCounts.map((s: { _id: string; count: number }) => [s._id, s.count]))

      const enriched = rawUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        isAdmin: u.isAdmin ?? false,
        blocked: u.blocked ?? false,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        diagramCount: dcMap.get(u._id.toString()) ?? 0,
        sessionCount: scMap.get(u._id.toString()) ?? 0,
      }))

      res.json({ users: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  getUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userCollection()
      const user = await users.findOne({ _id: new ObjectId(req.params.id as string) })
      if (!user) throw createError('User not found', 404)

      const userId = user._id.toString()
      const [diagrams, sessions] = await Promise.all([
        Diagram.find({ userId, isTemplate: false })
          .select('_id title createdAt updatedAt')
          .sort({ updatedAt: -1 })
          .limit(10)
          .lean(),
        InterviewSession.find({ userId })
          .select('_id title status durationLimit timeElapsed createdAt')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ])

      res.json({
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          isAdmin: user.isAdmin ?? false,
          blocked: user.blocked ?? false,
          createdAt: user.createdAt,
        },
        diagrams,
        sessions,
      })
    } catch (err) {
      next(err)
    }
  },

  toggleBlock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userCollection()
      const user = await users.findOne({ _id: new ObjectId(req.params.id as string) })
      if (!user) throw createError('User not found', 404)
      if (user.isAdmin) throw createError('Cannot block an admin user', 400)

      const newBlocked = !user.blocked
      await users.updateOne({ _id: new ObjectId(req.params.id as string) }, { $set: { blocked: newBlocked } })
      res.json({ ok: true, blocked: newBlocked })
    } catch (err) {
      next(err)
    }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userCollection()
      const user = await users.findOne({ _id: new ObjectId(req.params.id as string) })
      if (!user) throw createError('User not found', 404)
      if (user.isAdmin) throw createError('Cannot delete an admin user', 400)

      const userId = user._id.toString()
      await Promise.all([
        users.deleteOne({ _id: new ObjectId(req.params.id as string) }),
        Diagram.deleteMany({ userId }),
        InterviewSession.deleteMany({ userId }),
      ])
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ─── Diagrams ───────────────────────────────────────────────────────────────

  listDiagrams: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
      const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : ''

      const match: Record<string, unknown> = { isTemplate: false }
      if (q) match.title = { $regex: q, $options: 'i' }
      if (userId) match.userId = userId

      const [total, diagrams] = await Promise.all([
        Diagram.countDocuments(match),
        Diagram.find(match)
          .select('_id title userId thumbnail createdAt updatedAt diagramData')
          .sort({ updatedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Attach owner info
      const userIds = [...new Set(diagrams.map(d => d.userId.toString()))]
      const users = await userCollection()
      const owners = await users.find(
        { _id: { $in: userIds.map(id => new ObjectId(id)) } },
        { projection: { _id: 1, name: 1, email: 1 } }
      ).toArray()
      const ownerMap = new Map(owners.map(o => [o._id.toString(), { name: o.name, email: o.email }]))

      const enriched = diagrams.map(d => ({
        id: d._id.toString(),
        title: d.title,
        userId: d.userId.toString(),
        owner: ownerMap.get(d.userId.toString()) ?? { name: 'Unknown', email: '' },
        nodeCount: (d.diagramData?.nodes as unknown[])?.length ?? 0,
        edgeCount: (d.diagramData?.edges as unknown[])?.length ?? 0,
        thumbnail: d.thumbnail ?? null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))

      res.json({ diagrams: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  deleteDiagram: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const diagram = await Diagram.findById(req.params.id)
      if (!diagram) throw createError('Diagram not found', 404)
      await diagram.deleteOne()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ─── Sessions ───────────────────────────────────────────────────────────────

  listSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
      const status = typeof req.query.status === 'string' ? req.query.status : 'all'
      const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : ''

      const match: Record<string, unknown> = {}
      if (q) match.title = { $regex: q, $options: 'i' }
      if (status !== 'all') match.status = status
      if (userId) match.userId = userId

      const [total, sessions] = await Promise.all([
        InterviewSession.countDocuments(match),
        InterviewSession.find(match)
          .select('_id title userId status durationLimit timeElapsed startedAt completedAt createdAt')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Attach user info
      const userIds = [...new Set(sessions.map(s => s.userId))]
      const users = await userCollection()
      const sessionUsers = await users.find(
        { _id: { $in: userIds.map(id => new ObjectId(id)) } },
        { projection: { _id: 1, name: 1, email: 1 } }
      ).toArray()
      const userMap = new Map(sessionUsers.map(u => [u._id.toString(), { name: u.name, email: u.email }]))

      const enriched = sessions.map(s => ({
        id: s._id.toString(),
        title: s.title,
        userId: s.userId,
        user: userMap.get(s.userId) ?? { name: 'Unknown', email: '' },
        status: s.status,
        durationLimit: s.durationLimit,
        timeElapsed: s.timeElapsed,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
      }))

      res.json({ sessions: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  deleteSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await InterviewSession.findById(req.params.id)
      if (!session) throw createError('Session not found', 404)
      await session.deleteOne()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ─── Live / behavioural analytics ──────────────────────────────────────────

  getAnalytics: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await getLiveMetrics()
      res.json(metrics)
    } catch (err) {
      next(err)
    }
  },
}

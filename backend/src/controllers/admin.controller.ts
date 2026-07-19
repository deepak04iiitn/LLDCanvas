import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { getMongoClient } from '../config/auth'
import { Diagram } from '../models/diagram.model'
import { InterviewSession } from '../models/interview-session.model'
import { Problem } from '../models/problem.model'
import { UserSolution } from '../models/user-solution.model'
import { RevisionNote } from '../models/revision-note.model'
import { UserRevision } from '../models/user-revision.model'
import { CollabInvite } from '../models/collab-invite.model'
import { Comment } from '../models/comment.model'
import { DiagramShare } from '../models/diagram-share.model'
import { DiagramVersion } from '../models/diagram-version.model'
import { CodeExecutionLog } from '../models/code-execution-log.model'
import { CodeBan } from '../models/code-ban.model'
import { getLiveMetrics } from './analytics.controller'
import { createError } from '../middleware/error'
import { Subscription } from '../models/subscription.model'
import { RevenueEvent } from '../models/revenue-event.model'
import { User } from '../models/user.model'
import { PRICING, type PlanName } from '../config/plans'

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

// True MRR — the normalized monthly value of every currently-active paid
// subscription (yearly plans divided by 12), not "cash collected this
// calendar month" (which spikes on yearly renewals and says nothing about
// the recurring run-rate). ARR is just this figure annualized.
async function computeMRR(): Promise<number> {
  const activeSubs = await Subscription
    .find({ status: 'active', plan: { $in: ['pro', 'ultimate'] } })
    .select('plan billingInterval')
    .lean()

  let mrr = 0
  for (const s of activeSubs) {
    const pricing = PRICING[s.plan as 'pro' | 'ultimate']
    if (!pricing) continue
    mrr += s.billingInterval === 'yearly' ? pricing.yearly.INR / 12 : pricing.monthly.INR
  }
  return Math.round(mrr)
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

  // ─── Enhanced overview (new platform features) ───────────────────────────────

  getNewFeatureStats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const monthStart = daysAgo(30)

      const [
        totalProblems, activeProblems,
        totalSolutions, submittedSolutions,
        totalRevisionNotes, activeRevisionNotes,
        totalRevisions, totalBookmarks,
        totalCollabInvites, acceptedInvites, pendingInvites,
        totalComments, resolvedComments,
        totalSharedDiagrams, publicSharedDiagrams,
        totalVersions,
        recentSolutions, recentInvites, recentComments,
      ] = await Promise.all([
        Problem.countDocuments(),
        Problem.countDocuments({ isActive: true }),
        UserSolution.countDocuments(),
        UserSolution.countDocuments({ status: 'submitted' }),
        RevisionNote.countDocuments(),
        RevisionNote.countDocuments({ isActive: true }),
        UserRevision.countDocuments({ status: 'revised' }),
        UserRevision.countDocuments({ bookmarked: true }),
        CollabInvite.countDocuments(),
        CollabInvite.countDocuments({ status: 'accepted' }),
        CollabInvite.countDocuments({ status: 'pending' }),
        Comment.countDocuments(),
        Comment.countDocuments({ resolved: true }),
        DiagramShare.countDocuments(),
        DiagramShare.countDocuments({ visibility: 'public' }),
        DiagramVersion.countDocuments(),
        UserSolution.countDocuments({ createdAt: { $gte: monthStart } }),
        CollabInvite.countDocuments({ createdAt: { $gte: monthStart } }),
        Comment.countDocuments({ createdAt: { $gte: monthStart } }),
      ])

      // Problems by difficulty
      const problemsByDifficulty = await Problem.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])

      // Top attempted problems
      const topProblems = await UserSolution.aggregate([
        { $group: { _id: '$problemId', attempts: { $sum: 1 }, submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } } } },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
      ])
      const topProblemIds = topProblems.map(p => p._id)
      const topProblemDocs = await Problem.find({ _id: { $in: topProblemIds } }).select('_id title difficulty').lean()
      const topProblemsEnriched = topProblems.map(p => {
        const doc = topProblemDocs.find(d => d._id.toString() === p._id?.toString())
        return { title: doc?.title ?? 'Unknown', difficulty: doc?.difficulty ?? '?', attempts: p.attempts, submitted: p.submitted }
      })

      // Revision notes by category
      const revisionByCategory = await RevisionNote.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 8 },
      ])

      // Collab activity last 30 days
      const collabActivity = await CollabInvite.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])

      res.json({
        problems: { total: totalProblems, active: activeProblems, inactive: totalProblems - activeProblems, problemsByDifficulty, topProblems: topProblemsEnriched },
        solutions: { total: totalSolutions, submitted: submittedSolutions, inProgress: totalSolutions - submittedSolutions, recentMonth: recentSolutions },
        revision: { totalNotes: totalRevisionNotes, activeNotes: activeRevisionNotes, totalRevisions, totalBookmarks, revisionByCategory },
        collab: { totalInvites: totalCollabInvites, accepted: acceptedInvites, pending: pendingInvites, totalComments, resolvedComments, recentMonth: recentInvites, recentComments },
        sharing: { totalShared: totalSharedDiagrams, public: publicSharedDiagrams, private: totalSharedDiagrams - publicSharedDiagrams },
        versions: { total: totalVersions },
      })
    } catch (err) {
      next(err)
    }
  },

  // ─── Problems management ─────────────────────────────────────────────────────

  listProblems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q          = typeof req.query.q          === 'string' ? req.query.q.trim()          : ''
      const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty        : ''
      const category   = typeof req.query.category   === 'string' ? req.query.category          : ''

      const match: Record<string, unknown> = {}
      if (q) match.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ]
      if (difficulty) match.difficulty = difficulty
      if (category)   match.category   = category

      const [total, problems] = await Promise.all([
        Problem.countDocuments(match),
        Problem.find(match)
          .select('_id slug title difficulty category isActive order companies tags createdAt')
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Attach solution counts
      const problemIds = problems.map(p => p._id)
      const solutionCounts = await UserSolution.aggregate([
        { $match: { problemId: { $in: problemIds } } },
        { $group: { _id: '$problemId', total: { $sum: 1 }, submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } } } },
      ])
      const scMap = new Map(solutionCounts.map(s => [s._id.toString(), s]))

      const enriched = problems.map(p => ({
        ...p,
        id: p._id.toString(),
        solutions: scMap.get(p._id.toString())?.total ?? 0,
        submitted: scMap.get(p._id.toString())?.submitted ?? 0,
      }))

      res.json({ problems: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  toggleProblem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findById(req.params.id)
      if (!problem) throw createError('Problem not found', 404)
      problem.isActive = !problem.isActive
      await problem.save()
      res.json({ ok: true, isActive: problem.isActive })
    } catch (err) {
      next(err)
    }
  },

  createProblem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        slug, title, difficulty, category, description,
        companies, tags, functionalRequirements, nonFunctionalRequirements,
        hints, order, isActive,
      } = req.body

      if (!title || !difficulty || !category || !description) {
        throw createError('title, difficulty, category and description are required', 400)
      }

      const autoSlug = (slug as string || title as string)
        .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const existing = await Problem.findOne({ slug: autoSlug })
      if (existing) throw createError('A problem with this slug already exists', 409)

      const problem = await Problem.create({
        slug: autoSlug, title, difficulty, category, description,
        companies:  companies  || [],
        tags:       tags       || [],
        functionalRequirements:    functionalRequirements    || [],
        nonFunctionalRequirements: nonFunctionalRequirements || [],
        hints:   hints  || [],
        order:   order  ?? 0,
        isActive: isActive !== false,
      })

      res.status(201).json({ ok: true, problem })
    } catch (err) {
      next(err)
    }
  },

  updateProblem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findById(req.params.id)
      if (!problem) throw createError('Problem not found', 404)

      const allowed = [
        'title','difficulty','category','description','companies','tags',
        'functionalRequirements','nonFunctionalRequirements','hints','order','isActive',
      ]
      for (const key of allowed) {
        if (req.body[key] !== undefined) (problem as never as Record<string, unknown>)[key] = req.body[key]
      }
      // update slug if title changed and no explicit slug was given
      if (req.body.slug) {
        problem.slug = (req.body.slug as string).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      await problem.save()
      res.json({ ok: true, problem })
    } catch (err) {
      next(err)
    }
  },

  deleteProblem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findById(req.params.id)
      if (!problem) throw createError('Problem not found', 404)
      await problem.deleteOne()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ─── Revision notes management ───────────────────────────────────────────────

  listRevisionNotes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q        = typeof req.query.q        === 'string' ? req.query.q.trim()   : ''
      const category = typeof req.query.category === 'string' ? req.query.category   : ''

      const match: Record<string, unknown> = {}
      if (q) match.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ]
      if (category) match.category = category

      const [total, notes] = await Promise.all([
        RevisionNote.countDocuments(match),
        RevisionNote.find(match)
          .select('_id slug title category difficulty isActive order tags createdAt')
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Attach revision counts
      const noteIds = notes.map(n => n._id)
      const revisionCounts = await UserRevision.aggregate([
        { $match: { noteId: { $in: noteIds } } },
        { $group: { _id: '$noteId', revised: { $sum: { $cond: [{ $eq: ['$status', 'revised'] }, 1, 0] } }, bookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } } } },
      ])
      const rcMap = new Map(revisionCounts.map(r => [r._id.toString(), r]))

      const enriched = notes.map(n => ({
        ...n,
        id: n._id.toString(),
        revised:    rcMap.get(n._id.toString())?.revised    ?? 0,
        bookmarked: rcMap.get(n._id.toString())?.bookmarked ?? 0,
      }))

      res.json({ notes: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  toggleRevisionNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await RevisionNote.findById(req.params.id)
      if (!note) throw createError('Revision note not found', 404)
      note.isActive = !note.isActive
      await note.save()
      res.json({ ok: true, isActive: note.isActive })
    } catch (err) {
      next(err)
    }
  },

  createRevisionNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        slug, title, category, difficulty, summary,
        keyPoints, analogy, codeHint, tags, order, isActive,
      } = req.body

      if (!title || !category || !summary) {
        throw createError('title, category and summary are required', 400)
      }

      const autoSlug = (slug as string || title as string)
        .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const existing = await RevisionNote.findOne({ slug: autoSlug })
      if (existing) throw createError('A revision note with this slug already exists', 409)

      const note = await RevisionNote.create({
        slug: autoSlug, title, category,
        difficulty: difficulty || 'basic',
        summary,
        keyPoints: keyPoints || [],
        analogy:   analogy   || '',
        codeHint:  codeHint  || '',
        tags:      tags      || [],
        order:     order     ?? 0,
        isActive:  isActive  !== false,
      })

      res.status(201).json({ ok: true, note })
    } catch (err) {
      next(err)
    }
  },

  updateRevisionNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await RevisionNote.findById(req.params.id)
      if (!note) throw createError('Revision note not found', 404)

      const allowed = ['title','category','difficulty','summary','keyPoints','analogy','codeHint','tags','order','isActive']
      for (const key of allowed) {
        if (req.body[key] !== undefined) (note as never as Record<string, unknown>)[key] = req.body[key]
      }
      if (req.body.slug) {
        note.slug = (req.body.slug as string).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      await note.save()
      res.json({ ok: true, note })
    } catch (err) {
      next(err)
    }
  },

  deleteRevisionNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await RevisionNote.findById(req.params.id)
      if (!note) throw createError('Revision note not found', 404)
      await note.deleteOne()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ─── Collaboration management ────────────────────────────────────────────────

  listCollabInvites: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page   = Math.max(1, Number(req.query.page) || 1)
      const limit  = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const status = typeof req.query.status === 'string' ? req.query.status : 'all'

      const match: Record<string, unknown> = {}
      if (status !== 'all') match.status = status

      const [total, invites] = await Promise.all([
        CollabInvite.countDocuments(match),
        CollabInvite.find(match)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate<{ diagramId: { _id: string; title: string } }>('diagramId', 'title')
          .lean(),
      ])

      res.json({ invites, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  revokeCollabInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await CollabInvite.findById(req.params.id)
      if (!invite) throw createError('Invite not found', 404)
      invite.status = 'revoked'
      await invite.save()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  listComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

      const match: Record<string, unknown> = {}
      if (q) match.content = { $regex: q, $options: 'i' }

      const [total, comments] = await Promise.all([
        Comment.countDocuments(match),
        Comment.find(match)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate<{ diagramId: { _id: string; title: string } }>('diagramId', 'title')
          .lean(),
      ])

      res.json({ comments, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) {
      next(err)
    }
  },

  deleteComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id)
      if (!comment) throw createError('Comment not found', 404)
      await comment.deleteOne()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // ── Code Execution Admin ──────────────────────────────────────────────────

  // GET /admin/code/stats
  getCodeStats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalRuns,
        successRuns,
        todayRuns,
        todaySuccess,
        byLanguage,
        dailyTrend,
        topUsers,
      ] = await Promise.all([
        CodeExecutionLog.countDocuments(),
        CodeExecutionLog.countDocuments({ status: 'success' }),
        CodeExecutionLog.countDocuments({ createdAt: { $gte: daysAgo(0) } }),
        CodeExecutionLog.countDocuments({ createdAt: { $gte: daysAgo(0) }, status: 'success' }),

        // Runs per language
        CodeExecutionLog.aggregate([
          { $group: { _id: '$language', total: { $sum: 1 }, success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } } } },
          { $sort: { total: -1 } },
        ]),

        // Daily trend (last 30 days)
        CodeExecutionLog.aggregate([
          { $match: { createdAt: { $gte: daysAgo(30) } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              total:   { $sum: 1 },
              success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
              error:   { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Top 10 users by run count
        CodeExecutionLog.aggregate([
          { $group: { _id: '$userId', total: { $sum: 1 }, success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } }, lastRun: { $max: '$createdAt' } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
        ]),
      ])

      // Enrich top users with name/email
      const userIds = topUsers.map((u: { _id: string }) => u._id)
      const users   = await userCollection()
      const userDocs = await users.find({ id: { $in: userIds } } as object).toArray()
      const userMap  = new Map(userDocs.map(u => [u.id as string, { name: u.name as string, email: u.email as string }]))

      const enrichedTopUsers = topUsers.map((u: { _id: string; total: number; success: number; lastRun: Date }) => ({
        ...u,
        name:  userMap.get(u._id)?.name  ?? 'Unknown',
        email: userMap.get(u._id)?.email ?? '',
      }))

      // Total banned users
      const bannedCount = await CodeBan.countDocuments()

      res.json({
        totalRuns,
        successRuns,
        errorRuns: totalRuns - successRuns,
        successRate: totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0,
        todayRuns,
        todaySuccess,
        bannedCount,
        byLanguage,
        dailyTrend,
        topUsers: enrichedTopUsers,
      })
    } catch (err) { next(err) }
  },

  // GET /admin/code/executions  — paginated list
  listCodeExecutions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page)  || 1)
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))

      const userId   = typeof req.query.userId   === 'string' ? req.query.userId.trim()   : ''
      const language = typeof req.query.language === 'string' ? req.query.language.trim() : ''
      const status   = typeof req.query.status   === 'string' ? req.query.status.trim()   : ''
      const from     = typeof req.query.from     === 'string' ? req.query.from.trim()     : ''
      const to       = typeof req.query.to       === 'string' ? req.query.to.trim()       : ''

      const match: Record<string, unknown> = {}
      if (userId)   match.userId   = userId
      if (language) match.language = language
      if (status && ['success', 'error'].includes(status)) match.status = status
      if (from || to) {
        const range: Record<string, Date> = {}
        if (from) range.$gte = new Date(from)
        if (to)   range.$lte = new Date(to + 'T23:59:59Z')
        match.createdAt = range
      }

      const [total, logs] = await Promise.all([
        CodeExecutionLog.countDocuments(match),
        CodeExecutionLog.find(match)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Enrich with user info
      const ids = [...new Set(logs.map(l => l.userId))]
      const users = await userCollection()
      const userDocs = await users.find({ id: { $in: ids } } as object).toArray()
      const userMap  = new Map(userDocs.map(u => [u.id as string, { name: u.name as string, email: u.email as string }]))

      const enriched = logs.map(l => ({
        ...l,
        userName:  userMap.get(l.userId)?.name  ?? 'Unknown',
        userEmail: userMap.get(l.userId)?.email ?? '',
      }))

      res.json({ executions: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  // GET /admin/code/executions/:userId/daily  — per-user daily breakdown
  getUserCodeDaily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const days = Math.min(90, Math.max(1, Number(req.query.days) || 30))

      const daily = await CodeExecutionLog.aggregate([
        { $match: { userId, createdAt: { $gte: daysAgo(days) } } },
        {
          $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total:   { $sum: 1 },
            success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
            error:   { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ])

      const users = await userCollection()
      const userDoc = await users.findOne({ id: userId } as object)

      res.json({
        userId,
        userName:  userDoc?.name  ?? 'Unknown',
        userEmail: userDoc?.email ?? '',
        daily,
        totalRuns:    daily.reduce((s: number, d: { total: number }) => s + d.total, 0),
        totalSuccess: daily.reduce((s: number, d: { success: number }) => s + d.success, 0),
        totalError:   daily.reduce((s: number, d: { error: number }) => s + d.error, 0),
      })
    } catch (err) { next(err) }
  },

  // GET /admin/code/bans  — list all banned users
  listCodeBans: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page)  || 1)
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))

      const [total, bans] = await Promise.all([
        CodeBan.countDocuments(),
        CodeBan.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Enrich with user info
      const ids = bans.map(b => b.userId)
      const users = await userCollection()
      const userDocs = await users.find({ id: { $in: ids } } as object).toArray()
      const userMap  = new Map(userDocs.map(u => [u.id as string, { name: u.name as string, email: u.email as string }]))

      const enriched = bans.map(b => ({
        ...b,
        userName:  userMap.get(b.userId)?.name  ?? 'Unknown',
        userEmail: userMap.get(b.userId)?.email ?? '',
      }))

      res.json({ bans: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  // PATCH /admin/code/bans/:userId  — toggle ban (ban/unban)
  toggleCodeBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : null
      const adminId = req.user!.id

      const existing = await CodeBan.findOne({ userId })
      if (existing) {
        await existing.deleteOne()
        res.json({ ok: true, banned: false, userId })
      } else {
        await CodeBan.create({ userId, reason, bannedBy: adminId })
        res.json({ ok: true, banned: true, userId })
      }
    } catch (err) { next(err) }
  },

  // ── Billing admin ────────────────────────────────────────────────────────────

  // GET /admin/billing/overview
  getBillingOverview: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalSubs, activeSubs, mrr, planDist, recentSubs] = await Promise.all([
        Subscription.countDocuments(),
        Subscription.countDocuments({ status: 'active' }),
        computeMRR(),
        // plan distribution from User collection
        User.aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } },
        ]),
        Subscription.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5).lean(),
      ])

      const planMap: Record<string, number> = {}
      for (const d of planDist) planMap[d._id as string] = d.count

      res.json({
        totalSubscriptions:  totalSubs,
        activeSubscriptions: activeSubs,
        mrr,
        arr: mrr * 12,
        planDistribution: planMap,
        recentSubscriptions: recentSubs,
      })
    } catch (err) { next(err) }
  },

  // GET /admin/billing/subscriptions
  listSubscriptions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page   = Math.max(1, Number(req.query.page)  || 1)
      const limit  = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
      const status = req.query.status as string | undefined
      const plan   = req.query.plan   as string | undefined

      const filter: Record<string, unknown> = {}
      if (status) filter.status = status
      if (plan)   filter.plan   = plan

      const [total, subs] = await Promise.all([
        Subscription.countDocuments(filter),
        Subscription.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ])

      // Enrich with user info
      const userIds = [...new Set(subs.map(s => s.userId))]
      const users = await User.find({ _id: { $in: userIds } }).select('name email plan').lean()
      const userMap = new Map(users.map(u => [u._id.toString(), u]))

      const enriched = subs.map(s => ({
        ...s,
        userName:  userMap.get(s.userId)?.name  ?? 'Unknown',
        userEmail: userMap.get(s.userId)?.email ?? '',
      }))

      res.json({ subscriptions: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  // GET /admin/billing/revenue
  // Accepts either a relative `range` (7d/30d/90d/1y, default 30d) or an
  // explicit `month` (YYYY-MM) so an admin can pull up any specific calendar
  // month's revenue, not just a rolling window ending today.
  getRevenueStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const monthParam = req.query.month as string | undefined
      const isMonth = !!monthParam && /^\d{4}-\d{2}$/.test(monthParam)

      let since: Date
      let until: Date | null = null
      let range: string

      if (isMonth) {
        const [y, m] = monthParam!.split('-').map(Number)
        since = new Date(Date.UTC(y, m - 1, 1))
        until = new Date(Date.UTC(y, m, 1))
        range = monthParam!
      } else {
        range = (req.query.range as string) || '30d'
        const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30
        since = new Date()
        since.setDate(since.getDate() - days)
      }

      const dateMatch: Record<string, unknown> = until
        ? { createdAt: { $gte: since, $lt: until } }
        : { createdAt: { $gte: since } }

      const [daily, byPlan, total, allTime, mrr] = await Promise.all([
        // Daily revenue series
        RevenueEvent.aggregate([
          { $match: dateMatch },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amountPaid' },
            count:   { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
        ]),
        // Revenue by plan
        RevenueEvent.aggregate([
          { $match: dateMatch },
          { $group: { _id: '$plan', revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
        ]),
        // Period total (for the selected range/month)
        RevenueEvent.aggregate([
          { $match: dateMatch },
          { $group: { _id: null, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
        ]),
        // All-time total
        RevenueEvent.aggregate([
          { $group: { _id: null, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
        ]),
        // Current recurring run-rate — independent of the selected range/month,
        // since MRR/ARR describe "right now", not a historical window.
        computeMRR(),
      ])

      res.json({
        daily,
        byPlan,
        periodTotal:  total[0]?.total  ?? 0,
        periodCount:  total[0]?.count  ?? 0,
        allTimeTotal: allTime[0]?.total ?? 0,
        allTimeCount: allTime[0]?.count ?? 0,
        mrr,
        arr: mrr * 12,
        range,
        isMonth,
      })
    } catch (err) { next(err) }
  },

  // PATCH /admin/billing/subscriptions/:id/plan — override user's plan (free upgrade/downgrade)
  overridePlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { plan } = req.body as { plan: PlanName }

      if (!['free', 'pro', 'ultimate'].includes(plan)) {
        throw createError('Invalid plan', 400)
      }

      const sub = await Subscription.findById(id)
      if (!sub) throw createError('Subscription not found', 404)

      await User.findByIdAndUpdate(sub.userId, { plan })
      res.json({ ok: true, plan, userId: sub.userId })
    } catch (err) { next(err) }
  },

  // POST /admin/billing/subscriptions/:id/cancel — force cancel a subscription
  adminCancelSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const sub = await Subscription.findById(id)
      if (!sub) throw createError('Subscription not found', 404)

      // Try to cancel in Razorpay — skip entirely for manually-onboarded subs,
      // which were never registered with Razorpay in the first place.
      if (sub.paymentSource !== 'manual') {
        try {
          const Razorpay = (await import('razorpay')).default
          const rzp = new Razorpay({
            key_id:     process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
          })
          await rzp.subscriptions.cancel(sub.razorpaySubId, false)
        } catch { /* non-fatal */ }
      }

      sub.status = 'cancelled'
      sub.cancelledAt = new Date()
      sub.cancelAtPeriodEnd = false
      await sub.save()

      // Downgrade user to free
      await User.findByIdAndUpdate(sub.userId, { plan: 'free' })

      res.json({ ok: true, userId: sub.userId })
    } catch (err) { next(err) }
  },

  // POST /admin/billing/subscriptions/manual — manually onboard an international
  // (or otherwise gateway-unreachable) customer. Replicates exactly what a
  // successful Razorpay upgrade does — activates the plan on the User doc,
  // creates an `active` Subscription record, and logs a RevenueEvent — just
  // tagged with paymentSource: 'manual' so it's distinguishable in reporting.
  createManualSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId, plan, months, currency, amountPaid, note,
      } = req.body as {
        userId: string
        plan: 'pro' | 'ultimate'
        months: number
        currency: 'INR' | 'USD'
        amountPaid: number
        note?: string
      }

      if (!userId) throw createError('userId is required', 400)
      if (!['pro', 'ultimate'].includes(plan)) throw createError('Invalid plan', 400)
      if (!['INR', 'USD'].includes(currency)) throw createError('Invalid currency', 400)
      if (typeof amountPaid !== 'number' || amountPaid < 0) throw createError('Invalid amountPaid', 400)
      if (!Number.isInteger(months) || months < 1 || months > 60) {
        throw createError('months must be an integer between 1 and 60', 400)
      }

      const users = await userCollection()
      const user = await users.findOne({ _id: new ObjectId(userId) })
      if (!user) throw createError('User not found', 404)

      // billingInterval only distinguishes monthly/yearly for display purposes
      // elsewhere in the app — the actual access window paid for is `months`,
      // reflected in currentPeriodEnd below (covers any prepaid duration, e.g.
      // a customer paying for 3 or 6 months upfront, not just 1 or 12).
      const billingInterval: 'monthly' | 'yearly' = months % 12 === 0 ? 'yearly' : 'monthly'

      // Best-effort cancel of any existing live subscription for this user,
      // mirroring createSubscription's existing-sub cleanup in billing.controller.ts.
      const existing = await Subscription.findOne({
        userId,
        status: { $in: ['created', 'authenticated', 'active', 'pending', 'halted'] },
      })
      if (existing) {
        if (existing.paymentSource !== 'manual') {
          try {
            const Razorpay = (await import('razorpay')).default
            const rzp = new Razorpay({
              key_id:     process.env.RAZORPAY_KEY_ID!,
              key_secret: process.env.RAZORPAY_KEY_SECRET!,
            })
            await rzp.subscriptions.cancel(existing.razorpaySubId, false)
          } catch { /* non-fatal */ }
        }
        existing.status = 'cancelled'
        existing.cancelledAt = new Date()
        existing.cancelAtPeriodEnd = false
        await existing.save()
      }

      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + months)

      const syntheticId = `manual_${new ObjectId().toString()}`

      const sub = await Subscription.create({
        userId,
        plan,
        razorpaySubId:      syntheticId,
        razorpayCustomerId: '',
        status:             'active',
        billingInterval,
        currentPeriodStart: now,
        currentPeriodEnd:   periodEnd,
        cancelAtPeriodEnd:  false,
        cancelledAt:        null,
        paymentSource:      'manual',
        currency,
        paidMonths:         months,
        onboardingNote:     note ?? '',
      })

      // Grant access — upsert since a brand-new payer may not have a Mongoose
      // `User` doc yet (only ever created lazily by a real/manual upgrade).
      // `name`/`email` are required fields on that schema, so they must be
      // supplied here in case this upsert is the doc's first insert.
      await User.findOneAndUpdate(
        { _id: userId },
        { plan, name: user.name, email: user.email },
        { upsert: true, setDefaultsOnInsert: true },
      )

      await RevenueEvent.create({
        userId,
        subscriptionId:     sub._id.toString(),
        razorpaySubId:      syntheticId,
        razorpayPaymentId:  `manual_${new ObjectId().toString()}`,
        plan,
        currency,
        amountPaid,
        billingInterval,
        paymentSource:      'manual',
      })

      res.json({ ok: true, subscriptionId: sub._id.toString(), userId, plan })
    } catch (err) { next(err) }
  },
}

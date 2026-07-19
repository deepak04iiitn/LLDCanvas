import { Request, Response, NextFunction } from 'express'
import { InterviewSession } from '../models/interview-session.model'
import { Problem } from '../models/problem.model'
import { Diagram } from '../models/diagram.model'
import { getLimits } from '../config/plans'
import { createError } from '../middleware/error'

// POST /interview/sessions — assigns a random practice problem and creates a
// brand-new, blank Diagram for it (never reused, even if this exact problem
// already has a normal-practice UserSolution or a prior interview attempt).
export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const plan   = req.user!.plan
    const limits = getLimits(plan)

    if (limits.interviewSessionsPerMonth <= 0) {
      throw createError('Interview Mode requires a Pro plan or higher.', 403)
    }

    if (Number.isFinite(limits.interviewSessionsPerMonth)) {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const usedThisMonth = await InterviewSession.countDocuments({
        userId, createdAt: { $gte: monthStart },
      })
      if (usedThisMonth >= limits.interviewSessionsPerMonth) {
        throw createError(
          `You've used all ${limits.interviewSessionsPerMonth} interview sessions this month. Upgrade your plan for more.`,
          429,
        )
      }
    }

    const { durationLimit } = req.body as { durationLimit?: number | null }

    const [problem] = await Problem.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } },
    ])
    if (!problem) throw createError('No practice problems are available right now.', 503)

    const diagram = await Diagram.create({
      userId,
      title:  `${problem.title} — Interview Attempt`,
      origin: 'interview',
    })

    const session = await InterviewSession.create({
      userId,
      title:             problem.title,
      diagramId:         diagram._id.toString(),
      durationLimit:     durationLimit ?? null,
      status:            'active',
      problemId:         problem._id,
      problemSlug:       problem.slug,
      problemDifficulty: problem.difficulty,
    })

    res.status(201).json({
      session,
      diagramId: diagram._id.toString(),
      problem: {
        slug:                      problem.slug,
        title:                     problem.title,
        difficulty:                problem.difficulty,
        description:               problem.description,
        functionalRequirements:    problem.functionalRequirements,
        nonFunctionalRequirements: problem.nonFunctionalRequirements,
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /interview/sessions
export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const skip  = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      InterviewSession.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InterviewSession.countDocuments({ userId: req.user!.id }),
    ])

    res.json({ sessions, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// GET /interview/sessions/:id
export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findById(req.params.id).lean()
    if (!session) return next(createError('Session not found', 404))
    if (session.userId !== req.user!.id) return next(createError('Forbidden', 403))
    res.json({ session })
  } catch (err) {
    next(err)
  }
}

// PATCH /interview/sessions/:id
export async function updateSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findById(req.params.id)
    if (!session) return next(createError('Session not found', 404))
    if (session.userId !== req.user!.id) return next(createError('Forbidden', 403))

    const { timeElapsed, status, notes, canvasSnapshot, title } = req.body as {
      timeElapsed?: number
      status?: 'active' | 'completed' | 'abandoned'
      notes?: string
      canvasSnapshot?: unknown
      title?: string
    }

    if (timeElapsed !== undefined) session.timeElapsed = timeElapsed
    if (status      !== undefined) {
      session.status = status
      if (status === 'completed' || status === 'abandoned') {
        session.completedAt = new Date()
      }
    }
    if (notes          !== undefined) session.notes          = notes
    if (canvasSnapshot !== undefined) session.canvasSnapshot = canvasSnapshot
    if (title          !== undefined) session.title          = title

    await session.save()
    res.json({ session })
  } catch (err) {
    next(err)
  }
}

// DELETE /interview/sessions/:id
export async function deleteSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findById(req.params.id)
    if (!session) return next(createError('Session not found', 404))
    if (session.userId !== req.user!.id) return next(createError('Forbidden', 403))
    await session.deleteOne()
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

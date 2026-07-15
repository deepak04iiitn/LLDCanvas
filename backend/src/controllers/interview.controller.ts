import { Request, Response, NextFunction } from 'express'
import { InterviewSession } from '../models/interview-session.model'
import { createError } from '../middleware/error'

// POST /interview/sessions
export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, diagramId, durationLimit } = req.body as {
      title?: string
      diagramId?: string | null
      durationLimit?: number | null
    }
    const session = await InterviewSession.create({
      userId:        req.user!.id,
      title:         title ?? 'Practice Session',
      diagramId:     diagramId ?? null,
      durationLimit: durationLimit ?? null,
      status:        'active',
    })
    res.status(201).json({ session })
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

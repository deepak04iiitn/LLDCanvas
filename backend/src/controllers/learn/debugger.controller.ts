import { Request, Response, NextFunction } from 'express'
import { DebuggerChallenge } from '../../models/learn/debugger-challenge.model'
import { createError } from '../../middleware/error'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

async function findPublished(idOrSlug: string) {
  let challenge = null
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    challenge = await DebuggerChallenge.findOne({ _id: idOrSlug, status: 'published' })
  }
  if (!challenge) {
    challenge = await DebuggerChallenge.findOne({ slug: idOrSlug, status: 'published' })
  }
  if (!challenge) throw createError('Challenge not found', 404)
  return challenge
}

export async function listChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const challenges = await DebuggerChallenge.find({ status: 'published' })
      .select('-explanation')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json({ challenges })
  } catch (e) {
    next(e)
  }
}

export async function getChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrSlug = paramId(req.params.id)
    const doc = await findPublished(idOrSlug)
    // Return without explanation
    const challenge = doc.toObject() as unknown as Record<string, unknown>
    delete challenge.explanation
    res.json({ challenge })
  } catch (e) {
    next(e)
  }
}

export async function recordSolve(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrSlug = paramId(req.params.id)
    const challenge = await findPublished(idOrSlug)
    const { timeTakenSeconds } = req.body as { timeTakenSeconds?: number }

    // In a full implementation you would persist the solve record to a user history collection.
    // For now we simply return the explanation.
    res.json({
      explanation: challenge.explanation,
      bugType: challenge.bugType,
      message: 'Bug squashed!',
      timeTakenSeconds: timeTakenSeconds ?? null,
    })
  } catch (e) {
    next(e)
  }
}

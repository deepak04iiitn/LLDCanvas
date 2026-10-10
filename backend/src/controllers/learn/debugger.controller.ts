import { Request, Response, NextFunction } from 'express'
import { DebuggerChallenge } from '../../models/learn/debugger-challenge.model'
import { DebuggerSolve } from '../../models/learn/debugger-solve.model'
import { DesignBug } from '../../models/learn/design-bug.model'
import { applySkillDeltas } from '../../utils/skill-updater'
import { createError } from '../../middleware/error'
import {
  isChallengeAccessible,
  requiredPlanForChallenge,
} from '../../config/challenge-access'
import { withChallengeLocks } from '../../utils/challenge-gate'

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

// ── Code Bug endpoints ────────────────────────────────────────────────────────

export async function listChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const challenges = await DebuggerChallenge.find({ status: 'published' })
      .select('-explanation')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json({ challenges: withChallengeLocks('debug-lab', req.user?.plan, challenges) })
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
    const [annotated] = withChallengeLocks('debug-lab', req.user?.plan, [
      challenge as { slug: string; difficulty?: string },
    ])
    res.json({ challenge: annotated })
  } catch (e) {
    next(e)
  }
}

export async function recordSolve(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrSlug = paramId(req.params.id)
    const challenge = await findPublished(idOrSlug)
    const plan = req.user!.plan
    if (!isChallengeAccessible('debug-lab', plan, challenge.difficulty, challenge.slug)) {
      const need = requiredPlanForChallenge('debug-lab', challenge.difficulty, challenge.slug)
      throw createError(
        `This challenge requires ${need === 'ultimate' ? 'Ultimate' : 'Pro'}.`,
        403,
        { code: 'PLAN_GATE', requiredPlan: need === 'free' ? 'pro' : need },
      )
    }
    const { timeTakenSeconds } = req.body as { timeTakenSeconds?: number }

    // Persist the solve record
    await DebuggerSolve.create({
      userId:           req.user!.id,
      challengeId:      challenge._id,
      mode:             'code',
      timeTakenSeconds: timeTakenSeconds ?? 0,
      isSolved:         true,
      solvedAt:         new Date(),
    })

    res.json({
      explanation:      challenge.explanation,
      bugType:          challenge.bugType,
      message:          'Bug squashed!',
      timeTakenSeconds: timeTakenSeconds ?? null,
    })
  } catch (e) {
    next(e)
  }
}

// ── Solve history ─────────────────────────────────────────────────────────────

export async function getSolveHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    const solves = await DebuggerSolve.find({ userId, isSolved: true })
      .sort({ solvedAt: -1 })
      .lean()

    const totalSolved  = solves.length
    const codeCount    = solves.filter(s => s.mode === 'code').length
    const designCount  = solves.filter(s => s.mode === 'design').length

    res.json({ solves, totalSolved, codeCount, designCount })
  } catch (e) {
    next(e)
  }
}

// ── Design Bug endpoints ──────────────────────────────────────────────────────

export async function listDesignBugs(req: Request, res: Response, next: NextFunction) {
  try {
    const bugs = await DesignBug.find({ status: 'published' })
      .select('-expectedIssues -explanation')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json({ bugs: withChallengeLocks('debug-lab', req.user?.plan, bugs) })
  } catch (e) {
    next(e)
  }
}

export async function getDesignBug(req: Request, res: Response, next: NextFunction) {
  try {
    const id  = paramId(req.params.id)
    const bug = await DesignBug.findOne({ _id: id, status: 'published' })
      .select('-expectedIssues.description -explanation')
      .lean()
    if (!bug) throw createError('Design bug not found', 404)
    const [annotated] = withChallengeLocks('debug-lab', req.user?.plan, [bug])
    res.json({ bug: annotated })
  } catch (e) {
    next(e)
  }
}

export async function submitDesignBug(req: Request, res: Response, next: NextFunction) {
  try {
    const id      = paramId(req.params.id)
    const userId  = req.user!.id
    const { bugId, foundIssues } = req.body as {
      bugId?: string
      foundIssues: Array<{ type: string; targetClass: string }>
    }

    const bug = await DesignBug.findOne({ _id: id, status: 'published' })
    if (!bug) throw createError('Design bug not found', 404)

    const plan = req.user!.plan
    if (!isChallengeAccessible('debug-lab', plan, bug.difficulty, bug.slug)) {
      const need = requiredPlanForChallenge('debug-lab', bug.difficulty, bug.slug)
      throw createError(
        `This challenge requires ${need === 'ultimate' ? 'Ultimate' : 'Pro'}.`,
        403,
        { code: 'PLAN_GATE', requiredPlan: need === 'free' ? 'pro' : need },
      )
    }

    const { expectedIssues } = bug

    // Match found issues against expected ones (type + targetClass, case-insensitive)
    const correctIssues = expectedIssues.filter(expected =>
      foundIssues.some(
        found =>
          found.type.toLowerCase()        === expected.type.toLowerCase() &&
          found.targetClass.toLowerCase() === expected.targetClass.toLowerCase(),
      ),
    )

    const missedIssues = expectedIssues.filter(expected =>
      !foundIssues.some(
        found =>
          found.type.toLowerCase()        === expected.type.toLowerCase() &&
          found.targetClass.toLowerCase() === expected.targetClass.toLowerCase(),
      ),
    )

    const score = expectedIssues.length > 0
      ? Math.round((correctIssues.length / expectedIssues.length) * 100)
      : 0

    // Apply skill deltas
    const skillDeltas = {
      coupling:  Math.ceil(score / 25),
      cohesion:  Math.ceil(score / 33),
      solid:     Math.ceil(score / 25),
    }

    const { interviewReadiness } = await applySkillDeltas(
      userId,
      'debug_lab_design',
      skillDeltas,
    )

    // Persist solve record
    await DebuggerSolve.create({
      userId,
      challengeId:      bug._id,
      mode:             'design',
      timeTakenSeconds: req.body.timeTakenSeconds ?? 0,
      isSolved:         score >= 50,
      solvedAt:         new Date(),
    })

    res.json({
      score,
      correctIssues,
      missedIssues,
      skillDeltas,
      interviewReadiness,
    })
  } catch (e) {
    next(e)
  }
}

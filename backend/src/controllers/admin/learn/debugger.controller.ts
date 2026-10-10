import { Request, Response, NextFunction } from 'express'
import { DebuggerChallenge } from '../../../models/learn/debugger-challenge.model'
import { DebuggerSolve }     from '../../../models/learn/debugger-solve.model'

// ─── List all challenges (admin – includes drafts) ────────────────────────────

export async function adminListChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const q          = String(req.query.q ?? '').trim()
    const status     = req.query.status     as string | undefined
    const difficulty = req.query.difficulty as string | undefined
    const bugType    = req.query.bugType    as string | undefined

    const filter: Record<string, unknown> = {}
    if (status)     filter.status     = status
    if (difficulty) filter.difficulty = difficulty
    if (bugType)    filter.bugType    = bugType
    if (q) filter.$or = [
      { title:       { $regex: q, $options: 'i' } },
      { slug:        { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ]

    const challenges = await DebuggerChallenge.find(filter).sort({ order: 1, updatedAt: -1 }).lean()
    res.json({ challenges })
  } catch (e) { next(e) }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function adminCreateChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const challenge = await DebuggerChallenge.create({
      slug:           req.body.slug,
      title:          req.body.title,
      description:    req.body.description    ?? '',
      variants:       req.body.variants       ?? [],
      expectedOutput: req.body.expectedOutput ?? '',
      testInput:      req.body.testInput      ?? '',
      hint:           req.body.hint           ?? '',
      explanation:    req.body.explanation    ?? '',
      difficulty:     req.body.difficulty     ?? 'medium',
      bugType:        req.body.bugType        ?? 'logic',
      tags:           req.body.tags           ?? [],
      status:         req.body.status         ?? 'draft',
      order:          req.body.order          ?? 0,
    })
    res.status(201).json(challenge)
  } catch (e) { next(e) }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function adminUpdateChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const challenge = await DebuggerChallenge.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!challenge) return res.status(404).json({ error: 'Not found' })
    res.json(challenge)
  } catch (e) { next(e) }
}

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

export async function adminPublishChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const challenge = await DebuggerChallenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ error: 'Not found' })
    challenge.status = challenge.status === 'published' ? 'draft' : 'published'
    await challenge.save()
    res.json({ ok: true, status: challenge.status })
  } catch (e) { next(e) }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function adminDeleteChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    await DebuggerChallenge.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

// ─── Bulk delete ──────────────────────────────────────────────────────────────

export async function adminBulkDeleteChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await DebuggerChallenge.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function adminGetStats(req: Request, res: Response, next: NextFunction) {
  try {
    const days  = Number(req.query.days ?? 30)
    const since = new Date(Date.now() - days * 86_400_000)

    const [
      totalChallenges,
      publishedChallenges,
      draftChallenges,
      totalSolves,
      successSolves,
      recentSolves,
      dailyActivity,
      topChallenges,
      diffBreakdown,
      bugTypeBreakdown,
    ] = await Promise.all([
      DebuggerChallenge.countDocuments(),
      DebuggerChallenge.countDocuments({ status: 'published' }),
      DebuggerChallenge.countDocuments({ status: 'draft' }),
      DebuggerSolve.countDocuments(),
      DebuggerSolve.countDocuments({ isSolved: true }),
      DebuggerSolve.countDocuments({ solvedAt: { $gte: since } }),
      // Daily solves
      DebuggerSolve.aggregate([
        { $match: { solvedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Top challenges by solve count
      DebuggerSolve.aggregate([
        { $group: { _id: '$challengeId', solves: { $sum: 1 }, success: { $sum: { $cond: ['$isSolved', 1, 0] } } } },
        { $sort: { solves: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'debuggerchallenges', localField: '_id', foreignField: '_id', as: 'challenge' } },
        { $unwind: { path: '$challenge', preserveNullAndEmptyArrays: true } },
        { $project: { title: '$challenge.title', slug: '$challenge.slug', difficulty: '$challenge.difficulty', bugType: '$challenge.bugType', solves: 1, success: 1 } },
      ]),
      // Difficulty breakdown
      DebuggerChallenge.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      // Bug type breakdown
      DebuggerChallenge.aggregate([
        { $group: { _id: '$bugType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    res.json({
      challenges: { total: totalChallenges, published: publishedChallenges, drafts: draftChallenges },
      solves: {
        total: totalSolves,
        success: successSolves,
        rate: totalSolves > 0 ? Math.round((successSolves / totalSolves) * 100) : 0,
        recent: recentSolves,
      },
      dailyActivity,
      topChallenges,
      diffBreakdown,
      bugTypeBreakdown,
    })
  } catch (e) { next(e) }
}

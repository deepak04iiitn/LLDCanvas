import { Request, Response, NextFunction } from 'express'
import { DetectiveScenario } from '../../../models/learn/detective-scenario.model'
import { DetectiveAttempt }  from '../../../models/learn/detective-attempt.model'

// ─── List all scenarios (admin – includes drafts) ─────────────────────────────

export async function adminListScenarios(req: Request, res: Response, next: NextFunction) {
  try {
    const q          = String(req.query.q ?? '').trim()
    const status     = req.query.status as string | undefined
    const difficulty = req.query.difficulty as string | undefined

    const filter: Record<string, unknown> = {}
    if (status)     filter.status     = status
    if (difficulty) filter.difficulty = difficulty
    if (q) filter.$or = [
      { title:       { $regex: q, $options: 'i' } },
      { slug:        { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ]

    const scenarios = await DetectiveScenario.find(filter).sort({ order: 1, updatedAt: -1 }).lean()
    res.json({ scenarios })
  } catch (e) { next(e) }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function adminCreateScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await DetectiveScenario.create({
      slug:            req.body.slug,
      title:           req.body.title,
      mode:            req.body.mode      ?? 'identify',
      difficulty:      req.body.difficulty ?? 'medium',
      stem:            req.body.stem      ?? '',
      answer:          req.body.answer    ?? '',
      choices:         req.body.choices   ?? [],
      explanation:     req.body.explanation ?? '',
      diagramSnapshot: req.body.diagramSnapshot,
      codeSnippet:     req.body.codeSnippet,
      description:     req.body.description,
      status:          req.body.status   ?? 'draft',
      order:           req.body.order    ?? 0,
      problemContext:  req.body.problemContext,
      keyPatterns:     req.body.keyPatterns,
    })
    res.status(201).json(scenario)
  } catch (e) { next(e) }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function adminUpdateScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await DetectiveScenario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    res.json(scenario)
  } catch (e) { next(e) }
}

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

export async function adminPublishScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await DetectiveScenario.findById(req.params.id)
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    scenario.status = scenario.status === 'published' ? 'draft' : 'published'
    await scenario.save()
    res.json({ ok: true, status: scenario.status })
  } catch (e) { next(e) }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function adminDeleteScenario(req: Request, res: Response, next: NextFunction) {
  try {
    await DetectiveScenario.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

// ─── Bulk delete ──────────────────────────────────────────────────────────────

export async function adminBulkDeleteScenarios(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await DetectiveScenario.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function adminGetStats(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Number(req.query.days ?? 30)
    const since = new Date(Date.now() - days * 86_400_000)

    const [
      totalScenarios,
      publishedScenarios,
      draftScenarios,
      totalAttempts,
      correctAttempts,
      recentAttempts,
      dailyActivity,
      topScenarios,
      diffBreakdown,
    ] = await Promise.all([
      DetectiveScenario.countDocuments(),
      DetectiveScenario.countDocuments({ status: 'published' }),
      DetectiveScenario.countDocuments({ status: 'draft' }),
      DetectiveAttempt.countDocuments(),
      DetectiveAttempt.countDocuments({ isCorrect: true }),
      DetectiveAttempt.countDocuments({ timestamp: { $gte: since } }),
      // Daily activity
      DetectiveAttempt.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Top scenarios by attempt count
      DetectiveAttempt.aggregate([
        { $group: { _id: '$scenarioId', attempts: { $sum: 1 }, correct: { $sum: { $cond: ['$isCorrect', 1, 0] } } } },
        { $sort: { attempts: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'detectivescenarios', localField: '_id', foreignField: '_id', as: 'scenario' } },
        { $unwind: { path: '$scenario', preserveNullAndEmptyArrays: true } },
        { $project: { title: '$scenario.title', slug: '$scenario.slug', difficulty: '$scenario.difficulty', attempts: 1, correct: 1 } },
      ]),
      // Difficulty breakdown
      DetectiveScenario.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ])

    res.json({
      scenarios: { total: totalScenarios, published: publishedScenarios, drafts: draftScenarios },
      attempts: {
        total: totalAttempts,
        correct: correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        recent: recentAttempts,
      },
      dailyActivity,
      topScenarios,
      diffBreakdown,
    })
  } catch (e) { next(e) }
}

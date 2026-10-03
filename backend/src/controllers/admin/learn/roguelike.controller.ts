import { Request, Response, NextFunction } from 'express'
import { RoguelikeScenario } from '../../../models/learn/roguelike-scenario.model'
import { RoguelikeRun }      from '../../../models/learn/roguelike-run.model'

// ─── List all scenarios (admin – includes drafts) ─────────────────────────────

export async function adminListScenarios(req: Request, res: Response, next: NextFunction) {
  try {
    const q          = String(req.query.q ?? '').trim()
    const status     = req.query.status     as string | undefined
    const difficulty = req.query.difficulty as string | undefined

    const filter: Record<string, unknown> = {}
    if (status)     filter.status     = status
    if (difficulty) filter.difficulty = difficulty
    if (q) filter.$or = [
      { title:       { $regex: q, $options: 'i' } },
      { slug:        { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ]

    const scenarios = await RoguelikeScenario.find(filter)
      .select('-stages') // omit large stages array from list view
      .sort({ order: 1, updatedAt: -1 })
      .lean()
    res.json({ scenarios })
  } catch (e) { next(e) }
}

// ─── Get single scenario (with full stages) ───────────────────────────────────

export async function adminGetScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await RoguelikeScenario.findById(req.params.id).lean()
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    res.json(scenario)
  } catch (e) { next(e) }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function adminCreateScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await RoguelikeScenario.create({
      slug:               req.body.slug,
      title:              req.body.title,
      icon:               req.body.icon              ?? '🏗️',
      description:        req.body.description       ?? '',
      systemContext:      req.body.systemContext      ?? '',
      initialRequirement: req.body.initialRequirement ?? '',
      difficulty:         req.body.difficulty         ?? 'medium',
      modes:              req.body.modes              ?? ['beginner'],
      stages:             req.body.stages             ?? [],
      initialConstraints: req.body.initialConstraints ?? {},
      tags:               req.body.tags              ?? [],
      status:             req.body.status            ?? 'draft',
      order:              req.body.order             ?? 0,
      estimatedMinutes:   req.body.estimatedMinutes  ?? 30,
    })
    res.status(201).json(scenario)
  } catch (e) { next(e) }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function adminUpdateScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await RoguelikeScenario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    res.json(scenario)
  } catch (e) { next(e) }
}

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

export async function adminPublishScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await RoguelikeScenario.findById(req.params.id)
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    scenario.status = scenario.status === 'published' ? 'draft' : 'published'
    await scenario.save()
    res.json({ ok: true, status: scenario.status })
  } catch (e) { next(e) }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function adminDeleteScenario(req: Request, res: Response, next: NextFunction) {
  try {
    await RoguelikeScenario.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

// ─── Bulk delete ──────────────────────────────────────────────────────────────

export async function adminBulkDeleteScenarios(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await RoguelikeScenario.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

// ─── List all runs (admin) ────────────────────────────────────────────────────

export async function adminListRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = Math.max(1, Number(req.query.page  ?? 1))
    const limit  = Math.min(100, Number(req.query.limit ?? 50))
    const status = req.query.status as string | undefined

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const [runs, total] = await Promise.all([
      RoguelikeRun.find(filter)
        .populate('userId',     'name email')
        .populate('scenarioId', 'title slug')
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RoguelikeRun.countDocuments(filter),
    ])

    res.json({ runs, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function adminGetStats(req: Request, res: Response, next: NextFunction) {
  try {
    const days  = Number(req.query.days ?? 30)
    const since = new Date(Date.now() - days * 86_400_000)

    const [
      totalScenarios,
      publishedScenarios,
      draftScenarios,
      totalRuns,
      completedRuns,
      recentRuns,
      dailyActivity,
      topScenarios,
      runsByMode,
    ] = await Promise.all([
      RoguelikeScenario.countDocuments(),
      RoguelikeScenario.countDocuments({ status: 'published' }),
      RoguelikeScenario.countDocuments({ status: 'draft' }),
      RoguelikeRun.countDocuments(),
      RoguelikeRun.countDocuments({ status: 'completed' }),
      RoguelikeRun.countDocuments({ startedAt: { $gte: since } }),
      // Daily runs
      RoguelikeRun.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Top scenarios by run count
      RoguelikeRun.aggregate([
        { $group: { _id: '$scenarioId', runs: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
        { $sort: { runs: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'roguelikescenarios', localField: '_id', foreignField: '_id', as: 'scenario' } },
        { $unwind: { path: '$scenario', preserveNullAndEmptyArrays: true } },
        { $project: { title: '$scenario.title', slug: '$scenario.slug', difficulty: '$scenario.difficulty', runs: 1, completed: 1 } },
      ]),
      // Runs by mode
      RoguelikeRun.aggregate([
        { $group: { _id: '$mode', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    res.json({
      scenarios: { total: totalScenarios, published: publishedScenarios, drafts: draftScenarios },
      runs: {
        total: totalRuns,
        completed: completedRuns,
        completionRate: totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0,
        recent: recentRuns,
      },
      dailyActivity,
      topScenarios,
      runsByMode,
    })
  } catch (e) { next(e) }
}

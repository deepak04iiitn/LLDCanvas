import { Request, Response, NextFunction } from 'express'
import { Problem } from '../models/problem.model'
import { UserSolution } from '../models/user-solution.model'
import { Diagram } from '../models/diagram.model'
import { createError } from '../middleware/error'
import { User } from '../models/user.model'
import { isProblemAccessible } from '../config/plans'

// Fetch user display info (name + image) in bulk
async function fetchUserInfo(userIds: string[]): Promise<Map<string, { name: string; image: string | null }>> {
  const map = new Map<string, { name: string; image: string | null }>()
  if (!userIds.length) return map
  try {
    const docs = await User.find({ _id: { $in: userIds } }).select('name image').lean()
    for (const d of docs) {
      map.set(d._id.toString(), { name: d.name ?? 'Anonymous', image: d.image ?? null })
    }
  } catch { /* non-fatal */ }
  return map
}

export const problemsController = {

  // GET /problems  — list all active problems with caller's solution status
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId     = req.user!.id
      const q          = typeof req.query.q          === 'string' ? req.query.q.trim()          : ''
      const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty.trim() : ''
      const category   = typeof req.query.category   === 'string' ? req.query.category.trim()   : ''

      const match: Record<string, unknown> = { isActive: true }
      if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) match.difficulty = difficulty
      if (category)   match.category = { $regex: category, $options: 'i' }
      if (q)          match.title    = { $regex: q,        $options: 'i' }

      const problems = await Problem.find(match)
        .select('-hints -functionalRequirements -nonFunctionalRequirements')
        .sort({ difficulty: 1, order: 1 })
        .lean()

      // Attach submission counts and user's own solution status
      const problemIds = problems.map(p => p._id)

      const [submissionCounts, userSolutions] = await Promise.all([
        UserSolution.aggregate([
          { $match: { problemId: { $in: problemIds }, status: 'submitted' } },
          { $group: { _id: '$problemId', count: { $sum: 1 } } },
        ]),
        UserSolution.find({ problemId: { $in: problemIds }, userId }).lean(),
      ])

      const countMap    = new Map(submissionCounts.map((s: { _id: { toString(): string }; count: number }) => [s._id.toString(), s.count]))
      const solutionMap = new Map(userSolutions.map(s => [s.problemId.toString(), s]))

      const plan = req.user!.plan

      const enriched = problems.map(p => ({
        ...p,
        submissionCount: countMap.get(p._id.toString()) ?? 0,
        myStatus: solutionMap.get(p._id.toString())?.status ?? null,
        locked: !isProblemAccessible(plan, p.difficulty, p.slug),
      }))

      res.json({ problems: enriched })
    } catch (err) { next(err) }
  },

  // GET /problems/:slug  — full detail, no hints
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true }).lean()
      if (!problem) throw createError('Problem not found', 404)

      const locked = !isProblemAccessible(req.user!.plan, problem.difficulty, problem.slug)

      const [submissionCount, mySolution] = await Promise.all([
        UserSolution.countDocuments({ problemId: problem._id, status: 'submitted' }),
        UserSolution.findOne({ problemId: problem._id, userId }).lean(),
      ])

      res.json({
        problem: {
          ...problem,
          hints: undefined,
          // Requirements are the paid content on a locked problem — title/
          // description stay visible (same as the list view) but the real
          // substance is withheld server-side, not just hidden with CSS.
          functionalRequirements: locked ? [] : problem.functionalRequirements,
          nonFunctionalRequirements: locked ? [] : problem.nonFunctionalRequirements,
          locked,
        },
        submissionCount,
        mySolution: mySolution ?? null,
      })
    } catch (err) { next(err) }
  },

  // GET /problems/:slug/hints  — all 3 hints (intentional separate call)
  getHints: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true })
        .select('hints').lean()
      if (!problem) throw createError('Problem not found', 404)
      res.json({ hints: problem.hints })
    } catch (err) { next(err) }
  },

  // GET /problems/categories  — distinct category list for filter chips
  categories: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cats = await Problem.distinct('category', { isActive: true })
      res.json({ categories: cats.sort() })
    } catch (err) { next(err) }
  },

  // ── Solutions ─────────────────────────────────────────────────────────────

  // GET /problems/:slug/my-solution
  getMySolution: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const problem = await Problem.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!problem) throw createError('Problem not found', 404)

      const solution = await UserSolution.findOne({ problemId: problem._id, userId }).lean()
      res.json({ solution: solution ?? null })
    } catch (err) { next(err) }
  },

  // POST /problems/:slug/solutions  — start or resume
  startSolution: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true }).lean()
      if (!problem) throw createError('Problem not found', 404)

      if (!isProblemAccessible(req.user!.plan, problem.difficulty, problem.slug)) {
        throw createError('This problem requires a Pro plan or higher.', 403)
      }

      // Return existing solution if already started
      const existing = await UserSolution.findOne({ problemId: problem._id, userId })
      if (existing) {
        return res.json({ solution: existing, diagramId: existing.diagramId?.toString() ?? null })
      }

      // Create a blank diagram for this problem
      const diagram = await Diagram.create({
        userId,
        title: `${problem.title} — My Solution`,
      })

      const solution = await UserSolution.create({
        problemId: problem._id,
        userId,
        diagramId: diagram._id,
        status: 'in_progress',
      })

      res.status(201).json({ solution, diagramId: diagram._id.toString() })
    } catch (err) { next(err) }
  },

  // PATCH /problems/:slug/solutions/submit
  submitSolution: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const problem = await Problem.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!problem) throw createError('Problem not found', 404)

      const solution = await UserSolution.findOne({ problemId: problem._id, userId })
      if (!solution) throw createError('No solution found — start practicing first', 404)
      if (solution.status === 'submitted') {
        return res.json({ solution })
      }

      solution.status      = 'submitted'
      solution.submittedAt = new Date()
      await solution.save()

      res.json({ solution })
    } catch (err) { next(err) }
  },

  // GET /problems/:slug/solutions  — community submitted solutions
  listSolutions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const problem = await Problem.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!problem) throw createError('Problem not found', 404)

      const page  = Math.max(1, Number(req.query.page) || 1)
      const limit = 12
      const sort  = req.query.sort === 'oldest' ? 1 : -1

      const [total, solutions] = await Promise.all([
        UserSolution.countDocuments({ problemId: problem._id, status: 'submitted' }),
        UserSolution.find({ problemId: problem._id, status: 'submitted' })
          .sort({ submittedAt: sort })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      // Enrich with user info + diagram node/edge counts
      const userIds   = [...new Set(solutions.map(s => s.userId))]
      const diagramIds = solutions.map(s => s.diagramId).filter(Boolean)

      const [userMap, diagrams] = await Promise.all([
        fetchUserInfo(userIds),
        Diagram.find({ _id: { $in: diagramIds } }).select('_id diagramData').lean(),
      ])

      const diagramMap = new Map(diagrams.map(d => [d._id.toString(), d]))

      const enriched = solutions.map(s => {
        const user    = userMap.get(s.userId) ?? { name: 'Anonymous', image: null }
        const diagram = s.diagramId ? diagramMap.get(s.diagramId.toString()) : null
        const nodeCount = (diagram?.diagramData?.nodes as unknown[])?.length ?? 0
        const edgeCount = (diagram?.diagramData?.edges as unknown[])?.length ?? 0
        return {
          _id:         s._id.toString(),
          userId:      s.userId,
          isOwn:       s.userId === userId,
          userName:    user.name,
          userImage:   user.image,
          diagramId:   s.diagramId?.toString() ?? null,
          submittedAt: s.submittedAt,
          nodeCount,
          edgeCount,
        }
      })

      // Pin own solution to top
      enriched.sort((a, b) => (a.isOwn ? -1 : b.isOwn ? 1 : 0))

      res.json({ solutions: enriched, total, page, totalPages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  // GET /problems/stats/me  — problem stats for the current user (for Stats page)
  myStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const all = await UserSolution.find({ userId }).populate('problemId', 'difficulty').lean()

      const attempted  = all.length
      const submitted  = all.filter(s => s.status === 'submitted').length
      const byDifficulty = { easy: 0, medium: 0, hard: 0 }

      for (const s of all) {
        if (s.status === 'submitted') {
          const diff = (s.problemId as { difficulty?: string })?.difficulty as keyof typeof byDifficulty
          if (diff && diff in byDifficulty) byDifficulty[diff]++
        }
      }

      res.json({ attempted, submitted, byDifficulty })
    } catch (err) { next(err) }
  },
}

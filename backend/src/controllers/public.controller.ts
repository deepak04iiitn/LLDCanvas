import { Request, Response, NextFunction } from 'express'
import { Problem } from '../models/problem.model'
import { RevisionNote } from '../models/revision-note.model'
import { createError } from '../middleware/error'

// Used only for URL segments (e.g. "Design Patterns" -> "design-patterns").
// Mongo already stores the human category string; this is purely cosmetic
// for the public route shape and never used as a lookup key.
export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Public, unauthenticated endpoints for SEO pages ───────────────────────────
// These must NEVER return hints, full requirement arrays, codeHint, or
// remaining keyPoints — only enough to preview + funnel into sign-up. Every
// field withheld here is withheld server-side (never trust the client), the
// same discipline already used for plan-gated content in problems.controller.

export const publicController = {

  // GET /public/problems
  listProblems: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const problems = await Problem.find({ isActive: true })
        .select('slug title difficulty category companies tags')
        .sort({ difficulty: 1, order: 1 })
        .lean()

      res.json({
        problems: problems.map(p => ({
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty,
          category: p.category,
          companies: p.companies,
          tags: p.tags,
        })),
      })
    } catch (err) { next(err) }
  },

  // GET /public/problems/:slug
  getProblem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true }).lean()
      if (!problem) throw createError('Problem not found', 404)

      const related = await Problem.find({
        category: problem.category,
        isActive: true,
        slug: { $ne: problem.slug },
      })
        .select('slug title difficulty category')
        .limit(3)
        .lean()

      res.json({
        problem: {
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          category: problem.category,
          description: problem.description,
          companies: problem.companies,
          tags: problem.tags,
          functionalCount: problem.functionalRequirements.length,
          nonFunctionalCount: problem.nonFunctionalRequirements.length,
          firstFunctionalRequirement: problem.functionalRequirements[0] ?? null,
          realWorldApplications: problem.realWorldApplications,
          learningObjectives: problem.learningObjectives,
          whyAsked: problem.whyAsked,
        },
        related: related.map(p => ({ slug: p.slug, title: p.title, difficulty: p.difficulty })),
      })
    } catch (err) { next(err) }
  },

  // GET /public/revision-notes
  listRevisionNotes: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await RevisionNote.find({ isActive: true })
        .select('slug title category difficulty summary tags')
        .sort({ category: 1, order: 1 })
        .lean()

      res.json({
        notes: notes.map(n => ({
          slug: n.slug,
          title: n.title,
          category: n.category,
          categorySlug: slugifyCategory(n.category),
          difficulty: n.difficulty,
          summary: n.summary,
          tags: n.tags,
        })),
      })
    } catch (err) { next(err) }
  },

  // GET /public/revision-notes/:slug
  getRevisionNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await RevisionNote.findOne({ slug: req.params.slug, isActive: true }).lean()
      if (!note) throw createError('Revision note not found', 404)

      const related = await RevisionNote.find({
        category: note.category,
        isActive: true,
        slug: { $ne: note.slug },
      })
        .select('slug title category difficulty')
        .limit(3)
        .lean()

      res.json({
        note: {
          slug: note.slug,
          title: note.title,
          category: note.category,
          categorySlug: slugifyCategory(note.category),
          difficulty: note.difficulty,
          summary: note.summary,
          analogy: note.analogy,
          tags: note.tags,
          keyPointsCount: note.keyPoints.length,
          firstKeyPoint: note.keyPoints[0] ?? null,
        },
        related: related.map(n => ({
          slug: n.slug,
          title: n.title,
          difficulty: n.difficulty,
          categorySlug: slugifyCategory(n.category),
        })),
      })
    } catch (err) { next(err) }
  },
}

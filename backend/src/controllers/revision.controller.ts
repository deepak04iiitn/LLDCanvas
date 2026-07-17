import { Request, Response, NextFunction } from 'express'
import { RevisionNote } from '../models/revision-note.model'
import { UserRevision } from '../models/user-revision.model'
import { createError } from '../middleware/error'

export const revisionController = {

  // GET /revision-notes — list all active notes with caller's status
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId     = req.user!.id
      const q          = typeof req.query.q          === 'string' ? req.query.q.trim()          : ''
      const category   = typeof req.query.category   === 'string' ? req.query.category.trim()   : ''
      const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty.trim() : ''
      const onlyBookmarked = req.query.bookmarked === '1'

      const match: Record<string, unknown> = { isActive: true }
      if (category)   match.category   = { $regex: category,   $options: 'i' }
      if (difficulty) match.difficulty = difficulty
      if (q)          match.$or = [
        { title:    { $regex: q, $options: 'i' } },
        { tags:     { $regex: q, $options: 'i' } },
        { summary:  { $regex: q, $options: 'i' } },
      ]

      const notes = await RevisionNote.find(match)
        .select('-codeHint -analogy')
        .sort({ category: 1, order: 1 })
        .lean()

      // Attach user's revision/bookmark state
      const noteIds = notes.map(n => n._id)
      const userRevisions = await UserRevision.find({ noteId: { $in: noteIds }, userId }).lean()
      const revMap = new Map(userRevisions.map(r => [r.noteId.toString(), r]))

      let enriched = notes.map(n => ({
        ...n,
        myStatus:   revMap.get(n._id.toString())?.status     ?? null,
        bookmarked: revMap.get(n._id.toString())?.bookmarked ?? false,
      }))

      if (onlyBookmarked) {
        enriched = enriched.filter(n => n.bookmarked)
      }

      res.json({ notes: enriched })
    } catch (err) { next(err) }
  },

  // GET /revision-notes/categories
  categories: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cats = await RevisionNote.distinct('category', { isActive: true })
      res.json({ categories: cats.sort() })
    } catch (err) { next(err) }
  },

  // GET /revision-notes/stats/me
  myStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const [total, allRevisions] = await Promise.all([
        RevisionNote.countDocuments({ isActive: true }),
        UserRevision.find({ userId }).lean(),
      ])

      const revised    = allRevisions.filter(r => r.status === 'revised').length
      const bookmarked = allRevisions.filter(r => r.bookmarked).length

      res.json({ stats: { total, revised, bookmarked } })
    } catch (err) { next(err) }
  },

  // GET /revision-notes/:slug — full detail
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const note = await RevisionNote.findOne({ slug: req.params.slug, isActive: true }).lean()
      if (!note) throw createError('Note not found', 404)

      const userRevision = await UserRevision.findOne({ noteId: note._id, userId }).lean()

      res.json({
        note,
        myRevision: userRevision
          ? { status: userRevision.status, bookmarked: userRevision.bookmarked }
          : null,
      })
    } catch (err) { next(err) }
  },

  // POST /revision-notes/:slug/revised — mark as revised (or toggle back)
  markRevised: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const note = await RevisionNote.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!note) throw createError('Note not found', 404)

      const existing = await UserRevision.findOne({ noteId: note._id, userId })
      if (!existing) {
        await UserRevision.create({
          userId, noteId: note._id, status: 'revised', revisedAt: new Date(),
        })
        return res.json({ ok: true })
      }

      const nextStatus = existing.status === 'revised' ? 'unread' : 'revised'
      existing.status    = nextStatus
      existing.revisedAt = nextStatus === 'revised' ? new Date() : null
      await existing.save()
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  // POST /revision-notes/:slug/bookmark — toggle bookmark
  toggleBookmark: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const note = await RevisionNote.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!note) throw createError('Note not found', 404)

      // Find or create, then flip the bookmarked flag
      let revision = await UserRevision.findOne({ noteId: note._id, userId })
      if (!revision) {
        revision = await UserRevision.create({
          userId, noteId: note._id, status: 'unread', bookmarked: true,
        })
        return res.json({ bookmarked: revision.bookmarked })
      }

      revision.bookmarked = !revision.bookmarked
      await revision.save()
      res.json({ bookmarked: revision.bookmarked })
    } catch (err) { next(err) }
  },
}

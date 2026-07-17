import { Request, Response, NextFunction } from 'express'
import { Diagram } from '../models/diagram.model'
import { DiagramShare } from '../models/diagram-share.model'
import { UserSolution } from '../models/user-solution.model'
import { CollabInvite } from '../models/collab-invite.model'
import { createError } from '../middleware/error'

// Express params can be `string | string[]` — this normalises to string
function paramId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id
}

// ─── Ownership guard ───────────────────────────────────────────────────────────
async function assertOwner(id: string | string[], userId: string) {
  const diagramId = paramId(id)
  const diagram = await Diagram.findById(diagramId)
  if (!diagram) throw createError('Diagram not found', 404)
  if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)
  return diagram
}

export const diagramsController = {

  // GET /diagrams?q=
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

      const filter: Record<string, unknown> = { userId }
      if (q) filter.title = { $regex: q, $options: 'i' }

      const diagrams = await Diagram.find(filter)
        .select('_id title thumbnail updatedAt createdAt isTemplate')
        .sort({ updatedAt: -1 })
        .lean()

      res.json({ diagrams })
    } catch (err) {
      next(err)
    }
  },

  // POST /diagrams
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const { title } = req.body as { title?: string }

      const diagram = await Diagram.create({
        userId,
        title: title ?? 'Untitled Diagram',
      })

      res.status(201).json({ diagram })
    } catch (err) {
      next(err)
    }
  },

  // POST /diagrams/:id/duplicate
  duplicate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const source = await assertOwner(req.params.id, req.user!.id)

      const copy = await Diagram.create({
        userId: req.user!.id,
        title: `Copy of ${source.title}`,
        thumbnail: source.thumbnail,
        isTemplate: false,
        diagramData: source.diagramData,
      })

      res.status(201).json({ diagram: copy })
    } catch (err) {
      next(err)
    }
  },

  // GET /diagrams/:id  — owner always; also shared viewers with a valid token
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId    = req.user!.id
      const diagramId = paramId(req.params.id)
      const diagram   = await Diagram.findById(diagramId)
      if (!diagram) throw createError('Diagram not found', 404)

      // Owner — always allowed
      if (diagram.userId.toString() === userId) return res.json({ diagram })

      // Non-owner — a submitted community solution is publicly viewable, view-only
      const isCommunitySolution = await UserSolution.exists({ diagramId, status: 'submitted' })
      if (isCommunitySolution) {
        return res.json({ diagram, sharePermission: 'view' })
      }

      // Check if the user has an accepted collab invite for this diagram
      const collabInvite = await CollabInvite.findOne({
        diagramId,
        userId,
        status: 'accepted',
      }).lean()
      if (collabInvite) {
        return res.json({ diagram, sharePermission: collabInvite.role === 'editor' ? 'edit' : 'view' })
      }

      // Otherwise, check if a valid share token was provided
      const shareToken = typeof req.query.shareToken === 'string' ? req.query.shareToken : null
      if (!shareToken) throw createError('Forbidden', 403)

      const share = await DiagramShare.findOne({ diagramId, token: shareToken }).lean()
      if (!share) throw createError('Forbidden', 403)

      res.json({ diagram, sharePermission: share.permission })
    } catch (err) {
      next(err)
    }
  },

  // PUT /diagrams/:id  (autosave) — owner or edit-permission sharer
  save: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId    = req.user!.id
      const diagramId = paramId(req.params.id)
      const diagram   = await Diagram.findById(diagramId)
      if (!diagram) throw createError('Diagram not found', 404)

      const isOwner = diagram.userId.toString() === userId

      if (!isOwner) {
        // Allow collab invitees with editor role
        const collabInvite = await CollabInvite.findOne({
          diagramId,
          userId,
          status: 'accepted',
          role: 'editor',
        }).lean()
        if (!collabInvite) {
          // Fall back to share token check
          const shareToken = typeof req.query.shareToken === 'string' ? req.query.shareToken : null
          if (!shareToken) throw createError('Forbidden', 403)
          const share = await DiagramShare.findOne({ diagramId, token: shareToken }).lean()
          if (!share || share.permission !== 'edit') throw createError('Forbidden — view only', 403)
        }
      }

      const { diagramData, thumbnail } = req.body as {
        diagramData?: unknown
        thumbnail?: string
      }

      if (diagramData !== undefined) diagram.diagramData = diagramData as typeof diagram.diagramData
      if (thumbnail !== undefined) diagram.thumbnail = thumbnail

      await diagram.save()
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // PATCH /diagrams/:id/title
  rename: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const diagram = await assertOwner(req.params.id, req.user!.id)
      const { title } = req.body as { title: string }

      if (!title || !title.trim()) {
        return next(createError('Title cannot be empty', 400))
      }

      diagram.title = title.trim()
      await diagram.save()
      res.json({ ok: true, title: diagram.title })
    } catch (err) {
      next(err)
    }
  },

  // DELETE /diagrams/:id
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assertOwner(req.params.id, req.user!.id)
      await Diagram.findByIdAndDelete(req.params.id)
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}

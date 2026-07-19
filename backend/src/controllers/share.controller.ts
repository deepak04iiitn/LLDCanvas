import { Request, Response, NextFunction } from 'express'
import { DiagramShare } from '../models/diagram-share.model'
import { Diagram } from '../models/diagram.model'
import { createError } from '../middleware/error'
import { User } from '../models/user.model'

// Helper: fetch user email by userId
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const doc = await User.findById(userId).select('email').lean()
    return doc?.email ?? null
  } catch {
    return null
  }
}

export const shareController = {

  // ── GET /diagrams/:id/share  (owner only — returns current share settings)
  getShare: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const diagram = await Diagram.findById(req.params.id).lean()
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)

      const share = await DiagramShare.findOne({ diagramId: req.params.id }).lean()
      res.json({ share: share ?? null })
    } catch (err) { next(err) }
  },

  // ── POST /diagrams/:id/share  (owner — create or update share settings)
  upsertShare: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const diagram = await Diagram.findById(req.params.id).lean()
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)

      const { visibility, permission } = req.body as {
        visibility?: 'public' | 'private'
        permission?: 'view' | 'edit'
      }

      const share = await DiagramShare.findOneAndUpdate(
        { diagramId: req.params.id },
        {
          $setOnInsert: { ownerId: userId },
          $set: {
            ...(visibility  ? { visibility }  : {}),
            ...(permission  ? { permission }   : {}),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )

      res.json({ share })
    } catch (err) { next(err) }
  },

  // ── DELETE /diagrams/:id/share  (owner — turn off sharing)
  removeShare: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const diagram = await Diagram.findById(req.params.id).lean()
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)

      await DiagramShare.deleteOne({ diagramId: req.params.id })
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  // ── POST /diagrams/:id/share/invite  (owner — add email to private list)
  addInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const diagram = await Diagram.findById(req.params.id).lean()
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)

      const { email } = req.body as { email: string }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError('Invalid email address', 400)
      }

      const share = await DiagramShare.findOneAndUpdate(
        { diagramId: req.params.id },
        {
          $setOnInsert: { ownerId: userId, visibility: 'private', permission: 'view' },
          $addToSet: { allowedEmails: email.toLowerCase().trim() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )

      res.json({ share })
    } catch (err) { next(err) }
  },

  // ── DELETE /diagrams/:id/share/invite  (owner — remove email from private list)
  removeInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const diagram = await Diagram.findById(req.params.id).lean()
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)

      const { email } = req.body as { email: string }
      const share = await DiagramShare.findOneAndUpdate(
        { diagramId: req.params.id },
        { $pull: { allowedEmails: email.toLowerCase().trim() } },
        { new: true },
      )

      res.json({ share })
    } catch (err) { next(err) }
  },

  // ── GET /share/:token  (auth required — check access for a shared link viewer)
  checkAccess: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const { token } = req.params

      const share = await DiagramShare.findOne({ token }).lean()
      if (!share) throw createError('Share link is invalid or has expired', 404)

      // Owner always has access
      if (share.ownerId === userId) {
        return res.json({
          canAccess: true,
          isOwner: true,
          diagramId: share.diagramId,
          permission: 'edit',  // owner always has edit
          visibility: share.visibility,
        })
      }

      // Public share — everyone with the link can access
      if (share.visibility === 'public') {
        return res.json({
          canAccess: true,
          isOwner: false,
          diagramId: share.diagramId,
          permission: share.permission,
          visibility: share.visibility,
        })
      }

      // Private share — check invited emails
      const userEmail = await getUserEmail(userId)
      const allowed   = userEmail
        ? share.allowedEmails.includes(userEmail.toLowerCase())
        : false

      if (!allowed) {
        return res.json({ canAccess: false, reason: 'not_invited' })
      }

      return res.json({
        canAccess: true,
        isOwner: false,
        diagramId: share.diagramId,
        permission: share.permission,
        visibility: share.visibility,
      })
    } catch (err) { next(err) }
  },
}

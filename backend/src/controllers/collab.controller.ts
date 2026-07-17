import { Request, Response, NextFunction } from 'express'
import { nanoid } from 'nanoid'
import { Diagram } from '../models/diagram.model'
import { CollabInvite } from '../models/collab-invite.model'
import { Comment } from '../models/comment.model'
import { createError } from '../middleware/error'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertDiagramOwner(diagramId: string, userId: string) {
  const diagram = await Diagram.findById(diagramId)
  if (!diagram) throw createError('Diagram not found', 404)
  if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)
  return diagram
}

// ─── Controller ───────────────────────────────────────────────────────────────

export const collabController = {

  // GET /collab/:diagramId — list all invites (owner only)
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assertDiagramOwner(req.params.diagramId, req.user!.id)
      const invites = await CollabInvite.find({
        diagramId: req.params.diagramId,
        status: { $ne: 'revoked' },
      }).sort({ createdAt: -1 }).lean()
      res.json({ invites })
    } catch (err) { next(err) }
  },

  // POST /collab/:diagramId/invite — invite by email
  invite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role = 'editor' } = req.body as { email: string; role?: string }
      if (!email) throw createError('Email is required', 400)

      const diagram = await assertDiagramOwner(req.params.diagramId, req.user!.id)

      // Check if already invited
      const existing = await CollabInvite.findOne({
        diagramId: req.params.diagramId,
        email: email.toLowerCase(),
        status: { $ne: 'revoked' },
      })
      if (existing) {
        // Update role if changed
        existing.role = role as 'editor' | 'viewer'
        await existing.save()
        return res.json({ invite: existing, updated: true })
      }

      const token = nanoid(32)
      const invite = await CollabInvite.create({
        diagramId: req.params.diagramId,
        email: email.toLowerCase(),
        role,
        status: 'pending',
        invitedBy: req.user!.id,
        token,
      })

      // TODO: send email notification (add nodemailer integration separately)
      console.log(`[collab] Invite link: ${process.env.CLIENT_URL}/collab/accept?token=${token}`)
      console.log(`[collab] Invited ${email} to diagram "${diagram.title}"`)

      res.json({ invite, token, inviteUrl: `${process.env.CLIENT_URL}/collab/accept?token=${token}` })
    } catch (err) { next(err) }
  },

  // PATCH /collab/:diagramId/:inviteId — change role
  updateRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body as { role: 'editor' | 'viewer' }
      await assertDiagramOwner(req.params.diagramId, req.user!.id)
      const invite = await CollabInvite.findByIdAndUpdate(
        req.params.inviteId,
        { role },
        { new: true },
      )
      if (!invite) throw createError('Invite not found', 404)
      res.json({ invite })
    } catch (err) { next(err) }
  },

  // DELETE /collab/:diagramId/:inviteId — revoke
  revoke: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assertDiagramOwner(req.params.diagramId, req.user!.id)
      await CollabInvite.findByIdAndUpdate(req.params.inviteId, { status: 'revoked' })
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  // GET /collab/accept/:token — accept an invite token (called from the frontend redirect)
  accept: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await CollabInvite.findOne({ token: req.params.token, status: 'pending' })
      if (!invite) throw createError('Invalid or expired invite link', 404)

      // Verify the accepting user's email matches the invite
      if (req.user!.email.toLowerCase() !== invite.email) {
        throw createError(`This invite was sent to ${invite.email}. Please sign in with that account.`, 403)
      }

      invite.status   = 'accepted'
      invite.userId   = req.user!.id
      await invite.save()

      res.json({ ok: true, diagramId: invite.diagramId.toString(), role: invite.role })
    } catch (err) { next(err) }
  },

  // PATCH /collab/:diagramId/link — toggle public collab link
  updateLink: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled, role = 'viewer' } = req.body as { enabled: boolean; role?: string }
      const diagram = await assertDiagramOwner(req.params.diagramId, req.user!.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = diagram as any
      d.collabLinkEnabled = enabled
      d.collabLinkRole    = role
      await diagram.save()
      res.json({ ok: true, collabLinkEnabled: enabled, collabLinkRole: role })
    } catch (err) { next(err) }
  },

  // GET /collab/join/:token — join via public link
  joinLink: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find diagram with this collab link token
      // The token IS the diagram ID for public links (we use the diagram ID as the token)
      const invite = await CollabInvite.findOne({ token: req.params.token }).lean()
      if (invite) {
        // Named invite
        if (invite.status === 'revoked') throw createError('This invite has been revoked', 403)
        if (invite.email !== req.user!.email.toLowerCase()) {
          throw createError('This invite is for a different account', 403)
        }
        if (invite.status === 'pending') {
          await CollabInvite.findByIdAndUpdate(invite._id, { status: 'accepted', userId: req.user!.id })
        }
        return res.json({ ok: true, diagramId: invite.diagramId.toString(), role: invite.role })
      }
      throw createError('Invalid link', 404)
    } catch (err) { next(err) }
  },

  // GET /collab/comments/:diagramId — load all comments (REST fallback for initial load)
  listComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { diagramId } = req.params
      // Verify access
      const diagram = await Diagram.findById(diagramId)
      if (!diagram) throw createError('Diagram not found', 404)
      const isOwner = diagram.userId.toString() === req.user!.id
      if (!isOwner) {
        const invite = await CollabInvite.findOne({
          diagramId,
          email: req.user!.email.toLowerCase(),
          status: 'accepted',
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!invite && !(diagram as any).collabLinkEnabled) {
          throw createError('Access denied', 403)
        }
      }
      const comments = await Comment.find({ diagramId }).sort({ createdAt: 1 }).lean()
      res.json({ comments })
    } catch (err) { next(err) }
  },

  // GET /collab/my-access/:diagramId — check current user's role
  myAccess: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { diagramId } = req.params
      const diagram = await Diagram.findById(diagramId)
      if (!diagram) throw createError('Diagram not found', 404)

      if (diagram.userId.toString() === req.user!.id) {
        return res.json({ role: 'owner', collabLinkEnabled: (diagram as any).collabLinkEnabled ?? false, collabLinkRole: (diagram as any).collabLinkRole ?? 'viewer' })
      }

      const invite = await CollabInvite.findOne({
        diagramId,
        email: req.user!.email.toLowerCase(),
        status: 'accepted',
      }).lean()

      if (invite) return res.json({ role: invite.role })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((diagram as any).collabLinkEnabled) {
        return res.json({ role: (diagram as any).collabLinkRole ?? 'viewer' })
      }

      res.status(403).json({ error: 'No access' })
    } catch (err) { next(err) }
  },
}

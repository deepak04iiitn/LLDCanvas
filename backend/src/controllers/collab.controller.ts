import { Request, Response, NextFunction } from 'express'
import { nanoid } from 'nanoid'
import { Diagram } from '../models/diagram.model'
import { CollabInvite } from '../models/collab-invite.model'
import { Comment } from '../models/comment.model'
import { DiagramVersion } from '../models/diagram-version.model'
import { createError } from '../middleware/error'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertDiagramOwner(diagramId: string | string[], userId: string | string[]) {
  const id  = Array.isArray(diagramId) ? diagramId[0] : diagramId
  const uid = Array.isArray(userId)    ? userId[0]    : userId
  const diagram = await Diagram.findById(id)
  if (!diagram) throw createError('Diagram not found', 404)
  if (diagram.userId.toString() !== uid) throw createError('Forbidden', 403)
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

  // GET /collab/my-stats — collab dashboard metrics for the current user
  myStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const email  = req.user!.email.toLowerCase()

      // Diagrams I own that have at least one accepted collaborator
      const myDiagramIds = await Diagram.find({ userId }).distinct('_id')

      const sharedDiagramIds = await CollabInvite.distinct('diagramId', {
        diagramId: { $in: myDiagramIds },
        status: 'accepted',
      })

      // Unique collaborators across my diagrams
      const collaborators = await CollabInvite.distinct('email', {
        diagramId: { $in: myDiagramIds },
        status: 'accepted',
      })

      // Diagrams I'm collaborating on (invited by others)
      const collaboratingOn = await CollabInvite.countDocuments({
        email,
        status: 'accepted',
      })

      // Pending invites I sent
      const pendingInvites = await CollabInvite.countDocuments({
        diagramId: { $in: myDiagramIds },
        status: 'pending',
      })

      // Total comments across all my shared diagrams
      const totalComments = await Comment.countDocuments({
        diagramId: { $in: sharedDiagramIds },
      })

      res.json({
        sharedDiagrams:   sharedDiagramIds.length,
        collaboratingOn,
        totalCollaborators: collaborators.length,
        pendingInvites,
        totalComments,
      })
    } catch (err) { next(err) }
  },

  // GET /collab/my-diagrams — diagrams I own with their collaborators
  myCollabDiagrams: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const myDiagramIds = await Diagram.find({ userId }).distinct('_id')

      const invites = await CollabInvite.find({
        diagramId: { $in: myDiagramIds },
        status: { $ne: 'revoked' },
      }).sort({ createdAt: -1 }).lean()

      const diagramMap = new Map<string, { diagramId: string; collaborators: typeof invites }>()
      for (const inv of invites) {
        const id = inv.diagramId.toString()
        if (!diagramMap.has(id)) diagramMap.set(id, { diagramId: id, collaborators: [] })
        diagramMap.get(id)!.collaborators.push(inv)
      }

      const activeDiagramIds = [...diagramMap.keys()]
      const diagrams = await Diagram.find({ _id: { $in: activeDiagramIds } })
        .select('_id title thumbnail updatedAt')
        .lean()

      const result = diagrams.map(d => ({
        ...d,
        collaborators: diagramMap.get(d._id.toString())?.collaborators ?? [],
      }))

      // Also include diagrams where I'm a collaborator
      const asCollaborator = await CollabInvite.find({
        email: req.user!.email.toLowerCase(),
        status: 'accepted',
      }).lean()

      const collabDiagramIds = asCollaborator.map(i => i.diagramId)
      const collabDiagrams = await Diagram.find({ _id: { $in: collabDiagramIds } })
        .select('_id title thumbnail updatedAt userId')
        .lean()

      res.json({
        owned: result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        collaborating: collabDiagrams.map((d, i) => ({
          ...d,
          myRole: asCollaborator[i]?.role ?? 'viewer',
        })),
      })
    } catch (err) { next(err) }
  },

  // GET /collab/activity — recent activity timeline for the current user's collab diagrams
  activity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const email  = req.user!.email.toLowerCase()

      const myDiagramIds = await Diagram.find({ userId }).distinct('_id')
      const collabInvites = await CollabInvite.find({ email, status: 'accepted' }).distinct('diagramId')
      const allDiagramIds = [...new Set([...myDiagramIds.map(String), ...collabInvites.map(String)])]

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // last 30 days

      const [recentComments, recentInvites, recentVersions] = await Promise.all([
        Comment.find({ diagramId: { $in: allDiagramIds }, createdAt: { $gte: since } })
          .sort({ createdAt: -1 }).limit(30)
          .populate<{ diagramId: { _id: string; title: string } }>('diagramId', 'title')
          .lean(),
        CollabInvite.find({
          diagramId: { $in: myDiagramIds },
          status: 'accepted',
          updatedAt: { $gte: since },
        }).sort({ updatedAt: -1 }).limit(20).lean(),
        DiagramVersion.find({ diagramId: { $in: allDiagramIds }, createdAt: { $gte: since } })
          .sort({ createdAt: -1 }).limit(40)
          .populate<{ diagramId: { _id: string; title: string } }>('diagramId', 'title')
          .lean(),
      ])

      // Enrich invites with diagram titles
      const inviteDiagramIds = recentInvites.map(i => i.diagramId)
      const inviteDiagrams = await Diagram.find({ _id: { $in: inviteDiagramIds } })
        .select('_id title').lean()
      const inviteDiagramMap = new Map(inviteDiagrams.map(d => [d._id.toString(), d.title]))

      const events: {
        type: 'comment' | 'invite_accepted' | 'save'
        diagramId: string
        diagramTitle: string
        actor: string
        detail: string
        timestamp: Date
      }[] = []

      for (const c of recentComments) {
        const d = c.diagramId as unknown as { _id: string; title: string }
        events.push({
          type: 'comment',
          diagramId: d?._id?.toString() ?? '',
          diagramTitle: d?.title ?? 'Untitled',
          actor: c.authorName,
          detail: c.content.slice(0, 80),
          timestamp: c.createdAt,
        })
      }

      for (const inv of recentInvites) {
        events.push({
          type: 'invite_accepted',
          diagramId: inv.diagramId.toString(),
          diagramTitle: inviteDiagramMap.get(inv.diagramId.toString()) ?? 'Untitled',
          actor: inv.email,
          detail: `Joined as ${inv.role}`,
          timestamp: inv.updatedAt,
        })
      }

      for (const v of recentVersions) {
        const d = v.diagramId as unknown as { _id: string; title: string }
        events.push({
          type: 'save',
          diagramId: d?._id?.toString() ?? '',
          diagramTitle: d?.title ?? 'Untitled',
          actor: v.userName,
          detail: `${v.nodeCount} nodes · ${v.edgeCount} edges`,
          timestamp: v.createdAt,
        })
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      res.json({ events: events.slice(0, 50) })
    } catch (err) { next(err) }
  },

  // GET /collab/versions/:diagramId — version history for a diagram
  versions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { diagramId } = req.params
      const userId = req.user!.id
      const email  = req.user!.email.toLowerCase()

      const diagram = await Diagram.findById(diagramId)
      if (!diagram) throw createError('Diagram not found', 404)

      const isOwner = diagram.userId.toString() === userId
      if (!isOwner) {
        const invite = await CollabInvite.findOne({ diagramId, email, status: 'accepted' }).lean()
        if (!invite) throw createError('Access denied', 403)
      }

      const versions = await DiagramVersion.find({ diagramId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()

      res.json({ versions })
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

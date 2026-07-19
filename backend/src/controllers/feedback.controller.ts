import { Request, Response } from 'express'
import { Feedback, type FeedbackStatus, type FeedbackPriority } from '../models/feedback.model'

// ─── Public: submit feedback ──────────────────────────────────────────────────

export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { type, title, description, pageUrl } = req.body
    if (!type || !title?.trim() || !description?.trim()) {
      res.status(400).json({ error: 'type, title and description are required' })
      return
    }

    const fb = await Feedback.create({
      type,
      title:       title.trim().slice(0, 200),
      description: description.trim().slice(0, 5000),
      userId:      req.user?.id ?? null,
      name:        req.user?.name  ?? req.body.name  ?? 'Anonymous',
      email:       req.user?.email ?? req.body.email ?? '',
      pageUrl:     pageUrl ?? '',
      userAgent:   req.headers['user-agent'] ?? '',
    })

    res.status(201).json({ ok: true, id: fb._id })
  } catch (err) {
    console.error('submitFeedback:', err)
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
}

// ─── Admin: list feedback ─────────────────────────────────────────────────────

export async function listFeedback(req: Request, res: Response): Promise<void> {
  try {
    const {
      status, type, priority,
      q, page = '1', limit = '20',
      sort = 'createdAt', order = 'desc',
    } = req.query as Record<string, string>

    const filter: Record<string, unknown> = {}
    if (status)   filter.status   = status
    if (type)     filter.type     = type
    if (priority) filter.priority = priority
    if (q?.trim()) {
      const re = new RegExp(q.trim(), 'i')
      filter.$or = [{ title: re }, { description: re }, { name: re }, { email: re }]
    }

    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const sortDir  = order === 'asc' ? 1 : -1

    const [items, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ [sort]: sortDir })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Feedback.countDocuments(filter),
    ])

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch (err) {
    console.error('listFeedback:', err)
    res.status(500).json({ error: 'Failed to list feedback' })
  }
}

// ─── Admin: get single ────────────────────────────────────────────────────────

export async function getFeedback(req: Request, res: Response): Promise<void> {
  try {
    const fb = await Feedback.findById(req.params.id).lean()
    if (!fb) { res.status(404).json({ error: 'Not found' }); return }
    res.json(fb)
  } catch {
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
}

// ─── Admin: update status / priority / note ───────────────────────────────────

export async function updateFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { status, priority, adminNote, tags } = req.body
    const allowed: Partial<{ status: FeedbackStatus; priority: FeedbackPriority; adminNote: string; tags: string[] }> = {}

    const validStatuses:   FeedbackStatus[]   = ['open','in_progress','resolved','closed','duplicate']
    const validPriorities: FeedbackPriority[] = ['low','medium','high','critical']

    if (status   && validStatuses.includes(status))       allowed.status    = status
    if (priority && validPriorities.includes(priority))   allowed.priority  = priority
    if (typeof adminNote === 'string')                     allowed.adminNote = adminNote.slice(0, 2000)
    if (Array.isArray(tags))                               allowed.tags      = tags.slice(0, 10)

    const fb = await Feedback.findByIdAndUpdate(req.params.id, { $set: allowed }, { new: true })
    if (!fb) { res.status(404).json({ error: 'Not found' }); return }
    res.json(fb)
  } catch {
    res.status(500).json({ error: 'Failed to update feedback' })
  }
}

// ─── Admin: delete ────────────────────────────────────────────────────────────

export async function deleteFeedback(req: Request, res: Response): Promise<void> {
  try {
    await Feedback.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete feedback' })
  }
}

// ─── Admin: stats overview ────────────────────────────────────────────────────

export async function feedbackStats(req: Request, res: Response): Promise<void> {
  try {
    const [byStatus, byType, byPriority, recentItems, total] = await Promise.all([
      Feedback.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$type',     count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Feedback.find().sort({ createdAt: -1 }).limit(5).lean(),
      Feedback.countDocuments(),
    ])

    const toMap = (arr: { _id: string; count: number }[]) =>
      Object.fromEntries(arr.map(x => [x._id, x.count]))

    res.json({
      total,
      byStatus:   toMap(byStatus),
      byType:     toMap(byType),
      byPriority: toMap(byPriority),
      recentItems,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

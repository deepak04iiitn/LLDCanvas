import { Request, Response } from 'express'
import { Testimonial } from '../models/testimonial.model'

// ─── Public: get approved testimonials ───────────────────────────────────────

export async function getApprovedTestimonials(_req: Request, res: Response): Promise<void> {
  try {
    const items = await Testimonial.find({ status: 'approved' })
      .sort({ featured: -1, createdAt: -1 })
      .select('name role content rating avatar featured createdAt')
      .lean()
    res.json(items)
  } catch {
    res.status(500).json({ error: 'Failed to fetch testimonials' })
  }
}

// ─── Auth: submit testimonial ─────────────────────────────────────────────────

export async function submitTestimonial(req: Request, res: Response): Promise<void> {
  try {
    const { role, content, rating } = req.body
    if (!content?.trim() || !rating) {
      res.status(400).json({ error: 'content and rating are required' })
      return
    }
    const r = Number(rating)
    if (r < 1 || r > 5) {
      res.status(400).json({ error: 'rating must be between 1 and 5' })
      return
    }

    // One testimonial per user (upsert pending — don't let them spam)
    const existing = await Testimonial.findOne({ userId: req.user!.id, status: { $in: ['pending', 'approved'] } })
    if (existing) {
      res.status(409).json({ error: 'You already have a testimonial submitted or approved.' })
      return
    }

    const t = await Testimonial.create({
      userId:  req.user!.id,
      name:    req.user!.name,
      email:   req.user!.email,
      avatar:  req.user!.image ?? '',
      role:    role?.trim().slice(0, 100) ?? '',
      content: content.trim().slice(0, 1000),
      rating:  r,
    })

    res.status(201).json({ ok: true, id: t._id })
  } catch {
    res.status(500).json({ error: 'Failed to submit testimonial' })
  }
}

// ─── Admin: list all ──────────────────────────────────────────────────────────

export async function listTestimonials(req: Request, res: Response): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))

    const [items, total] = await Promise.all([
      Testimonial.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Testimonial.countDocuments(filter),
    ])
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch {
    res.status(500).json({ error: 'Failed to list testimonials' })
  }
}

// ─── Admin: approve / reject / feature / note ────────────────────────────────

export async function updateTestimonial(req: Request, res: Response): Promise<void> {
  try {
    const { status, featured, adminNote } = req.body
    const update: Record<string, unknown> = {}
    if (status   && ['pending','approved','rejected'].includes(status)) update.status    = status
    if (typeof featured   === 'boolean')                                  update.featured  = featured
    if (typeof adminNote  === 'string')                                   update.adminNote = adminNote.slice(0, 500)

    const t = await Testimonial.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
    if (!t) { res.status(404).json({ error: 'Not found' }); return }
    res.json(t)
  } catch {
    res.status(500).json({ error: 'Failed to update testimonial' })
  }
}

// ─── Admin: delete ────────────────────────────────────────────────────────────

export async function deleteTestimonial(req: Request, res: Response): Promise<void> {
  try {
    await Testimonial.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete testimonial' })
  }
}

// ─── Admin: stats ─────────────────────────────────────────────────────────────

export async function testimonialStats(_req: Request, res: Response): Promise<void> {
  try {
    const [byStatus, total, avgRating] = await Promise.all([
      Testimonial.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Testimonial.countDocuments(),
      Testimonial.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ])
    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map(x => [x._id, x.count])),
      avgRating: avgRating[0]?.avg ?? 0,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

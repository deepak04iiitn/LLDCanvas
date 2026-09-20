import { Request, Response, NextFunction } from 'express'
import { PublishedDesign } from '../../models/community/published-design.model'
import { DesignReport } from '../../models/community/design-report.model'
import { Diagram } from '../../models/diagram.model'
import { ReplayEvent } from '../../models/artifact/replay-event.model'
import { createError } from '../../middleware/error'
import { randomBytes } from 'crypto'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

function slugify(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `${base || 'design'}-${randomBytes(3).toString('hex')}`
}

export async function listGallery(req: Request, res: Response, next: NextFunction) {
  try {
    const designs = await PublishedDesign.find({ visibility: 'public' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(48)
      .lean()
    res.json({ designs })
  } catch (e) { next(e) }
}

export async function getDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const design = await PublishedDesign.findOne({ slug: paramId(req.params.slug), visibility: { $in: ['public', 'unlisted'] } }).lean()
    if (!design) throw createError('Not found', 404)
    const diagram = await Diagram.findById(design.diagramId).select('diagramData title').lean()
    res.json({ design, diagram })
  } catch (e) { next(e) }
}

export async function publishDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const diagramId = String(req.body.diagramId ?? '')
    const diagram = await Diagram.findById(diagramId)
    if (!diagram) throw createError('Diagram not found', 404)
    if (diagram.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)

    const doc = await PublishedDesign.create({
      diagramId,
      userId: req.user!.id,
      slug: slugify(String(req.body.title || diagram.title)),
      title: String(req.body.title || diagram.title),
      summary: String(req.body.summary ?? ''),
      visibility: req.body.visibility ?? 'public',
      thumbnail: diagram.thumbnail,
      problemId: req.body.problemId,
      replayEnabled: Boolean(req.body.replayEnabled),
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
}

export async function forkDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const parent = await PublishedDesign.findOne({ slug: paramId(req.params.slug), visibility: { $in: ['public', 'unlisted'] } })
    if (!parent) throw createError('Not found', 404)
    const source = await Diagram.findById(parent.diagramId)
    if (!source) throw createError('Source missing', 404)

    const copy = await Diagram.create({
      userId: req.user!.id,
      title: `${parent.title} (fork)`,
      diagramData: source.diagramData,
      origin: 'manual',
      forkParentId: source._id,
    })

    res.status(201).json({ diagramId: copy.id, title: copy.title })
  } catch (e) { next(e) }
}

export async function adminListGallery(_req: Request, res: Response, next: NextFunction) {
  try {
    const designs = await PublishedDesign.find().sort({ updatedAt: -1 }).limit(200).lean()
    res.json({ designs })
  } catch (e) { next(e) }
}

export async function adminModerate(req: Request, res: Response, next: NextFunction) {
  try {
    const action = String(req.body.action ?? '')
    const update: Record<string, unknown> = {}
    if (action === 'feature') update.featured = true
    if (action === 'unfeature') update.featured = false
    if (action === 'unpublish') update.visibility = 'private'
    if (action === 'publish') update.visibility = 'public'
    const doc = await PublishedDesign.findByIdAndUpdate(paramId(req.params.id), update, { new: true })
    if (!doc) throw createError('Not found', 404)
    res.json(doc)
  } catch (e) { next(e) }
}

export async function watchDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const design = await PublishedDesign.findOne({
      slug: paramId(req.params.slug),
      visibility: { $in: ['public', 'unlisted'] },
    }).lean()
    if (!design) throw createError('Not found', 404)

    let events: unknown[] = []
    if (design.replayEnabled && design.diagramId) {
      events = await ReplayEvent.find({ diagramId: design.diagramId })
        .sort({ t: 1 })
        .limit(500)
        .select('t type payload')
        .lean()
    }
    res.json({ events })
  } catch (e) {
    next(e)
  }
}

export async function listForks(req: Request, res: Response, next: NextFunction) {
  try {
    const design = await PublishedDesign.findOne({
      slug: paramId(req.params.slug),
      visibility: { $in: ['public', 'unlisted'] },
    }).lean()
    if (!design) throw createError('Not found', 404)

    const forks = await Diagram.find({ forkParentId: design.diagramId })
      .select('title userId createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json({
      forks: forks.map(f => ({
        diagramId: String(f._id),
        title: f.title,
        userId: String(f.userId),
        createdAt: f.createdAt,
      })),
    })
  } catch (e) {
    next(e)
  }
}

export async function listAlternatives(req: Request, res: Response, next: NextFunction) {
  try {
    const problem = String(req.query.problem ?? '').trim()
    if (!problem) {
      res.json({ groups: [] })
      return
    }

    // MVP: if problem looks like ObjectId, group published designs by problemId
    if (/^[a-f\d]{24}$/i.test(problem)) {
      const designs = await PublishedDesign.find({
        problemId: problem,
        visibility: 'public',
      })
        .select('slug title summary thumbnail featured createdAt')
        .sort({ featured: -1, createdAt: -1 })
        .limit(48)
        .lean()
      res.json({
        groups: designs.length
          ? [{ problemId: problem, designs }]
          : [],
      })
      return
    }

    res.json({ groups: [] })
  } catch (e) {
    next(e)
  }
}

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = String(req.body.slug ?? '').trim()
    const reason = String(req.body.reason ?? '').trim()
    if (!slug || !reason) throw createError('slug and reason required', 400)

    const design = await PublishedDesign.findOne({ slug }).lean()
    if (!design) throw createError('Design not found', 404)

    await DesignReport.create({
      slug,
      reason,
      reporterId: req.user?.id,
      status: 'open',
    })
    res.status(201).json({ ok: true })
  } catch (e) {
    next(e)
  }
}

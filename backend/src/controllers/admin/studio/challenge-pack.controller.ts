import { Request, Response, NextFunction } from 'express'
import { ChallengePack, type ChallengePackType } from '../../../models/studio/challenge-pack.model'
import { createError } from '../../../middleware/error'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function adminListPacks(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as ChallengePackType | undefined
    const filter: Record<string, unknown> = {}
    if (type) filter.type = type
    const packs = await ChallengePack.find(filter).sort({ order: 1, updatedAt: -1 }).lean()
    res.json({ packs })
  } catch (e) { next(e) }
}

export async function adminCreatePack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await ChallengePack.create({
      type: req.body.type,
      slug: req.body.slug,
      title: req.body.title,
      difficulty: req.body.difficulty ?? 'medium',
      description: req.body.description ?? '',
      diagramSnapshot: req.body.diagramSnapshot ?? { version: 1, nodes: [], edges: [], meta: {} },
      payload: req.body.payload ?? {},
      status: req.body.status ?? 'draft',
      planMin: req.body.planMin ?? 'free',
      tags: req.body.tags ?? [],
      order: req.body.order ?? 0,
      problemId: req.body.problemId,
    })
    res.status(201).json(pack)
  } catch (e) { next(e) }
}

export async function adminUpdatePack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await ChallengePack.findByIdAndUpdate(paramId(req.params.id), req.body, { new: true })
    if (!pack) throw createError('Not found', 404)
    res.json(pack)
  } catch (e) { next(e) }
}

export async function adminDeletePack(req: Request, res: Response, next: NextFunction) {
  try {
    await ChallengePack.findByIdAndDelete(paramId(req.params.id))
    res.json({ ok: true })
  } catch (e) { next(e) }
}

export async function adminPublishPack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await ChallengePack.findByIdAndUpdate(
      paramId(req.params.id),
      { status: 'published' },
      { new: true },
    )
    if (!pack) throw createError('Not found', 404)
    res.json(pack)
  } catch (e) { next(e) }
}

export async function adminBulkDeletePacks(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await ChallengePack.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

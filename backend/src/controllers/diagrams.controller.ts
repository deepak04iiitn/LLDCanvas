import { Request, Response, NextFunction } from 'express'
import { Diagram } from '../models/diagram.model'
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
      const { title, fromTemplateId } = req.body as { title?: string; fromTemplateId?: string }

      let diagramData = undefined

      if (fromTemplateId) {
        const template = await Diagram.findOne({ _id: fromTemplateId, isTemplate: true }).lean()
        if (template) diagramData = template.diagramData
      }

      const diagram = await Diagram.create({
        userId,
        title: title ?? 'Untitled Diagram',
        ...(diagramData ? { diagramData } : {}),
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

  // GET /diagrams/templates
  listTemplates: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await Diagram.find({ isTemplate: true })
        .select('_id title thumbnail')
        .sort({ title: 1 })
        .lean()

      res.json({ templates })
    } catch (err) {
      next(err)
    }
  },

  // GET /diagrams/:id
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const diagram = await assertOwner(req.params.id, req.user!.id)
      res.json({ diagram })
    } catch (err) {
      next(err)
    }
  },

  // PUT /diagrams/:id  (autosave)
  save: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const diagram = await assertOwner(req.params.id, req.user!.id)
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

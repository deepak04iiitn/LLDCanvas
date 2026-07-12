import { Request, Response, NextFunction } from 'express'

// Phase 2: all methods will be fully implemented with Mongoose queries.
// Stubs kept intentionally minimal — no logic lives in routes.

export const diagramsController = {
  // GET /diagrams
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 2: Diagram.find({ userId: req.user._id }).select('-diagramData').sort({ updatedAt: -1 })
      res.json({ diagrams: [] })
    } catch (err) {
      next(err)
    }
  },

  // POST /diagrams
  create: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 2: new Diagram({ userId: req.user._id, ...req.body })
      res.status(201).json({ diagram: null })
    } catch (err) {
      next(err)
    }
  },

  // GET /diagrams/templates
  listTemplates: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 8: Diagram.find({ isTemplate: true }).select('-diagramData')
      res.json({ templates: [] })
    } catch (err) {
      next(err)
    }
  },

  // GET /diagrams/:id
  getOne: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 2: Diagram.findOne({ _id: req.params.id, userId: req.user._id })
      res.json({ diagram: null })
    } catch (err) {
      next(err)
    }
  },

  // PUT /diagrams/:id
  save: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 7: Diagram.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { diagramData: req.body.diagramData, updatedAt: new Date() })
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // PATCH /diagrams/:id/title
  rename: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 2: Diagram.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { title: req.body.title })
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // DELETE /diagrams/:id
  remove: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 2: Diagram.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}

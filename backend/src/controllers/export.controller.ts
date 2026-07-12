import { Request, Response, NextFunction } from 'express'

// Phase 7: server-side export logic lives here (PlantUML, or server-rendered SVG if needed).
// PNG/SVG export is handled client-side via html-to-image — this endpoint is a placeholder.

export const exportController = {
  // POST /diagrams/:id/export
  exportDiagram: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Phase 7: fetch diagram, run export pipeline, return file
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}

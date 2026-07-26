import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/error'
import { getLimits } from '../config/plans'

const VALID_FORMATS = new Set(['png', 'svg', 'plantuml', 'mermaid', 'draft'])

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

  // POST /diagrams/export-authorize — checked server-side (from a fresh DB-backed
  // req.user.plan, see middleware/auth.ts) before the client performs any export.
  // The actual PNG/SVG/PlantUML/Mermaid generation still runs client-side against
  // in-memory canvas state, but it must pass this gate first, so a Free/Pro user
  // can no longer get an entitled-only format just by calling the export helper
  // functions directly from devtools with zero server round-trip.
  authorizeExport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format } = req.body as { format?: string }
      if (!format || !VALID_FORMATS.has(format)) {
        throw createError('Invalid export format', 400)
      }

      const limits = getLimits(req.user!.plan)
      if (!limits.exportFormats.includes(format)) {
        throw createError(`Exporting to ${format} requires a higher plan.`, 403)
      }

      res.json({ authorized: true })
    } catch (err) {
      next(err)
    }
  },
}

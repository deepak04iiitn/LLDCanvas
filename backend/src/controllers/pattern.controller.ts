import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/error'
import { getLimits } from '../config/plans'
import { PRO_PATTERNS } from '../data/pro-patterns'

export const patternController = {
  // GET /patterns/:key — full node/edge skeleton for a Pro-locked pattern.
  // Free-tier patterns are shipped in the client bundle and never hit this
  // endpoint; this only serves the 7 keys in PRO_PATTERNS, re-checking the
  // caller's plan server-side (req.user.plan is fetched fresh from the DB,
  // see middleware/auth.ts) so it can't be bypassed via devtools/console.
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key
      const pattern = PRO_PATTERNS[key]
      if (!pattern) throw createError('Pattern not found', 404)

      const limits = getLimits(req.user!.plan)
      if (limits.patternTemplates !== Infinity) {
        throw createError('This pattern requires a Pro or Ultimate plan.', 403)
      }

      res.json({ pattern })
    } catch (err) { next(err) }
  },
}

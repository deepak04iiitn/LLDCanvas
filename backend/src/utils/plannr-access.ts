import type { Request } from 'express'
import { createError } from '../middleware/error'

/** Plannr full access (use generated content) is Ultimate-only. Free/Pro = try/preview. */
export function assertPlannrFullAccess(req: Request): void {
  if (req.user?.plan === 'ultimate') return
  throw createError(
    'Plannr full access requires Ultimate. You’re previewing — upgrade to use this plan.',
    403,
    { code: 'PLAN_GATE', requiredPlan: 'ultimate' },
  )
}

export function isPlannrPreview(req: Request): boolean {
  return req.user?.plan !== 'ultimate'
}

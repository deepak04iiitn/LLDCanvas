import { Request, Response, NextFunction } from 'express'
import { createError } from './error'

// Placeholder — will be replaced with Better Auth session check in Phase 1
// auth.api.getSession() will live here once Better Auth is configured
export async function requireAuth(
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Phase 1: replace this with actual session validation
  next()
}

export async function optionalAuth(
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  next()
}

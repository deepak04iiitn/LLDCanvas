import { Request, Response, NextFunction } from 'express'
import { getAuth } from '../config/auth'

async function getFromNodeHeaders() {
  const { fromNodeHeaders } = await import('better-auth/node')
  return fromNodeHeaders
}
import { createError } from './error'
import { User } from '../models/user.model'
import type { PlanName } from '../config/plans'

// Augment Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        image?: string
        isAdmin: boolean
        blocked: boolean
        plan: PlanName
      }
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [auth, fromNodeHeaders] = await Promise.all([getAuth(), getFromNodeHeaders()])
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = session.user as any
    if (u.blocked) {
      res.status(403).json({ error: 'Account has been blocked. Contact support.' })
      return
    }
    // Fetch plan from our User collection (single source of truth)
    const dbUser = await User.findById(session.user.id).select('plan').lean()
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? undefined,
      isAdmin: u.isAdmin ?? false,
      blocked: u.blocked ?? false,
      plan: (dbUser?.plan ?? 'free') as PlanName,
    }
    next()
  } catch {
    next(createError('Authentication failed', 401))
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const [auth, fromNodeHeaders] = await Promise.all([getAuth(), getFromNodeHeaders()])
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = session.user as any
      const dbUser = await User.findById(session.user.id).select('plan').lean()
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? undefined,
        isAdmin: u.isAdmin ?? false,
        blocked: u.blocked ?? false,
        plan: (dbUser?.plan ?? 'free') as PlanName,
      }
    }
  } catch {
    // Non-blocking — continue without user if session check fails
  }
  next()
}

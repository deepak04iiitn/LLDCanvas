import { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { getAuth } from '../config/auth'
import { createError } from './error'

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
      }
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = await getAuth()
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
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? undefined,
      isAdmin: u.isAdmin ?? false,
      blocked: u.blocked ?? false,
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
    const auth = await getAuth()
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = session.user as any
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? undefined,
        isAdmin: u.isAdmin ?? false,
        blocked: u.blocked ?? false,
      }
    }
  } catch {
    // Non-blocking — continue without user if session check fails
  }
  next()
}

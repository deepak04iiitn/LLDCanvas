import { Request, Response, NextFunction } from 'express'
import { verifyAuthToken } from '../utils/jwt'
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

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req)
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // JWT verification failing (missing/expired/tampered token) IS a genuine
  // auth failure — 401 is correct here.
  let payload: ReturnType<typeof verifyAuthToken>
  try {
    payload = verifyAuthToken(token)
  } catch {
    next(createError('Authentication failed', 401))
    return
  }

  // A failure past this point (e.g. a DB connection hiccup) means we simply
  // couldn't verify the otherwise-valid token — that's an infra problem, not
  // proof the session is invalid. Reporting it as a 500 (not a 401) matters:
  // a 401 here previously made transient DB errors look identical to "your
  // session expired, please log in again" to the end user, even though the
  // JWT itself (valid for 30 days) was never actually invalid.
  try {
    const user = await User.findById(payload.id)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    if (user.blocked) {
      res.status(403).json({ error: 'Account has been blocked. Contact support.' })
      return
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image ?? undefined,
      isAdmin: user.isAdmin,
      blocked: user.blocked,
      plan: user.plan,
    }
    next()
  } catch (err) {
    next(err)
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
    const token = extractToken(req)
    if (token) {
      const payload = verifyAuthToken(token)
      const user = await User.findById(payload.id)
      if (user && !user.blocked) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          isAdmin: user.isAdmin,
          blocked: user.blocked,
          plan: user.plan,
        }
      }
    }
  } catch {
    // Non-blocking — continue without user if token verification fails
  }
  next()
}

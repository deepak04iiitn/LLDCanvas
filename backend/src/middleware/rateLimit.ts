import { Request } from 'express'
import rateLimit from 'express-rate-limit'

// Stricter limiter for auth endpoints — brute-force protection on sign-in/sign-up.
// Global limiter (index.ts) allows 500 req/15min; auth routes get 20/15min.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
})

// Legitimate background pollers (interview timer sync, analytics heartbeat)
// fire every 30s per open tab and are excluded from the global limiter (see
// index.ts `skip`) so that a few extra tabs/sessions on one IP can't burn
// through the shared budget and 429 every other route for everyone behind
// that IP. They get their own generous, per-identity ceiling instead.
//
// Keyed by the authenticated user id when available (interview sync always
// runs behind requireAuth) so one user's multiple tabs/sessions share a
// bucket, but different users on the same office/NAT IP don't share one.
export const interviewSyncRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 240, // ~16 tabs worth of the 30s sync interval, per user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? 'unknown',
  message: { error: 'Too many requests, please slow down.' },
})

// Analytics heartbeat is unauthenticated, so key by the client-generated
// visitorId (stable per-browser) instead of IP, for the same reason.
export const heartbeatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.body?.visitorId || req.ip || 'unknown',
  message: { error: 'Too many requests, please slow down.' },
})

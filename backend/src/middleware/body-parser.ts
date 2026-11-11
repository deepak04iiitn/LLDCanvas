import express, { type Request, type Response, type NextFunction } from 'express'

// Diagram saves (thumbnails + canvas data), artifact saves, studio/learn submits (diagram snapshots) and admin
// content editors send large bodies. Everything else gets a small cap so a
// stray huge payload is rejected before it is parsed (saves CPU and memory).
const SMALL_LIMIT = '1mb'
const LARGE_LIMIT = '10mb'
const LARGE_ROUTES = /^\/(diagrams|artifacts|admin|studio|learn)(\/|$)/

const verify = (req: Request, _res: Response, buf: Buffer) => {
  // Preserve raw body for Dodo Standard Webhooks signature verification
  ;(req as Request & { rawBody?: Buffer }).rawBody = buf
}

const small = express.json({ limit: SMALL_LIMIT, verify })
const large = express.json({ limit: LARGE_LIMIT, verify })

export function jsonBodyParser(req: Request, res: Response, next: NextFunction) {
  return (LARGE_ROUTES.test(req.path) ? large : small)(req, res, next)
}

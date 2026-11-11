import type { Request, Response, NextFunction } from 'express'

/**
 * Tiny per-instance in-memory cache for read-mostly data (content catalogues
 * that only change when an admin edits them). Each warm serverless instance
 * keeps its own copy, so a DB read happens at most once per TTL per instance
 * instead of once per request.
 *
 * Cached values are shared: treat them as read-only (copy before mutating).
 */
const DEFAULT_TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 200

interface Entry { value: unknown; exp: number }
const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()

export async function cached<T>(key: string, loader: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.exp > Date.now()) return hit.value as T

  // Concurrent callers during a miss share one DB query.
  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const p = loader()
    .then(value => {
      if (store.size >= MAX_ENTRIES) store.clear()
      store.set(key, { value, exp: Date.now() + ttlMs })
      return value
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

/** Drop every entry, or only those whose key starts with `prefix`. */
export function invalidateCache(prefix?: string) {
  if (!prefix) { store.clear(); return }
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k)
}

/**
 * Admin routers mount this so any successful write (POST/PUT/PATCH/DELETE)
 * clears the cache on that instance and admins see their edits immediately.
 * Other warm instances catch up within the TTL.
 */
export function clearCacheOnWrite(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.on('finish', () => { if (res.statusCode < 400) invalidateCache() })
  }
  next()
}

/** Edge/CDN caching header for fully public (no per-user data) GET responses. */
export function publicCache(res: Response, sMaxAgeSeconds = 300) {
  res.set('Cache-Control', `public, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=3600`)
}

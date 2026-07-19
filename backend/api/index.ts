/**
 * Vercel serverless entry point.
 * Initialises DB + auth once (cached across warm invocations) then
 * exports the Express app so Vercel can call it as a handler.
 */
import 'dotenv/config'
import { createServer } from 'http'
import express from 'express'
import cors, { type CorsOptions } from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from '../src/config/db'
import { getAuth, ensureAdminUser } from '../src/config/auth'
import { errorHandler } from '../src/middleware/error'
import { authRateLimit } from '../src/middleware/rateLimit'
import { initSocketServer } from '../src/socket'
import { dynamicImport } from '../src/utils/dynamic-import'
import diagramsRouter    from '../src/routes/diagrams.route'
import exportRouter      from '../src/routes/export.route'
import accountRouter     from '../src/routes/account.route'
import interviewRouter   from '../src/routes/interview.route'
import statsRouter       from '../src/routes/stats.route'
import adminRouter       from '../src/routes/admin.route'
import analyticsRouter   from '../src/routes/analytics.route'
import shareRouter       from '../src/routes/share.route'
import problemsRouter    from '../src/routes/problems.route'
import revisionRouter    from '../src/routes/revision.route'
import collabRouter      from '../src/routes/collab.route'
import codeRouter        from '../src/routes/code.route'
import billingRouter     from '../src/routes/billing.route'
import feedbackRouter    from '../src/routes/feedback.route'
import testimonialRouter from '../src/routes/testimonial.route'
import { startSubscriptionExpiryJob } from '../src/jobs/expire-subscriptions'

const app        = express()
const httpServer = createServer(app)

// Vercel runs behind a proxy and sets X-Forwarded-For; without this,
// express-rate-limit throws on every request instead of rate-limiting by IP.
app.set('trust proxy', 1)

const allowedOrigins: string[] = (
  process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? 'http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error(`CORS: origin "${origin}" not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}

app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.use('/api/auth/sign-in', authRateLimit)
app.use('/api/auth/sign-up', authRateLimit)

app.all('/api/auth/*', cors(corsOptions), async (req, res, next) => {
  try {
    const requestOrigin = req.headers.origin as string | undefined
    const isAllowed = Boolean(requestOrigin && allowedOrigins.includes(requestOrigin))

    if (req.method === 'OPTIONS') {
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin!)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie')
        res.setHeader('Vary', 'Origin')
      }
      return res.status(204).end()
    }

    if (isAllowed) {
      const _writeHead = res.writeHead.bind(res)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(res as any).writeHead = (statusCode: number, ...rest: unknown[]) => {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin!)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Vary', 'Origin')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (_writeHead as any)(statusCode, ...rest)
      }
    }

    const auth = await getAuth()
    const { toNodeHandler } = await dynamicImport<typeof import('better-auth/node')>('better-auth/node')
    return toNodeHandler(auth)(req, res)
  } catch (err) {
    next(err)
  }
})

// better-auth's signIn.social() normally does a cross-origin fetch() POST
// to mint the OAuth "state" cookie, then redirects the browser to Google —
// but that fetch() response is cross-site (frontend calling backend), so
// third-party cookie blocking silently drops the state cookie, causing
// Google's callback to fail with "state_mismatch". Fix: mint that cookie
// during a same-origin top-level navigation instead, by having the browser
// hit this GET route directly (no preceding fetch) which calls
// signInSocial server-side, forwards whatever cookie(s) it sets, and
// redirects straight to Google.
app.get('/auth/google/start', async (req, res, next) => {
  try {
    const redirectPath = typeof req.query.redirect === 'string' ? req.query.redirect : '/dashboard'
    const auth = await getAuth()
    const { fromNodeHeaders } = await dynamicImport<typeof import('better-auth/node')>('better-auth/node')
    const backendOrigin = (process.env.BETTER_AUTH_URL ?? 'http://localhost:4000').trim().replace(/\/+$/, '')
    const bridgeCallback = `${backendOrigin}/auth/bridge?redirect=${encodeURIComponent(redirectPath)}`

    const result = (await auth.api.signInSocial({
      body: { provider: 'google', callbackURL: bridgeCallback },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    })) as { headers?: Headers; response?: { url?: string } }

    const setCookies = (result.headers as Headers & { getSetCookie?: () => string[] })?.getSetCookie?.()
      ?? (result.headers?.get('set-cookie') ? [result.headers.get('set-cookie')!] : [])
    if (setCookies.length) res.setHeader('Set-Cookie', setCookies)

    const url = result.response?.url
    if (!url) throw new Error('signInSocial did not return an authorization URL')
    res.redirect(url)
  } catch (err) {
    next(err)
  }
})

// Google OAuth is a full-page redirect, so signIn.social's callbackURL
// never passes through the frontend's fetch-based bearer-token capture.
// Point that callbackURL at this same-origin bridge instead: the just-set
// session cookie is still first-party here (browser navigating directly
// to the backend), so we can mint the bearer token and hand it to the
// frontend via a query param on the final redirect.
app.get('/auth/bridge', async (req, res) => {
  const redirectPath = typeof req.query.redirect === 'string' ? req.query.redirect : '/dashboard'
  const frontendOrigin = allowedOrigins[0] ?? 'http://localhost:3000'
  const target = new URL(redirectPath, frontendOrigin)
  try {
    const auth = await getAuth()
    const { fromNodeHeaders } = await dynamicImport<typeof import('better-auth/node')>('better-auth/node')
    const result = (await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    })) as { headers?: Headers }
    const token = result.headers?.get('set-auth-token')
    if (token) target.searchParams.set('bearer_token', token)
  } catch {
    // Fall through to redirecting without a token — the frontend simply
    // stays signed out, same as if this bridge didn't exist.
  }
  res.redirect(target.toString())
})

app.use('/diagrams',       diagramsRouter)
app.use('/diagrams',       exportRouter)
app.use('/account',        accountRouter)
app.use('/interview',      interviewRouter)
app.use('/stats',          statsRouter)
app.use('/admin',          adminRouter)
app.use('/analytics',      analyticsRouter)
app.use('/share',          shareRouter)
app.use('/problems',       problemsRouter)
app.use('/revision-notes', revisionRouter)
app.use('/collab',         collabRouter)
app.use('/code',           codeRouter)
app.use('/billing',        billingRouter)
app.use('/feedback',       feedbackRouter)
app.use('/testimonials',   testimonialRouter)

app.use(errorHandler)

// ─── Bootstrap (runs once per cold start) ────────────────────────────────────
let ready = false
async function bootstrap() {
  if (ready) return
  await connectDB()
  await getAuth()
  await ensureAdminUser()
  initSocketServer(httpServer, allowedOrigins)
  startSubscriptionExpiryJob()
  ready = true
}

bootstrap().catch(console.error)

export default app

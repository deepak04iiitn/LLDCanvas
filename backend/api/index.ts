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
import { ensureAdminUser } from '../src/config/admin'
import { errorHandler } from '../src/middleware/error'
import { initSocketServer } from '../src/socket'
import authRouter         from '../src/routes/auth.route'
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

// ─── Bootstrap gate ────────────────────────────────────────────────────────────
// Every request past this point WAITS for the DB connection + one-time
// cold-start init instead of racing it. Previously this was fire-and-forget
// at module scope, so a request that triggered a cold start could reach a
// route handler before Mongoose had finished connecting — any query on that
// request then buffered and, after Mongoose's default 10s timeout, threw
// "buffering timed out". requireAuth's error handling turned that into a
// misleading 401, making it look like the user's session had expired when
// the real cause was this race, not token expiry (a separate, already-
// 30-day-lived JWT).
//
// connectDB() runs on every request (not just the first) because it must
// also cover reconnecting after a genuine mid-lifetime disconnect (e.g. a
// frozen serverless container thawing with a stale socket) — but it's a
// cheap no-op once already connected, so this adds no real per-request cost.
// ensureOneTimeInit() covers work that must only ever run once per container.
app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    await ensureOneTimeInit()
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/auth',           authRouter)
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

// ─── One-time init (runs once per cold start, cached across warm invocations) ─
// Unlike connectDB() above, this must NOT re-run on every request — admin
// ensure is a one-shot upsert, and re-calling initSocketServer/
// startSubscriptionExpiryJob would double-attach socket handlers / start a
// second interval. Cached as a promise (not a boolean) so concurrent
// requests during a cold start all await the same attempt; cleared on
// failure so the next request gets a fresh attempt instead of every future
// request permanently failing against one rejected promise.
let oneTimeInitPromise: Promise<void> | null = null
function ensureOneTimeInit(): Promise<void> {
  if (!oneTimeInitPromise) {
    oneTimeInitPromise = (async () => {
      await ensureAdminUser()
      initSocketServer(httpServer, allowedOrigins)
      startSubscriptionExpiryJob()
    })().catch((err) => {
      oneTimeInitPromise = null
      throw err
    })
  }
  return oneTimeInitPromise
}

export default app

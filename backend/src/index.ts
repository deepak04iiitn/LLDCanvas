import 'dotenv/config'
import { createServer } from 'http'
import express from 'express'
import cors, { type CorsOptions } from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'
import { ensureAdminUser } from './config/admin'
import { errorHandler } from './middleware/error'
import { initSocketServer } from './socket'
import authRouter from './routes/auth.route'
import diagramsRouter from './routes/diagrams.route'
import exportRouter from './routes/export.route'
import accountRouter from './routes/account.route'
import interviewRouter from './routes/interview.route'
import statsRouter from './routes/stats.route'
import adminRouter from './routes/admin.route'
import analyticsRouter from './routes/analytics.route'
import shareRouter from './routes/share.route'
import problemsRouter  from './routes/problems.route'
import revisionRouter  from './routes/revision.route'
import collabRouter    from './routes/collab.route'
import codeRouter      from './routes/code.route'
import billingRouter   from './routes/billing.route'
import feedbackRouter      from './routes/feedback.route'
import testimonialRouter   from './routes/testimonial.route'
import publicRouter        from './routes/public.route'
import blogRouter          from './routes/blog.route'
import patternRouter       from './routes/pattern.route'
import artifactRouter      from './routes/artifact.route'
import studioRouter        from './routes/studio.route'
import learnRouter         from './routes/learn.route'
import journeyRouter       from './routes/journey.route'
import skillsRouter        from './routes/skills.route'
import adminStudioRouter   from './routes/admin/studio.route'
import adminLearnRouter    from './routes/admin/learn.route'
import adminJourneyRouter  from './routes/admin/journey.route'
import { startSubscriptionExpiryJob } from './jobs/expire-subscriptions'
import { startSpacedRepetitionJob } from './jobs/spaced-repetition'

const app    = express()
const httpServer = createServer(app)

// Trust the platform proxy (Vercel/Railway) so X-Forwarded-For is honored;
// without this, express-rate-limit throws on every request instead of
// rate-limiting by IP.
app.set('trust proxy', 1)

// ─── Allowed origins ───────────────────────────────────────────────────────────
// Strip trailing slashes so "https://foo.com/" and "https://foo.com" both match
// the Origin header the browser sends (which never has a trailing slash).
const allowedOrigins: string[] = (
  process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? 'http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin "${origin}" not allowed`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}

// ─── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    // Preserve raw body for Dodo Standard Webhooks signature verification
    ;(req as express.Request & { rawBody?: Buffer }).rawBody = buf
  },
}))

// ─── Global rate limit ─────────────────────────────────────────────────────────
// Interview sync (PATCH /interview/:id) and analytics heartbeat poll every
// 30s per open tab by design and have their own generous, per-identity
// limiters (see middleware/rateLimit.ts) — they're skipped here so a handful
// of extra tabs/sessions can't burn through the shared per-IP budget and
// 429 every other route (login, diagram saves, etc.) for the whole window.
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/analytics/heartbeat') || /^\/interview\/[^/]+$/.test(req.path),
}))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/auth',      authRouter)
app.use('/diagrams',  diagramsRouter)
app.use('/diagrams',  exportRouter)
app.use('/account',   accountRouter)
app.use('/interview', interviewRouter)
app.use('/stats',     statsRouter)
app.use('/admin',     adminRouter)
app.use('/analytics', analyticsRouter)
app.use('/share',     shareRouter)
app.use('/problems',        problemsRouter)
app.use('/revision-notes',  revisionRouter)
app.use('/public',          publicRouter)
app.use('/collab',          collabRouter)
app.use('/code',            codeRouter)
app.use('/patterns',        patternRouter)
app.use('/billing',         billingRouter)
app.use('/feedback',        feedbackRouter)
app.use('/testimonials',    testimonialRouter)
app.use('/blog',            blogRouter)
app.use('/artifacts',       artifactRouter)
app.use('/studio',          studioRouter)
app.use('/learn',           learnRouter)
app.use('/plannr',         journeyRouter)
app.use('/skills',         skillsRouter)
app.use('/admin/studio',    adminStudioRouter)
app.use('/admin/learn',     adminLearnRouter)
app.use('/admin/plannr',    adminJourneyRouter)

// ─── Error handler — must be last ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000

async function start() {
  await connectDB()
  await ensureAdminUser()
  // Drop stale unique index on userId that predates multi-Plannr support.
  // Safe to run on every start — silently ignored if already gone.
  try {
    const mongoose = await import('mongoose')
    const col = mongoose.default.connection.collection('journeyprofiles')
    const indexes = await col.indexes()
    const stale = indexes.find(
      (ix: Record<string, unknown>) =>
        ix.unique === true &&
        ix.key &&
        typeof ix.key === 'object' &&
        Object.keys(ix.key as object).join(',') === 'userId',
    )
    if (stale) {
      await col.dropIndex('userId_1')
      console.log('✓ Dropped stale journeyprofiles.userId_1 unique index')
    }
  } catch (e) {
    console.warn('Index migration skipped:', e)
  }
  initSocketServer(httpServer, allowedOrigins)
  startSubscriptionExpiryJob()
  startSpacedRepetitionJob()
  httpServer.listen(PORT, () => {
    console.log(`✓ API + Socket.io listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Startup failed:', err)
  process.exit(1)
})

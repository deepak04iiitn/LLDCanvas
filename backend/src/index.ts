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
import { startSubscriptionExpiryJob } from './jobs/expire-subscriptions'

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
app.use(express.json({ limit: '10mb' }))

// ─── Global rate limit ─────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))

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
app.use('/billing',         billingRouter)
app.use('/feedback',        feedbackRouter)
app.use('/testimonials',    testimonialRouter)

// ─── Error handler — must be last ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000

async function start() {
  await connectDB()
  await ensureAdminUser()
  initSocketServer(httpServer, allowedOrigins)
  startSubscriptionExpiryJob()
  httpServer.listen(PORT, () => {
    console.log(`✓ API + Socket.io listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Startup failed:', err)
  process.exit(1)
})

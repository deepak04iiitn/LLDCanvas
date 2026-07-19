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

// ─── Bootstrap (runs once per cold start) ────────────────────────────────────
let ready = false
async function bootstrap() {
  if (ready) return
  await connectDB()
  await ensureAdminUser()
  initSocketServer(httpServer, allowedOrigins)
  startSubscriptionExpiryJob()
  ready = true
}

bootstrap().catch(console.error)

export default app

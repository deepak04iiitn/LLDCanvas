import 'dotenv/config'
import { createServer } from 'http'
import express from 'express'
import cors, { type CorsOptions } from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'
import { getAuth, ensureAdminUser } from './config/auth'
import { errorHandler } from './middleware/error'
import { authRateLimit } from './middleware/rateLimit'
import { initSocketServer } from './socket'
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
import { startSubscriptionExpiryJob } from './jobs/expire-subscriptions'

const app    = express()
const httpServer = createServer(app)

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

// ─── Auth routes (Better Auth) ────────────────────────────────────────────────
app.use('/api/auth/sign-in', authRateLimit)
app.use('/api/auth/sign-up', authRateLimit)

// `toNodeHandler` converts Better Auth's web-standard handler to a Node handler.
// It calls res.writeHead() internally, which REPLACES all headers set by the
// global cors() middleware above — so CORS headers get dropped for auth routes.
//
// Fix: apply cors() again on this route, intercept OPTIONS preflight ourselves,
// and patch res.writeHead to re-inject the CORS headers after Better Auth writes
// its own header set.
app.all('/api/auth/*', cors(corsOptions), async (req, res, next) => {
  try {
    const requestOrigin = req.headers.origin as string | undefined
    const isAllowed = Boolean(requestOrigin && allowedOrigins.includes(requestOrigin))

    // Answer OPTIONS preflight before Better Auth sees the request
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

    // Patch writeHead so CORS headers survive even if toNodeHandler replaces them
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
    const { toNodeHandler } = await import('better-auth/node')
    return toNodeHandler(auth)(req, res)
  } catch (err) {
    next(err)
  }
})

// ─── API routes ───────────────────────────────────────────────────────────────
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
app.use('/collab',          collabRouter)
app.use('/code',            codeRouter)
app.use('/billing',         billingRouter)

// ─── Error handler — must be last ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000

async function start() {
  await connectDB()
  await getAuth()
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

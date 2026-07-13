import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'
import { getAuth } from './config/auth'
import { errorHandler } from './middleware/error'
import { authRateLimit } from './middleware/rateLimit'
import diagramsRouter from './routes/diagrams.route'
import exportRouter from './routes/export.route'
import accountRouter from './routes/account.route'

const app = express()

// ─── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,   // required for cross-site Better Auth session cookies
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))

// ─── Global rate limit ─────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// ─── Auth routes (Better Auth) ────────────────────────────────────────────────
// Stricter rate limit on sign-in / sign-up to prevent brute-force
app.use('/api/auth/sign-in', authRateLimit)
app.use('/api/auth/sign-up', authRateLimit)

// toNodeHandler bridges Better Auth's web-standard handler to Express
app.all('/api/auth/*', async (req, res, next) => {
  try {
    const auth = await getAuth()
    const { toNodeHandler } = await import('better-auth/node')
    return toNodeHandler(auth)(req, res)
  } catch (err) {
    next(err)
  }
})

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/diagrams', diagramsRouter)
app.use('/diagrams', exportRouter)
app.use('/account',  accountRouter)

// ─── Error handler — must be last ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000

async function start() {
  await connectDB()
  // Pre-warm the auth singleton so first request isn't slow
  await getAuth()
  app.listen(PORT, () => {
    console.log(`✓ API listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Startup failed:', err)
  process.exit(1)
})

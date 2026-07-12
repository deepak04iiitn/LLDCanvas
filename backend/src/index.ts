import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'
import { errorHandler } from './middleware/error'
import diagramsRouter from './routes/diagrams.route'
import exportRouter from './routes/export.route'

const app = express()

// Security & parsing
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))

// Global rate limit — generous for dev; tighten auth endpoints in Phase 1
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))

// Health check — used by Railway/Fly.io uptime probes
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// Routes
// Phase 1: mount Better Auth handler here → app.all('/api/auth/*', (req, res) => auth.handler(req, res))
app.use('/diagrams', diagramsRouter)
app.use('/diagrams', exportRouter)

// Error handler — must be last
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ API listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  })

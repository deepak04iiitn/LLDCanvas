import express, { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller'
import { heartbeatRateLimit } from '../middleware/rateLimit'

const router = Router()

// Public — no auth required (anonymous users are tracked too)
// Beacon sends text/plain (avoids CORS preflight); global express.json skips it.
router.post('/heartbeat', express.text({ type: 'text/plain', limit: '4kb' }), heartbeatRateLimit, analyticsController.heartbeat)

export default router

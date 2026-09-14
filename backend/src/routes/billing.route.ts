import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  detectGeo,
  getMyPlan,
  createSubscription,
  createDodoSubscription,
  verifyPayment,
  cancelSubscription,
  handleWebhook,
  handleDodoWebhook,
  getPricing,
} from '../controllers/billing.controller'

const router = Router()

// Public
router.get('/geo',     detectGeo)
router.get('/pricing', getPricing)

// Webhooks — no auth
router.post('/webhook', handleWebhook)
router.post('/webhook/dodo', handleDodoWebhook)

// Authenticated
router.get('/plan',            requireAuth, getMyPlan)
router.post('/subscribe',      requireAuth, createSubscription)
router.post('/subscribe/dodo', requireAuth, createDodoSubscription)
router.post('/verify',         requireAuth, verifyPayment)
router.post('/cancel',         requireAuth, cancelSubscription)

export default router

import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  detectGeo,
  getMyPlan,
  createSubscription,
  verifyPayment,
  cancelSubscription,
  handleWebhook,
  getPricing,
} from '../controllers/billing.controller'

const router = Router()

// Public
router.get('/geo',     detectGeo)
router.get('/pricing', getPricing)

// Webhook — raw body needed, no auth
router.post('/webhook', handleWebhook)

// Authenticated
router.get('/plan',       requireAuth, getMyPlan)
router.post('/subscribe', requireAuth, createSubscription)
router.post('/verify',    requireAuth, verifyPayment)
router.post('/cancel',    requireAuth, cancelSubscription)

export default router

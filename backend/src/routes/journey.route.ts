import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as journey from '../controllers/journey/journey.controller'

const router = Router()

router.post('/setup',                   requireAuth, journey.setup)
router.get('/profile',                  requireAuth, journey.getProfile)
router.get('/dashboard',                requireAuth, journey.getDashboard)
router.get('/roadmap',                  requireAuth, journey.getRoadmap)
router.get('/topics/:slug',             requireAuth, journey.getTopic)
router.post('/topics/:slug/complete',   requireAuth, journey.completeTopic)
router.get('/recommendation',           requireAuth, journey.getRecommendation)
router.get('/experiences',              requireAuth, journey.listExperiences)
router.get('/experiences/:slug',        requireAuth, journey.getExperience)
router.get('/skills',                   requireAuth, journey.getSkills)
router.get('/plan',                     requireAuth, journey.getPlan)
router.get('/tips',                     requireAuth, journey.getTips)
router.post('/activity',                requireAuth, journey.logActivity)

// Multi-plan endpoints
router.get('/plans',                    requireAuth, journey.listPlans)
router.post('/plans',                   requireAuth, journey.createPlan)
router.patch('/plans/:id/switch',       requireAuth, journey.switchPlan)
router.delete('/plans/:id',             requireAuth, journey.deletePlan)

export default router

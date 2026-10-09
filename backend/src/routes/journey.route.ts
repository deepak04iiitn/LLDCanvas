import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as journey from '../controllers/journey/journey.controller'

const router = Router()

router.post('/setup',                   requireAuth, journey.setup)
router.get('/profile',                  requireAuth, journey.getProfile)
router.patch('/profile',                requireAuth, journey.updateActiveProfile)
router.get('/dashboard',                requireAuth, journey.getDashboard)
router.get('/roadmap',                  requireAuth, journey.getRoadmap)
router.get('/topics/:slug',             requireAuth, journey.getTopic)
router.post('/topics/:slug/complete',   requireAuth, journey.completeTopic)
router.post('/topics/:slug/bookmark',   requireAuth, journey.toggleRevisionBookmark)
router.post('/topics/:slug/progress',   requireAuth, journey.saveTopicProgress)
router.post('/topics/:slug/practice/:itemId/submit', requireAuth, journey.submitPracticeItem)
router.post('/topics/:slug/checks/:checkId/submit', requireAuth, journey.submitKnowledgeCheck)
router.get('/revise',                   requireAuth, journey.getRevisePack)
router.get('/practice',                 requireAuth, journey.listPracticeHub)
router.get('/diagnostic',               requireAuth, journey.getDiagnostic)
router.post('/diagnostic/submit',       requireAuth, journey.submitDiagnostic)
router.get('/recommendation',           requireAuth, journey.getRecommendation)
router.get('/experiences',              requireAuth, journey.listExperiences)
router.get('/experiences/:slug',        requireAuth, journey.getExperience)
router.post('/experiences/:slug/attempt', requireAuth, journey.submitExperienceAttempt)
router.get('/skills/page',              requireAuth, journey.getSkillsPage)
router.get('/skills',                   requireAuth, journey.getSkills)
router.get('/plan',                     requireAuth, journey.getPlan)
router.get('/tips',                     requireAuth, journey.getTips)
router.post('/activity',                requireAuth, journey.logActivity)

// Spaced repetition
router.get('/spaced-repetition',                requireAuth, journey.getSpacedRepetition)
router.patch('/spaced-repetition/:id/dismiss',  requireAuth, journey.dismissSpacedRepetitionItem)

// Daily practice
router.get('/daily-practice',           requireAuth, journey.getDailyPractice)

// Multi-plan endpoints
router.get('/plans',                    requireAuth, journey.listPlans)
router.post('/plans',                   requireAuth, journey.createPlan)
router.patch('/plans/:id/switch',       requireAuth, journey.switchPlan)
router.delete('/plans/:id',             requireAuth, journey.deletePlan)

export default router

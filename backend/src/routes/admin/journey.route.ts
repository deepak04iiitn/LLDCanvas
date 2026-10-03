import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth'
import * as plannr from '../../controllers/admin/journey/plannr.controller'
import { getFeatureActivity } from '../../controllers/admin/analytics/feature-activity.controller'

const router = Router()
router.use(requireAuth, requireAdmin)

// ─── Plannr overview stats ────────────────────────────────────────────────────

router.get('/stats',    plannr.adminGetStats)
router.get('/profiles', plannr.adminListProfiles)

// ─── Topics ───────────────────────────────────────────────────────────────────

router.get   ('/topics',                plannr.adminListTopics)
router.post  ('/topics',                plannr.adminCreateTopic)
router.post  ('/topics/bulk-delete',    plannr.adminBulkDeleteTopics)
router.patch ('/topics/:id',            plannr.adminUpdateTopic)
router.post  ('/topics/:id/publish',    plannr.adminPublishTopic)
router.delete('/topics/:id',            plannr.adminDeleteTopic)

// ─── Experiences ──────────────────────────────────────────────────────────────

router.get   ('/experiences',                plannr.adminListExperiences)
router.post  ('/experiences',                plannr.adminCreateExperience)
router.post  ('/experiences/bulk-delete',    plannr.adminBulkDeleteExperiences)
router.patch ('/experiences/:id',            plannr.adminUpdateExperience)
router.post  ('/experiences/:id/publish',    plannr.adminPublishExperience)
router.delete('/experiences/:id',            plannr.adminDeleteExperience)

// ─── Tips ─────────────────────────────────────────────────────────────────────

router.get   ('/tips',                plannr.adminListTips)
router.post  ('/tips',                plannr.adminCreateTip)
router.post  ('/tips/bulk-delete',    plannr.adminBulkDeleteTips)
router.patch ('/tips/:id',            plannr.adminUpdateTip)
router.post  ('/tips/:id/publish',    plannr.adminPublishTip)
router.delete('/tips/:id',            plannr.adminDeleteTip)

// ─── Per-feature user activity (shared, keyed by feature slug) ────────────────

router.get('/feature-activity/:slug', getFeatureActivity)

export default router

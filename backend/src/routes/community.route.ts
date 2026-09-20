import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as g from '../controllers/community/gallery.controller'

const router = Router()

router.get('/gallery', g.listGallery)
router.get('/d/:slug', g.getDesign)
router.get('/d/:slug/watch', g.watchDesign)
router.get('/d/:slug/forks', g.listForks)
router.get('/alternatives', g.listAlternatives)
router.post('/publish', requireAuth, g.publishDesign)
router.post('/d/:slug/fork', requireAuth, g.forkDesign)
router.post('/reports', requireAuth, g.createReport)

export default router

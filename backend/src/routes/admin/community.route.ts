import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth'
import * as g from '../../controllers/community/gallery.controller'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/gallery', g.adminListGallery)
router.post('/gallery/:id/moderate', g.adminModerate)

export default router

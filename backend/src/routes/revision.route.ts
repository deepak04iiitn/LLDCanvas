import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { revisionController } from '../controllers/revision.controller'

const router = Router()
router.use(requireAuth)

router.get('/',                    revisionController.list)
router.get('/categories',          revisionController.categories)
router.get('/stats/me',            revisionController.myStats)
router.get('/:slug',               revisionController.getOne)
router.post('/:slug/revised',      revisionController.markRevised)
router.post('/:slug/bookmark',     revisionController.toggleBookmark)

export default router

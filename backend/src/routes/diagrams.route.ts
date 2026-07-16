import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { diagramsController } from '../controllers/diagrams.controller'
import { shareController } from '../controllers/share.controller'

const router = Router()

// All routes require authentication
router.use(requireAuth)

router.get('/',                         diagramsController.list)
router.post('/',                        diagramsController.create)
router.post('/:id/duplicate',           diagramsController.duplicate)
router.get('/:id',                      diagramsController.getOne)
router.put('/:id',                      diagramsController.save)
router.patch('/:id/title',              diagramsController.rename)
router.delete('/:id',                   diagramsController.remove)

// ── Sharing ────────────────────────────────────────────────────────────────────
router.get('/:id/share',                shareController.getShare)
router.post('/:id/share',               shareController.upsertShare)
router.delete('/:id/share',             shareController.removeShare)
router.post('/:id/share/invite',        shareController.addInvite)
router.delete('/:id/share/invite',      shareController.removeInvite)

export default router

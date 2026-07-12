import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { diagramsController } from '../controllers/diagrams.controller'

const router = Router()

// Public — no auth needed
router.get('/templates', diagramsController.listTemplates)

// All routes below require authentication
router.use(requireAuth)

router.get('/',        diagramsController.list)
router.post('/',       diagramsController.create)
router.get('/:id',     diagramsController.getOne)
router.put('/:id',     diagramsController.save)
router.patch('/:id/title', diagramsController.rename)
router.delete('/:id',  diagramsController.remove)

export default router

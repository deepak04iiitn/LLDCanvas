import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { patternController } from '../controllers/pattern.controller'

const router = Router()

router.use(requireAuth)

router.get('/:key', patternController.getOne)

export default router

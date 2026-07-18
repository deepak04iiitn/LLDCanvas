import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { runCode, listCompilers } from '../controllers/code.controller'

const router = Router()

router.get('/compilers', listCompilers)
router.post('/run', requireAuth, runCode)

export default router

import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { runCode, listCompilers, getHistory } from '../controllers/code.controller'

const router = Router()

router.get('/compilers', listCompilers)
router.post('/run',     requireAuth, runCode)
router.get('/history',  requireAuth, getHistory)

export default router

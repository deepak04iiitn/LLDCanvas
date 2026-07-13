import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { accountController } from '../controllers/account.controller'

const router = Router()

router.use(requireAuth)

router.patch('/name',  accountController.updateName)
router.delete('/',     accountController.deleteAccount)

export default router

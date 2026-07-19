import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getApprovedTestimonials, submitTestimonial } from '../controllers/testimonial.controller'

const router = Router()

router.get ('/',       getApprovedTestimonials)          // public
router.post('/',       requireAuth, submitTestimonial)   // logged-in users only

export default router

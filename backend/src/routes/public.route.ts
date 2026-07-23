import { Router } from 'express'
import { publicController } from '../controllers/public.controller'

// No requireAuth anywhere in this router — these endpoints power the public
// SEO pages and must work for anonymous crawlers/visitors.
const router = Router()

router.get('/problems',             publicController.listProblems)
router.get('/problems/:slug',       publicController.getProblem)
router.get('/revision-notes',       publicController.listRevisionNotes)
router.get('/revision-notes/:slug', publicController.getRevisionNote)

export default router

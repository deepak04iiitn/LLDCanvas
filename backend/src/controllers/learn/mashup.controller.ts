import { Request, Response, NextFunction } from 'express'
import { MashupRecipe } from '../../models/learn/mashup-recipe.model'
import { createError } from '../../middleware/error'
import { randomBytes } from 'crypto'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

async function findPublished(idOrSlug: string) {
  let recipe = null
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    recipe = await MashupRecipe.findOne({ _id: idOrSlug, status: 'published' })
  }
  if (!recipe) {
    recipe = await MashupRecipe.findOne({ slug: idOrSlug, status: 'published' })
  }
  if (!recipe) throw createError('Recipe not found', 404)
  return recipe
}

export async function listMashup(req: Request, res: Response, next: NextFunction) {
  try {
    const recipes = await MashupRecipe.find({ status: 'published' })
      .select('slug title difficulty summary constraints problemLabels order')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json({ recipes })
  } catch (e) {
    next(e)
  }
}

export async function startMashup(req: Request, res: Response, next: NextFunction) {
  try {
    const recipe = await findPublished(paramId(req.params.id))
    const sessionId = `mash_${randomBytes(8).toString('hex')}`
    res.status(201).json({
      sessionId,
      recipe: {
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        difficulty: recipe.difficulty,
        summary: recipe.summary,
        constraints: recipe.constraints,
        problemLabels: recipe.problemLabels,
      },
    })
  } catch (e) {
    next(e)
  }
}

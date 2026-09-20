import { Request, Response, NextFunction } from 'express'
import { Diagram } from '../../models/diagram.model'
import { ScoreHeuristicConfig } from '../../models/learn/score-heuristic-config.model'
import { createError } from '../../middleware/error'
import { scoreDiagram } from '../../services/graph/scoreEngine'
import type { GraphNode, GraphEdge } from '../../services/graph/analyze'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function runScore(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await Diagram.findById(paramId(req.params.artifactId))
    if (!diagram) throw createError('Diagram not found', 404)
    if (diagram.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)

    const config = await ScoreHeuristicConfig.findOne({ active: true }).lean()
    const nodes = (diagram.diagramData?.nodes ?? []) as GraphNode[]
    const edges = (diagram.diagramData?.edges ?? []) as GraphEdge[]
    const score = scoreDiagram(nodes, edges, config?.weights)
    if (config?.copy?.disclaimer) {
      score.disclaimer = config.copy.disclaimer
    }
    res.json({ score, configVersion: config?.version ?? 'builtin' })
  } catch (e) {
    next(e)
  }
}

export async function getActiveConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const config = await ScoreHeuristicConfig.findOne({ active: true }).lean()
    res.json({ config })
  } catch (e) { next(e) }
}

export async function adminGetConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const configs = await ScoreHeuristicConfig.find().sort({ updatedAt: -1 }).lean()
    res.json({ configs })
  } catch (e) { next(e) }
}

export async function adminUpsertConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const version = String(req.body.version ?? 'v1')
    if (req.body.active) {
      await ScoreHeuristicConfig.updateMany({}, { active: false })
    }
    const config = await ScoreHeuristicConfig.findOneAndUpdate(
      { version },
      {
        version,
        active: Boolean(req.body.active),
        weights: req.body.weights,
        copy: req.body.copy,
      },
      { upsert: true, new: true },
    )
    res.json(config)
  } catch (e) { next(e) }
}

import { Request, Response, NextFunction } from 'express'
import { Diagram } from '../../models/diagram.model'
import { ScoreHeuristicConfig } from '../../models/learn/score-heuristic-config.model'
import { DiagramScoreRecord } from '../../models/learn/diagram-score-record.model'
import { createError } from '../../middleware/error'
import { scoreDiagram } from '../../services/graph/scoreEngine'
import { applySkillDeltas } from '../../utils/skill-updater'
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

    // Extract per-dimension scores from result
    const dimMap: Record<string, number> = {}
    for (const dim of score.dimensions ?? []) {
      dimMap[dim.key] = dim.score
    }

    // Persist score record
    await DiagramScoreRecord.create({
      userId: req.user!.id,
      diagramId: diagram._id.toString(),
      diagramTitle: diagram.title ?? 'Untitled',
      scores: {
        coupling: dimMap['coupling'] ?? 0,
        cohesion: dimMap['cohesion'] ?? 0,
        complexity: dimMap['complexity'] ?? 0,
        extensibility: dimMap['extensibility'] ?? 0,
        solid: dimMap['solid'] ?? 0,
        overall: score.overall ?? 0,
      },
      timestamp: new Date(),
    })

    // Apply skill deltas for high-quality designs
    const skillDeltas: Partial<Record<string, number>> = {}
    if ((dimMap['coupling'] ?? 0) > 60) skillDeltas['coupling'] = 2
    if ((dimMap['cohesion'] ?? 0) > 60) skillDeltas['cohesion'] = 2
    if ((dimMap['extensibility'] ?? 0) > 60) skillDeltas['extensibility'] = 2

    if (Object.keys(skillDeltas).length > 0) {
      await applySkillDeltas(req.user!.id, 'learn_score', skillDeltas)
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

export async function getScoreHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await DiagramScoreRecord
      .find({ userId: req.user!.id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean()
    res.json({ records })
  } catch (e) { next(e) }
}

export async function getScoreTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const records = await DiagramScoreRecord
      .find({ userId: req.user!.id, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean()

    // Group by date (YYYY-MM-DD) and compute per-dimension averages
    const byDate: Record<string, {
      coupling: number[]
      cohesion: number[]
      complexity: number[]
      extensibility: number[]
      solid: number[]
      overall: number[]
    }> = {}

    for (const r of records) {
      const dateKey = r.timestamp.toISOString().slice(0, 10)
      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          coupling: [],
          cohesion: [],
          complexity: [],
          extensibility: [],
          solid: [],
          overall: [],
        }
      }
      byDate[dateKey].coupling.push(r.scores.coupling)
      byDate[dateKey].cohesion.push(r.scores.cohesion)
      byDate[dateKey].complexity.push(r.scores.complexity)
      byDate[dateKey].extensibility.push(r.scores.extensibility)
      byDate[dateKey].solid.push(r.scores.solid)
      byDate[dateKey].overall.push(r.scores.overall)
    }

    const avg = (arr: number[]) =>
      arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)

    const trends = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dims]) => ({
        date,
        coupling: avg(dims.coupling),
        cohesion: avg(dims.cohesion),
        complexity: avg(dims.complexity),
        extensibility: avg(dims.extensibility),
        solid: avg(dims.solid),
        overall: avg(dims.overall),
      }))

    res.json({ trends })
  } catch (e) { next(e) }
}

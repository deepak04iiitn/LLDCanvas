import { Request, Response, NextFunction } from 'express'
import { ReplayEvent } from '../../models/artifact/replay-event.model'
import { analyzeDiagram } from '../../services/graph/analyze'
import { scoreDiagram } from '../../services/graph/scoreEngine'
import { calcBudget } from '../../services/graph/budgetCalc'
import {
  createVersion,
  ensureElementIds,
  getDiagramForUser,
  listVersions,
} from '../../services/artifact/artifact.service'
import { createError } from '../../middleware/error'

function paramId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id
}

function asGraph(diagramData: { nodes?: unknown[]; edges?: unknown[] }) {
  return {
    nodes: (diagramData.nodes ?? []) as Parameters<typeof analyzeDiagram>[0],
    edges: (diagramData.edges ?? []) as Parameters<typeof analyzeDiagram>[1],
  }
}

export async function getArtifact(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    res.json(diagram)
  } catch (e) { next(e) }
}

export async function patchArtifact(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    if (req.body.title != null) diagram.title = String(req.body.title)
    if (req.body.diagramData) {
      diagram.diagramData = ensureElementIds(req.body.diagramData) as typeof diagram.diagramData
    }
    if (typeof req.body.replayEnabled === 'boolean') {
      diagram.replayEnabled = req.body.replayEnabled
    }
    if (req.body.publishedSlug != null) {
      diagram.publishedSlug = String(req.body.publishedSlug)
    }
    await diagram.save()
    res.json(diagram)
  } catch (e) { next(e) }
}

export async function postVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const version = await createVersion(
      paramId(req.params.id),
      req.user!.id,
      req.body.label != null ? String(req.body.label) : undefined,
    )
    res.status(201).json(version)
  } catch (e) { next(e) }
}

export async function getVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const versions = await listVersions(paramId(req.params.id), req.user!.id)
    res.json({ versions })
  } catch (e) { next(e) }
}

export async function postReplayEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    const events = Array.isArray(req.body.events) ? req.body.events : []
    if (events.length === 0) {
      res.json({ inserted: 0 })
      return
    }
    const docs = events.slice(0, 500).map((ev: { t?: number; type?: string; payload?: Record<string, unknown> }) => ({
      artifactId,
      diagramId: artifactId,
      userId: req.user!.id,
      t: Number(ev.t ?? 0),
      type: String(ev.type ?? 'unknown'),
      payload: ev.payload ?? {},
    }))
    await ReplayEvent.insertMany(docs)
    res.json({ inserted: docs.length })
  } catch (e) { next(e) }
}





export async function getReplay(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    const recorded = await ReplayEvent.find({
      $or: [{ artifactId }, { diagramId: artifactId }],
    })
      .sort({ t: 1 })
      .lean()

    res.json({ events: recorded })
  } catch (e) { next(e) }
}

export async function analyzeNode(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    const analysis = analyzeDiagram(g.nodes, g.edges)
    const node = analysis.nodes[paramId(req.params.elementId)]
    if (!node) throw createError('Node not found', 404)
    res.json(node)
  } catch (e) { next(e) }
}

export async function getDependencyGraph(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    res.json(analyzeDiagram(g.nodes, g.edges))
  } catch (e) { next(e) }
}

export async function postScore(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    res.json(scoreDiagram(g.nodes, g.edges))
  } catch (e) { next(e) }
}


export async function postBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    res.json(calcBudget(g.nodes, g.edges, req.body.costTable))
  } catch (e) { next(e) }
}

import { Request, Response, NextFunction } from 'express'
import { DesignDecision } from '../../models/artifact/design-decision.model'
import { ReplayEvent } from '../../models/artifact/replay-event.model'
import { ArtifactVersion } from '../../models/artifact/artifact-version.model'
import { analyzeDiagram } from '../../services/graph/analyze'
import { structuralDiff } from '../../services/graph/structuralDiff'
import { scoreDiagram } from '../../services/graph/scoreEngine'
import { buildStory } from '../../services/graph/storyWalk'
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

export async function getDiff(req: Request, res: Response, next: NextFunction) {
  try {
    const diagramId = paramId(req.params.id)
    await getDiagramForUser(diagramId, req.user!.id)
    const fromId = String(req.query.from ?? '')
    const toId = String(req.query.to ?? '')
    const [from, to] = await Promise.all([
      ArtifactVersion.findOne({ _id: fromId, diagramId }),
      ArtifactVersion.findOne({ _id: toId, diagramId }),
    ])
    if (!from || !to) throw createError('Version not found', 404)
    const entries = structuralDiff(
      from.diagramData as { nodes?: unknown[]; edges?: unknown[] },
      to.diagramData as { nodes?: unknown[]; edges?: unknown[] },
    )
    res.json({ entries })
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

export async function listDecisions(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    const decisions = await DesignDecision.find({ artifactId }).sort({ createdAt: -1 }).lean()
    res.json({ decisions })
  } catch (e) { next(e) }
}

export async function createDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    const doc = await DesignDecision.create({
      artifactId,
      userId: req.user!.id,
      elementId: String(req.body.elementId ?? ''),
      decision: String(req.body.decision ?? ''),
      why: String(req.body.why ?? ''),
      alternatives: String(req.body.alternatives ?? ''),
      tradeoffs: String(req.body.tradeoffs ?? ''),
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
}

export async function updateDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    const doc = await DesignDecision.findOneAndUpdate(
      { _id: paramId(req.params.decisionId), artifactId },
      {
        decision: req.body.decision,
        why: req.body.why,
        alternatives: req.body.alternatives,
        tradeoffs: req.body.tradeoffs,
        elementId: req.body.elementId,
      },
      { new: true },
    )
    if (!doc) throw createError('Decision not found', 404)
    res.json(doc)
  } catch (e) { next(e) }
}

export async function deleteDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const artifactId = paramId(req.params.id)
    await getDiagramForUser(artifactId, req.user!.id)
    await DesignDecision.deleteOne({ _id: paramId(req.params.decisionId), artifactId })
    res.json({ ok: true })
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

export async function postStory(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    res.json(buildStory(g.nodes, g.edges))
  } catch (e) { next(e) }
}

export async function postBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const diagram = await getDiagramForUser(paramId(req.params.id), req.user!.id)
    const g = asGraph(diagram.diagramData)
    res.json(calcBudget(g.nodes, g.edges, req.body.costTable))
  } catch (e) { next(e) }
}

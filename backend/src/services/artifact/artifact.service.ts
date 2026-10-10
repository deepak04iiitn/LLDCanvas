import { randomUUID } from 'crypto'
import { Diagram } from '../../models/diagram.model'
import { ArtifactVersion } from '../../models/artifact/artifact-version.model'
import { createError } from '../../middleware/error'

type RFNode = { id: string; data?: Record<string, unknown>; [k: string]: unknown }
type RFEdge = { id: string; data?: Record<string, unknown>; [k: string]: unknown }

export function ensureElementIds(diagramData: {
  nodes?: unknown[]
  edges?: unknown[]
  [k: string]: unknown
}) {
  const nodes = ((diagramData.nodes ?? []) as RFNode[]).map(n => {
    const data = { ...(n.data ?? {}) }
    if (!data.elementId) data.elementId = randomUUID()
    return { ...n, data }
  })
  const edges = ((diagramData.edges ?? []) as RFEdge[]).map(e => {
    const data = { ...(e.data ?? {}) }
    if (!data.elementId) data.elementId = randomUUID()
    return { ...e, data }
  })
  return { ...diagramData, nodes, edges }
}

export async function getDiagramForUser(diagramId: string, userId: string) {
  const diagram = await Diagram.findById(diagramId)
  if (!diagram) throw createError('Diagram not found', 404)
  if (diagram.userId.toString() !== userId) throw createError('Forbidden', 403)
  return diagram
}

/** @deprecated use getDiagramForUser */
export const getOwnedDiagram = getDiagramForUser

export async function createVersion(
  diagramId: string,
  userId: string,
  label?: string,
) {
  const diagram = await getDiagramForUser(diagramId, userId)
  const data = ensureElementIds(diagram.diagramData as unknown as Record<string, unknown>)
  diagram.diagramData = data as unknown as typeof diagram.diagramData
  await diagram.save()

  const nodes = (data.nodes ?? []) as unknown[]
  const edges = (data.edges ?? []) as unknown[]
  return ArtifactVersion.create({
    diagramId,
    userId,
    label: label || undefined,
    diagramData: data,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  })
}

export async function listVersions(diagramId: string, userId: string) {
  await getDiagramForUser(diagramId, userId)
  return ArtifactVersion.find({ diagramId }).sort({ createdAt: -1 }).lean()
}

/** @deprecated use createVersion / listVersions */
export const createSnapshot = createVersion
export const listSnapshots = listVersions

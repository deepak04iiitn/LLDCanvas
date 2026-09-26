/**
 * Dependency Web — interactive dependency reasoning model + layout.
 */

import { analyzeDiagram, type DiagramLike, type AnalyzeNode } from './analyzeDiagram'
import type { ArchitectureLayer } from './microscope'

export type DepWebLens =
  | 'overview'
  | 'dependencies'
  | 'dependents'
  | 'blast'
  | 'cycles'
  | 'layers'
  | 'external'
  | 'paths'
  | 'hotspots'

export interface DepWebOverlay {
  layers?: Record<string, ArchitectureLayer>
  externalIds?: string[]
  flows?: { id: string; label: string; steps: { elementId: string }[] }[]
}

export interface DepWebFilters {
  relationshipTypes?: string[]
  nodeTypes?: string[]
  layers?: ArchitectureLayer[]
  direction?: 'outgoing' | 'incoming' | 'both'
  externalOnly?: boolean
}

export interface DepWebNode {
  id: string
  label: string
  nodeType: string
  inDegree: number
  outDegree: number
  layer: ArchitectureLayer | null
  isExternal: boolean
  isHub: boolean
  inCycle: boolean
  hotspotScore: number
  x: number
  y: number
}

export interface DepWebLink {
  id: string
  source: string
  target: string
  relationshipType: string
}

export interface DepWebModel {
  nodes: DepWebNode[]
  links: DepWebLink[]
  cycles: string[][]
  byId: Map<string, DepWebNode>
  outAdj: Map<string, string[]>
  inAdj: Map<string, string[]>
}

function eid(n: AnalyzeNode): string {
  return n.elementId ?? n.id
}

function nameOf(n: AnalyzeNode | undefined, fallback = '?'): string {
  return n?.data?.name ?? n?.id ?? fallback
}

function inferLayer(node: AnalyzeNode): ArchitectureLayer | null {
  const stereo = String(node.data?.stereotype ?? '').toLowerCase()
  const name = String(node.data?.name ?? '').toLowerCase()
  if (stereo.includes('controller') || /controller$/.test(name) || stereo === 'presentation')
    return 'presentation'
  if (stereo.includes('application') || /usecase|appservice/i.test(name)) return 'application'
  if (stereo.includes('domain') || /entity|aggregate/i.test(stereo)) return 'domain'
  if (
    stereo.includes('infra') ||
    /repo|gateway|adapter|stripe|razor|email|db|redis|mongo|kafka|firebase/i.test(name)
  )
    return 'infrastructure'
  return null
}

function isExternalNode(node: AnalyzeNode, overlay?: DepWebOverlay): boolean {
  const id = eid(node)
  if (overlay?.externalIds?.includes(id)) return true
  const stereo = String(node.data?.stereotype ?? '').toLowerCase()
  const name = String(node.data?.name ?? '').toLowerCase()
  return (
    stereo.includes('external') ||
    /stripe|redis|mongo|kafka|firebase|sdk|paypal|s3|aws/i.test(name)
  )
}

function bfsReachable(
  start: string,
  adj: Map<string, string[]>,
  maxDepth = 32,
): { ids: string[]; depth: Map<string, number> } {
  const depth = new Map<string, number>()
  const q = [start]
  depth.set(start, 0)
  while (q.length) {
    const u = q.shift()!
    const d = depth.get(u) ?? 0
    if (d >= maxDepth) continue
    for (const v of adj.get(u) ?? []) {
      if (depth.has(v)) continue
      depth.set(v, d + 1)
      q.push(v)
    }
  }
  depth.delete(start)
  return { ids: [...depth.keys()], depth }
}

/** Simple layered layout: rank by BFS from roots, then column by index. */
function layoutNodes(
  ids: string[],
  outAdj: Map<string, string[]>,
  inAdj: Map<string, string[]>,
): Map<string, { x: number; y: number }> {
  const ranks = new Map<string, number>()
  const roots = ids.filter(id => (inAdj.get(id) ?? []).length === 0)
  const starts = roots.length ? roots : ids.slice(0, 1)
  for (const id of ids) ranks.set(id, 0)
  const q = [...starts]
  const seen = new Set(starts)
  for (const s of starts) ranks.set(s, 0)
  while (q.length) {
    const u = q.shift()!
    const r = ranks.get(u) ?? 0
    for (const v of outAdj.get(u) ?? []) {
      const next = r + 1
      if (!seen.has(v) || next > (ranks.get(v) ?? 0)) {
        ranks.set(v, next)
        if (!seen.has(v)) {
          seen.add(v)
          q.push(v)
        }
      }
    }
  }
  for (const id of ids) {
    if (!seen.has(id)) ranks.set(id, 0)
  }

  const byRank = new Map<number, string[]>()
  for (const id of ids) {
    const r = ranks.get(id) ?? 0
    const list = byRank.get(r) ?? []
    list.push(id)
    byRank.set(r, list)
  }

  const pos = new Map<string, { x: number; y: number }>()
  const COL = 220
  const ROW = 140
  for (const [rank, list] of [...byRank.entries()].sort((a, b) => a[0] - b[0])) {
    list.forEach((id, i) => {
      pos.set(id, { x: rank * COL + 40, y: i * ROW + 40 })
    })
  }
  return pos
}

export function buildDepWebModel(
  diagram: DiagramLike,
  overlay?: DepWebOverlay,
  filters?: DepWebFilters,
): DepWebModel {
  const analysis = analyzeDiagram(diagram)
  const byRf = new Map((diagram.nodes ?? []).map(n => [n.id, n]))
  const cycleSet = new Set(analysis.cycles.flat())

  let links: DepWebLink[] = (diagram.edges ?? [])
    .map(e => {
      const s = byRf.get(e.source)
      const t = byRf.get(e.target)
      if (!s || !t) return null
      return {
        id: e.elementId ?? e.id,
        source: eid(s),
        target: eid(t),
        relationshipType: e.data?.relationshipType ?? 'association',
      }
    })
    .filter(Boolean) as DepWebLink[]

  if (filters?.relationshipTypes?.length) {
    const allow = new Set(filters.relationshipTypes)
    links = links.filter(l => allow.has(l.relationshipType))
  }

  const outAdj = new Map<string, string[]>()
  const inAdj = new Map<string, string[]>()
  for (const n of Object.values(analysis.byElementId)) {
    if (n.nodeType === 'note') continue
    outAdj.set(n.elementId, [])
    inAdj.set(n.elementId, [])
  }
  for (const l of links) {
    if (!outAdj.has(l.source) || !inAdj.has(l.target)) continue
    outAdj.get(l.source)!.push(l.target)
    inAdj.get(l.target)!.push(l.source)
  }

  let nodeIds = Object.values(analysis.byElementId)
    .filter(n => n.nodeType !== 'note')
    .map(n => n.elementId)

  if (filters?.nodeTypes?.length) {
    const allow = new Set(filters.nodeTypes)
    nodeIds = nodeIds.filter(id => allow.has(analysis.byElementId[id]?.nodeType ?? ''))
  }

  const rawNodes = nodeIds.map(id => {
    const n = analysis.byElementId[id]
    const raw = (diagram.nodes ?? []).find(x => eid(x) === id)
    const layer = overlay?.layers?.[id] ?? (raw ? inferLayer(raw) : null)
    const external = raw ? isExternalNode(raw, overlay) : false
    return { id, n, raw, layer, external }
  })

  if (filters?.layers?.length) {
    const allow = new Set(filters.layers)
    nodeIds = rawNodes.filter(r => r.layer && allow.has(r.layer)).map(r => r.id)
  }
  if (filters?.externalOnly) {
    nodeIds = rawNodes.filter(r => r.external).map(r => r.id)
  }

  const idSet = new Set(nodeIds)
  links = links.filter(l => idSet.has(l.source) && idSet.has(l.target))

  // rebuild adj for filtered
  const out2 = new Map<string, string[]>()
  const in2 = new Map<string, string[]>()
  for (const id of nodeIds) {
    out2.set(id, [])
    in2.set(id, [])
  }
  for (const l of links) {
    out2.get(l.source)?.push(l.target)
    in2.get(l.target)?.push(l.source)
  }

  const hubCandidates = [...nodeIds].sort(
    (a, b) =>
      (in2.get(b)?.length ?? 0) +
      (out2.get(b)?.length ?? 0) -
      ((in2.get(a)?.length ?? 0) + (out2.get(a)?.length ?? 0)),
  )
  const hubSet = new Set(hubCandidates.slice(0, Math.min(5, hubCandidates.length)))

  const positions = layoutNodes(nodeIds, out2, in2)

  const nodes: DepWebNode[] = nodeIds.map(id => {
    const n = analysis.byElementId[id]
    const raw = (diagram.nodes ?? []).find(x => eid(x) === id)
    const layer = overlay?.layers?.[id] ?? (raw ? inferLayer(raw) : null)
    const external = raw ? isExternalNode(raw, overlay) : false
    const inD = in2.get(id)?.length ?? 0
    const outD = out2.get(id)?.length ?? 0
    const transitive = bfsReachable(id, out2).ids.length
    const hotspotScore =
      inD * 2 + outD * 2 + transitive + (cycleSet.has(id) ? 5 : 0) + (hubSet.has(id) ? 3 : 0)
    const p = positions.get(id) ?? { x: 0, y: 0 }
    return {
      id,
      label: n?.name ?? id,
      nodeType: n?.nodeType ?? 'class',
      inDegree: inD,
      outDegree: outD,
      layer,
      isExternal: external,
      isHub: hubSet.has(id),
      inCycle: cycleSet.has(id),
      hotspotScore,
      x: p.x,
      y: p.y,
    }
  })

  const byId = new Map(nodes.map(n => [n.id, n]))
  const cycles = analysis.cycles
    .map(c => c.filter(id => idSet.has(id)))
    .filter(c => c.length >= 2)

  return { nodes, links, cycles, byId, outAdj: out2, inAdj: in2 }
}

export function getNodeStats(model: DepWebModel, focusId: string, overlay?: DepWebOverlay) {
  const node = model.byId.get(focusId)
  if (!node) return null
  const out = bfsReachable(focusId, model.outAdj)
  const inn = bfsReachable(focusId, model.inAdj)
  const directOut = model.outAdj.get(focusId) ?? []
  const directIn = model.inAdj.get(focusId) ?? []
  const maxDepth = Math.max(0, ...[...out.depth.values()])
  const involvedCycles = model.cycles.filter(c => c.includes(focusId))
  const flows = (overlay?.flows ?? []).filter(f =>
    f.steps.some(s => s.elementId === focusId || out.ids.includes(s.elementId) || inn.ids.includes(s.elementId)),
  )
  return {
    node,
    incoming: directIn.length,
    outgoing: directOut.length,
    indirectOut: out.ids.filter(id => !directOut.includes(id)).length,
    indirectIn: inn.ids.filter(id => !directIn.includes(id)).length,
    dependencyDepth: maxDepth,
    cycles: involvedCycles.length,
    affectedFlows: flows.length,
    flowLabels: flows.map(f => f.label),
    directDeps: directOut.map(id => ({ id, label: model.byId.get(id)?.label ?? id })),
    directDependents: directIn.map(id => ({ id, label: model.byId.get(id)?.label ?? id })),
    transitiveDeps: out.ids.map(id => ({
      id,
      label: model.byId.get(id)?.label ?? id,
      depth: out.depth.get(id) ?? 0,
    })),
    transitiveDependents: inn.ids.map(id => ({
      id,
      label: model.byId.get(id)?.label ?? id,
      depth: inn.depth.get(id) ?? 0,
    })),
  }
}

export function getBlastRadius(model: DepWebModel, focusId: string, overlay?: DepWebOverlay) {
  const { ids, depth } = bfsReachable(focusId, model.inAdj)
  const direct = model.inAdj.get(focusId) ?? []
  const all = new Set([focusId, ...direct, ...ids])
  const flows = (overlay?.flows ?? []).filter(f =>
    f.steps.some(s => all.has(s.elementId)),
  )
  return {
    direct: direct.map(id => ({ id, label: model.byId.get(id)?.label ?? id })),
    indirect: ids
      .filter(id => !direct.includes(id))
      .map(id => ({ id, label: model.byId.get(id)?.label ?? id, depth: depth.get(id) ?? 0 })),
    affectedComponents: all.size,
    affectedFlows: flows.length,
    flowLabels: flows.map(f => f.label),
    highlightIds: [...all],
  }
}

export function simulateRemoval(model: DepWebModel, focusId: string, overlay?: DepWebOverlay) {
  return {
    ...getBlastRadius(model, focusId, overlay),
    mode: 'removal' as const,
    narrative: `If ${model.byId.get(focusId)?.label ?? focusId} disappeared, dependents above would need alternatives.`,
  }
}

export function simulateChange(model: DepWebModel, focusId: string, overlay?: DepWebOverlay) {
  const blast = getBlastRadius(model, focusId, overlay)
  return {
    ...blast,
    mode: 'change' as const,
    narrative: `These components may require modification if ${model.byId.get(focusId)?.label ?? focusId} changes.`,
  }
}

export function getHubs(model: DepWebModel) {
  const byIn = [...model.nodes].sort((a, b) => b.inDegree - a.inDegree).slice(0, 8)
  const byOut = [...model.nodes].sort((a, b) => b.outDegree - a.outDegree).slice(0, 8)
  return { highInDegree: byIn, highOutDegree: byOut }
}

export function shortestPath(model: DepWebModel, fromId: string, toId: string): string[] | null {
  if (fromId === toId) return [fromId]
  const parent = new Map<string, string>()
  const q = [fromId]
  const seen = new Set([fromId])
  while (q.length) {
    const u = q.shift()!
    for (const v of model.outAdj.get(u) ?? []) {
      if (seen.has(v)) continue
      seen.add(v)
      parent.set(v, u)
      if (v === toId) {
        const path: string[] = []
        let cur: string | undefined = toId
        while (cur && cur !== fromId) {
          path.unshift(cur)
          cur = parent.get(cur)
        }
        path.unshift(fromId)
        return path
      }
      q.push(v)
    }
  }
  return null
}

export function allSimplePaths(
  model: DepWebModel,
  fromId: string,
  toId: string,
  maxPaths = 12,
  maxLen = 8,
): string[][] {
  const results: string[][] = []
  const path = [fromId]
  const visited = new Set([fromId])

  function dfs(u: string) {
    if (results.length >= maxPaths) return
    if (path.length > maxLen) return
    if (u === toId && path.length > 1) {
      results.push([...path])
      return
    }
    for (const v of model.outAdj.get(u) ?? []) {
      if (visited.has(v)) continue
      visited.add(v)
      path.push(v)
      dfs(v)
      path.pop()
      visited.delete(v)
    }
  }
  dfs(fromId)
  return results
}

export function analyzePath(model: DepWebModel, path: string[]) {
  const layers = path
    .map(id => model.byId.get(id)?.layer)
    .filter(Boolean) as ArchitectureLayer[]
  const uniqueLayers = [...new Set(layers)]
  let concrete = 0
  let external = 0
  for (const id of path) {
    const n = model.byId.get(id)
    if (!n) continue
    if (n.isExternal) external++
    if (n.nodeType === 'class') concrete++
  }
  return {
    path,
    labels: path.map(id => model.byId.get(id)?.label ?? id),
    length: Math.max(0, path.length - 1),
    layersCrossed: uniqueLayers,
    abstractionBoundaries: uniqueLayers.length > 1 ? uniqueLayers.length - 1 : 0,
    concreteDependencies: concrete,
    externalDependencies: external,
  }
}

const LAYER_ORDER: ArchitectureLayer[] = [
  'presentation',
  'application',
  'domain',
  'infrastructure',
]

export function getLayerView(model: DepWebModel) {
  const byLayer: Record<ArchitectureLayer, DepWebNode[]> = {
    presentation: [],
    application: [],
    domain: [],
    infrastructure: [],
  }
  for (const n of model.nodes) {
    if (n.layer) byLayer[n.layer].push(n)
  }
  const aggregate: { from: ArchitectureLayer; to: ArchitectureLayer; count: number }[] = []
  const pairCounts = new Map<string, number>()
  for (const l of model.links) {
    const a = model.byId.get(l.source)?.layer
    const b = model.byId.get(l.target)?.layer
    if (!a || !b || a === b) continue
    const key = `${a}->${b}`
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
  }
  for (const [key, count] of pairCounts) {
    const [from, to] = key.split('->') as ArchitectureLayer[]
    aggregate.push({ from, to, count })
  }
  const violations: { from: string; to: string; fromLayer: ArchitectureLayer; toLayer: ArchitectureLayer }[] = []
  for (const l of model.links) {
    const s = model.byId.get(l.source)
    const t = model.byId.get(l.target)
    if (!s?.layer || !t?.layer) continue
    if (s.layer === 'domain' && t.layer === 'infrastructure' && t.isExternal) {
      violations.push({
        from: s.label,
        to: t.label,
        fromLayer: s.layer,
        toLayer: t.layer,
      })
    }
    if (s.layer === 'presentation' && t.layer === 'infrastructure') {
      violations.push({
        from: s.label,
        to: t.label,
        fromLayer: s.layer,
        toLayer: t.layer,
      })
    }
    if (
      LAYER_ORDER.indexOf(s.layer) > LAYER_ORDER.indexOf(t.layer) &&
      s.layer === 'infrastructure' &&
      t.layer === 'presentation'
    ) {
      violations.push({
        from: s.label,
        to: t.label,
        fromLayer: s.layer,
        toLayer: t.layer,
      })
    }
  }
  return { byLayer, aggregate, violations }
}

export function getExternalView(model: DepWebModel) {
  const externals = model.nodes.filter(n => n.isExternal)
  return externals.map(ext => ({
    ...ext,
    dependents: (model.inAdj.get(ext.id) ?? []).map(id => ({
      id,
      label: model.byId.get(id)?.label ?? id,
    })),
  }))
}

export function toMatrix(model: DepWebModel) {
  const ids = model.nodes.map(n => n.id)
  const labels = model.nodes.map(n => n.label)
  const index = new Map(ids.map((id, i) => [id, i]))
  const matrix: boolean[][] = ids.map(() => ids.map(() => false))
  for (const l of model.links) {
    const i = index.get(l.source)
    const j = index.get(l.target)
    if (i != null && j != null) matrix[i][j] = true
  }
  return { ids, labels, matrix }
}

export function compareDependencyCounts(
  before: DepWebModel,
  after: DepWebModel,
  focusId?: string,
) {
  const totalBefore = before.links.length
  const totalAfter = after.links.length
  const focus = focusId
    ? {
        id: focusId,
        beforeOut: before.outAdj.get(focusId)?.length ?? 0,
        afterOut: after.outAdj.get(focusId)?.length ?? 0,
        beforeIn: before.inAdj.get(focusId)?.length ?? 0,
        afterIn: after.inAdj.get(focusId)?.length ?? 0,
        label: after.byId.get(focusId)?.label ?? before.byId.get(focusId)?.label ?? focusId,
      }
    : null
  return { totalBefore, totalAfter, focus }
}

export function computeHighlight(
  model: DepWebModel,
  focusId: string | null,
  lens: DepWebLens,
  opts?: { path?: string[]; cycleIndex?: number },
): { highlightIds: string[]; dimIds: string[] } {
  const all = model.nodes.map(n => n.id)
  if (!focusId && lens !== 'cycles' && lens !== 'hotspots' && lens !== 'layers' && lens !== 'external') {
    return { highlightIds: [], dimIds: [] }
  }
  const hi = new Set<string>()
  if (lens === 'hotspots') {
    const top = [...model.nodes].sort((a, b) => b.hotspotScore - a.hotspotScore).slice(0, 8)
    top.forEach(n => hi.add(n.id))
  } else if (lens === 'cycles') {
    const cycles = focusId ? model.cycles.filter(c => c.includes(focusId)) : model.cycles
    const idx = opts?.cycleIndex ?? 0
    ;(cycles[idx] ?? cycles[0] ?? []).forEach(id => hi.add(id))
  } else if (lens === 'layers' && focusId) {
    const layer = model.byId.get(focusId)?.layer
    if (layer) model.nodes.filter(n => n.layer === layer).forEach(n => hi.add(n.id))
  } else if (lens === 'external') {
    model.nodes.filter(n => n.isExternal).forEach(n => hi.add(n.id))
    for (const n of model.nodes.filter(n => n.isExternal)) {
      ;(model.inAdj.get(n.id) ?? []).forEach(id => hi.add(id))
    }
  } else if (lens === 'paths' && opts?.path) {
    opts.path.forEach(id => hi.add(id))
  } else if (focusId) {
    hi.add(focusId)
    if (lens === 'dependencies' || lens === 'overview') {
      ;(model.outAdj.get(focusId) ?? []).forEach(id => hi.add(id))
      bfsReachable(focusId, model.outAdj).ids.slice(0, 20).forEach(id => hi.add(id))
    }
    if (lens === 'dependents') {
      ;(model.inAdj.get(focusId) ?? []).forEach(id => hi.add(id))
      bfsReachable(focusId, model.inAdj).ids.slice(0, 20).forEach(id => hi.add(id))
    }
    if (lens === 'blast') {
      getBlastRadius(model, focusId).highlightIds.forEach(id => hi.add(id))
    }
  }
  return {
    highlightIds: [...hi],
    dimIds: all.filter(id => !hi.has(id)),
  }
}

export function findNodeByLabel(model: DepWebModel, q: string): DepWebNode | undefined {
  const needle = q.trim().toLowerCase()
  if (!needle) return undefined
  return (
    model.nodes.find(n => n.label.toLowerCase() === needle) ??
    model.nodes.find(n => n.label.toLowerCase().includes(needle))
  )
}

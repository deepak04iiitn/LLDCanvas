/**
 * Architecture Microscope — lens queries over diagram analysis + optional authored overlay.
 */

import {
  analyzeDiagram,
  type DiagramLike,
  type AnalyzeNode,
  type AnalyzeEdge,
  type DiagramAnalysis,
  type NodeAnalysis,
} from './analyzeDiagram'

export type MicroscopeLens =
  | 'overview'
  | 'dependencies'
  | 'blast'
  | 'responsibilities'
  | 'flows'
  | 'abstractions'
  | 'cycles'
  | 'layers'
  | 'encapsulation'
  | 'creation'
  | 'consumers'
  | 'xray'

export type MicroscopeZoomLevel =
  | 'system'
  | 'component'
  | 'relationship'
  | 'flow'
  | 'responsibility'

export type ArchitectureLayer =
  | 'presentation'
  | 'application'
  | 'domain'
  | 'infrastructure'

export interface AuthoredFlowStep {
  elementId: string
  note?: string
}

export interface AuthoredFlow {
  id: string
  label: string
  entryMethod?: string
  steps: AuthoredFlowStep[]
}

export interface MicroscopeOverlay {
  flows?: AuthoredFlow[]
  creationEdges?: { from: string; to: string }[]
  layers?: Record<string, ArchitectureLayer>
  /** Optional method-level notes: elementId.methodName → note */
  responsibilityNotes?: Record<string, string>
}

export interface MicroscopeContext {
  diagram: DiagramLike
  analysis: DiagramAnalysis
  overlay?: MicroscopeOverlay
}

function eid(n: AnalyzeNode): string {
  return n.elementId ?? n.id
}

function nameOf(n: AnalyzeNode | undefined, fallback = '?'): string {
  return n?.data?.name ?? n?.id ?? fallback
}

function nodeByElementId(diagram: DiagramLike): Map<string, AnalyzeNode> {
  const m = new Map<string, AnalyzeNode>()
  for (const n of diagram.nodes ?? []) m.set(eid(n), n)
  return m
}

function buildAdj(diagram: DiagramLike): {
  out: Map<string, string[]>
  inn: Map<string, string[]>
  byEid: Map<string, AnalyzeNode>
} {
  const byEid = nodeByElementId(diagram)
  const byRfId = new Map((diagram.nodes ?? []).map(n => [n.id, n]))
  const out = new Map<string, string[]>()
  const inn = new Map<string, string[]>()
  for (const id of byEid.keys()) {
    out.set(id, [])
    inn.set(id, [])
  }
  for (const e of diagram.edges ?? []) {
    const s = byRfId.get(e.source)
    const t = byRfId.get(e.target)
    if (!s || !t) continue
    const se = eid(s)
    const te = eid(t)
    out.get(se)?.push(te)
    inn.get(te)?.push(se)
  }
  return { out, inn, byEid }
}

function bfsReachable(
  start: string,
  adj: Map<string, string[]>,
  maxDepth = 32,
): { ids: string[]; depth: Map<string, number> } {
  const depth = new Map<string, number>()
  const q: string[] = [start]
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

const DOMAIN_RULES: { domain: string; re: RegExp }[] = [
  { domain: 'ordering', re: /order|checkout|cart|place|cancel/i },
  { domain: 'payment', re: /pay|charge|refund|stripe|razor|billing/i },
  { domain: 'inventory', re: /invent|stock|reserv|sku|warehouse/i },
  { domain: 'notification', re: /notif|email|sms|push|alert/i },
  { domain: 'persistence', re: /save|persist|repo|store|load|find|query/i },
  { domain: 'pricing', re: /price|total|discount|tax|money|calc/i },
  { domain: 'auth', re: /auth|login|token|session|permission/i },
  { domain: 'validation', re: /valid|check|assert|ensure/i },
]

export function domainForMethod(name: string): string {
  for (const r of DOMAIN_RULES) {
    if (r.re.test(name)) return r.domain
  }
  return 'other'
}

export function buildMicroscopeContext(
  diagram: DiagramLike,
  overlay?: MicroscopeOverlay,
): MicroscopeContext {
  return {
    diagram,
    analysis: analyzeDiagram(diagram),
    overlay,
  }
}

export function getOverview(ctx: MicroscopeContext, focusId: string) {
  const node = ctx.analysis.byElementId[focusId]
  if (!node) return null
  const { out, inn } = buildAdj(ctx.diagram)
  const directDeps = out.get(focusId) ?? []
  const directDepsDependents = inn.get(focusId) ?? []
  const indirect = bfsReachable(focusId, out)
  const interfaces = directDeps.filter(
    id => ctx.analysis.byElementId[id]?.nodeType === 'interface',
  )
  return {
    name: node.name,
    nodeType: node.nodeType,
    responsibilities: node.responsibilities,
    dependencies: directDeps.length,
    dependents: directDepsDependents.length,
    indirectDependencies: indirect.ids.length,
    outgoingRelationships: node.outDegree,
    inboundRelationships: node.inDegree,
    interfaceDeps: interfaces.length,
    concerns: node.concerns,
  }
}

export function getDependencyLens(ctx: MicroscopeContext, focusId: string) {
  const { out, inn, byEid } = buildAdj(ctx.diagram)
  const label = (id: string) => nameOf(byEid.get(id), id)
  const direct = (out.get(focusId) ?? []).map(id => ({ id, name: label(id) }))
  const dependents = (inn.get(focusId) ?? []).map(id => ({ id, name: label(id) }))
  const { ids: indirectIds, depth } = bfsReachable(focusId, out)
  const indirect = indirectIds
    .filter(id => !direct.some(d => d.id === id))
    .map(id => ({ id, name: label(id), depth: depth.get(id) ?? 0 }))
  const maxDepth = Math.max(0, ...[...depth.values()])
  const chains: { path: string[]; labels: string[] }[] = []
  // Sample deepest path
  let deepest: string | null = null
  let deepestD = 0
  for (const [id, d] of depth) {
    if (d > deepestD) {
      deepestD = d
      deepest = id
    }
  }
  if (deepest) {
    // reconstruct one path via BFS parents
    const parent = new Map<string, string>()
    const q = [focusId]
    const seen = new Set([focusId])
    while (q.length) {
      const u = q.shift()!
      for (const v of out.get(u) ?? []) {
        if (seen.has(v)) continue
        seen.add(v)
        parent.set(v, u)
        q.push(v)
      }
    }
    const path: string[] = []
    let cur: string | undefined = deepest
    while (cur && cur !== focusId) {
      path.unshift(cur)
      cur = parent.get(cur)
    }
    path.unshift(focusId)
    chains.push({ path, labels: path.map(label) })
  }
  return {
    direct,
    dependents,
    indirect,
    dependencyDepth: maxDepth,
    sampleChain: chains[0] ?? null,
  }
}

export function getBlastRadius(ctx: MicroscopeContext, focusId: string) {
  const { inn, byEid } = buildAdj(ctx.diagram)
  // Dependents = who breaks if focus changes (inbound transitive)
  const { ids: indirect, depth } = bfsReachable(focusId, inn)
  const direct = inn.get(focusId) ?? []
  const label = (id: string) => nameOf(byEid.get(id), id)
  const allAffected = new Set([focusId, ...direct, ...indirect])
  const flows = (ctx.overlay?.flows ?? []).filter(f =>
    f.steps.some(s => allAffected.has(s.elementId)),
  )
  return {
    direct: direct.map(id => ({ id, name: label(id) })),
    indirect: indirect
      .filter(id => !direct.includes(id))
      .map(id => ({ id, name: label(id), depth: depth.get(id) ?? 0 })),
    affectedComponentCount: allAffected.size,
    affectedFlowCount: flows.length,
    affectedFlows: flows.map(f => ({ id: f.id, label: f.label })),
    highlightIds: [...allAffected],
  }
}

export function getResponsibilityLens(ctx: MicroscopeContext, focusId: string) {
  const node = ctx.analysis.byElementId[focusId]
  const raw = nodeByElementId(ctx.diagram).get(focusId)
  const methods = raw?.data?.methods ?? []
  const items = methods.map(m => {
    const name = m.name
    const domain = domainForMethod(name)
    const key = `${focusId}.${name}`
    return {
      name,
      returnType: m.returnType ?? 'void',
      visibility: String((m as { visibility?: string }).visibility ?? 'public'),
      domain,
      note: ctx.overlay?.responsibilityNotes?.[key],
    }
  })
  const byDomain = new Map<string, number>()
  for (const it of items) {
    byDomain.set(it.domain, (byDomain.get(it.domain) ?? 0) + 1)
  }
  const domains = [...byDomain.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
  const total = items.length || 1
  const cohesion = domains.map(d => ({
    domain: d.domain,
    count: d.count,
    ratio: d.count / total,
  }))
  return {
    items,
    domains,
    cohesion,
    fromNotes: node?.responsibilities ?? [],
  }
}

export function getEncapsulationLens(ctx: MicroscopeContext, focusId: string) {
  const raw = nodeByElementId(ctx.diagram).get(focusId)
  const methods = (raw?.data?.methods ?? []) as {
    name: string
    visibility?: string
  }[]
  const pub = methods.filter(
    m => !m.visibility || m.visibility === 'public' || m.visibility === '+',
  )
  const internal = methods.filter(
    m =>
      m.visibility === 'private' ||
      m.visibility === 'protected' ||
      m.visibility === '-' ||
      m.visibility === '#',
  )
  const { inn } = buildAdj(ctx.diagram)
  return {
    publicApi: pub.map(m => m.name),
    internal: internal.map(m => m.name),
    externalAccessors: (inn.get(focusId) ?? []).length,
    internalOps: internal.length,
  }
}

export function getAbstractionLens(ctx: MicroscopeContext, focusId: string) {
  const { out, inn, byEid } = buildAdj(ctx.diagram)
  const label = (id: string) => nameOf(byEid.get(id), id)
  const node = ctx.analysis.byElementId[focusId]
  const realizations: { id: string; name: string }[] = []
  const interfacesUsed: { id: string; name: string; impls: { id: string; name: string }[] }[] =
    []

  // If focus is interface — find realizations (inbound realization edges)
  for (const e of ctx.diagram.edges ?? []) {
    const byRf = new Map((ctx.diagram.nodes ?? []).map(n => [n.id, n]))
    const s = byRf.get(e.source)
    const t = byRf.get(e.target)
    if (!s || !t) continue
    const rel = e.data?.relationshipType ?? 'association'
    if (rel === 'realization' && eid(t) === focusId) {
      realizations.push({ id: eid(s), name: label(eid(s)) })
    }
  }

  for (const depId of out.get(focusId) ?? []) {
    const dep = ctx.analysis.byElementId[depId]
    if (dep?.nodeType !== 'interface') continue
    const impls: { id: string; name: string }[] = []
    for (const e of ctx.diagram.edges ?? []) {
      const byRf = new Map((ctx.diagram.nodes ?? []).map(n => [n.id, n]))
      const s = byRf.get(e.source)
      const t = byRf.get(e.target)
      if (!s || !t) continue
      if ((e.data?.relationshipType ?? '') === 'realization' && eid(t) === depId) {
        impls.push({ id: eid(s), name: label(eid(s)) })
      }
    }
    interfacesUsed.push({ id: depId, name: label(depId), impls })
  }

  const concreteDeps = (out.get(focusId) ?? []).filter(id => {
    const t = ctx.analysis.byElementId[id]?.nodeType
    return t === 'class' || t === 'abstract-class'
  })

  return {
    focusType: node?.nodeType ?? 'class',
    realizations,
    interfacesUsed,
    concreteDeps: concreteDeps.map(id => ({ id, name: label(id) })),
    consumers: (inn.get(focusId) ?? []).map(id => ({ id, name: label(id) })),
  }
}

export function getConsumerLens(ctx: MicroscopeContext, focusId: string) {
  return getAbstractionLens(ctx, focusId)
}

export function getCreationLens(ctx: MicroscopeContext, focusId: string) {
  const { byEid } = buildAdj(ctx.diagram)
  const label = (id: string) => nameOf(byEid.get(id), id)
  const authored = ctx.overlay?.creationEdges ?? []
  const fromGraph: { from: string; to: string }[] = []
  for (const e of ctx.diagram.edges ?? []) {
    const byRf = new Map((ctx.diagram.nodes ?? []).map(n => [n.id, n]))
    const s = byRf.get(e.source)
    const t = byRf.get(e.target)
    if (!s || !t) continue
    const lbl = String(e.data?.label ?? '').toLowerCase()
    const stereo = String((e.data as { stereotype?: string })?.stereotype ?? '').toLowerCase()
    if (lbl.includes('create') || stereo.includes('create') || stereo === 'instantiate') {
      fromGraph.push({ from: eid(s), to: eid(t) })
    }
  }
  const all = [...authored, ...fromGraph]
  const creates = all.filter(c => c.from === focusId)
  const createdBy = all.filter(c => c.to === focusId)
  const uses = (ctx.analysis.byElementId[focusId]?.outbound ?? []).map(o => ({
    id: o.toId,
    name: o.toName,
    type: o.type,
  }))
  return {
    creates: creates.map(c => ({ id: c.to, name: label(c.to) })),
    createdBy: createdBy.map(c => ({ id: c.from, name: label(c.from) })),
    uses,
  }
}

export function getCycleLens(ctx: MicroscopeContext, focusId?: string) {
  const cycles = ctx.analysis.cycles
  const { byEid } = buildAdj(ctx.diagram)
  const label = (id: string) => nameOf(byEid.get(id), id)
  const involving = focusId
    ? cycles.filter(c => c.includes(focusId))
    : cycles
  return {
    cycles: involving.map(c => ({
      ids: c,
      labels: c.map(label),
    })),
    allCount: cycles.length,
  }
}

const LAYER_ORDER: ArchitectureLayer[] = [
  'presentation',
  'application',
  'domain',
  'infrastructure',
]

function inferLayer(node: AnalyzeNode): ArchitectureLayer | null {
  const stereo = String(node.data?.stereotype ?? '').toLowerCase()
  const name = String(node.data?.name ?? '').toLowerCase()
  if (stereo.includes('controller') || /controller$/.test(name) || stereo === 'presentation')
    return 'presentation'
  if (stereo.includes('application') || /usecase|appService/i.test(name)) return 'application'
  if (stereo.includes('domain') || /entity|aggregate/i.test(stereo)) return 'domain'
  if (
    stereo.includes('infra') ||
    /repo|gateway|adapter|stripe|razor|email|db|redis/i.test(name)
  )
    return 'infrastructure'
  return null
}

export function getLayerLens(ctx: MicroscopeContext, focusId?: string) {
  const layers = ctx.overlay?.layers ?? {}
  const { byEid } = buildAdj(ctx.diagram)
  const byLayer: Record<ArchitectureLayer, { id: string; name: string }[]> = {
    presentation: [],
    application: [],
    domain: [],
    infrastructure: [],
  }
  for (const [id, n] of byEid) {
    const layer = layers[id] ?? inferLayer(n)
    if (!layer) continue
    byLayer[layer].push({ id, name: nameOf(n) })
  }
  const illegal: { from: string; to: string; fromLayer: string; toLayer: string }[] = []
  const byRf = new Map((ctx.diagram.nodes ?? []).map(n => [n.id, n]))
  for (const e of ctx.diagram.edges ?? []) {
    const s = byRf.get(e.source)
    const t = byRf.get(e.target)
    if (!s || !t) continue
    const se = eid(s)
    const te = eid(t)
    const fl = layers[se] ?? inferLayer(s)
    const tl = layers[te] ?? inferLayer(t)
    if (!fl || !tl) continue
    const fi = LAYER_ORDER.indexOf(fl)
    const ti = LAYER_ORDER.indexOf(tl)
    // Domain → infrastructure concrete SDK is often flagged; also lower layer → higher
    if (fl === 'domain' && tl === 'infrastructure') {
      illegal.push({
        from: nameOf(s),
        to: nameOf(t),
        fromLayer: fl,
        toLayer: tl,
      })
    } else if (fi > ti && fl === 'infrastructure' && tl === 'domain') {
      // ok typically
    } else if (fi < ti - 1 && fl === 'presentation' && tl === 'infrastructure') {
      illegal.push({
        from: nameOf(s),
        to: nameOf(t),
        fromLayer: fl,
        toLayer: tl,
      })
    }
  }
  const focusLayer = focusId
    ? layers[focusId] ?? inferLayer(byEid.get(focusId)!)
    : null
  return { byLayer, illegal, focusLayer, highlightIds: focusLayer ? byLayer[focusLayer].map(x => x.id) : [] }
}

export function getFlowLens(ctx: MicroscopeContext, focusId?: string, flowId?: string) {
  const flows = ctx.overlay?.flows ?? []
  let selected = flowId ? flows.find(f => f.id === flowId) : undefined
  if (!selected && focusId) {
    selected = flows.find(f => f.steps.some(s => s.elementId === focusId))
  }
  if (!selected && flows[0]) selected = flows[0]

  // Heuristic: BFS path from highest fan-in toward focus then out
  let heuristicPath: { id: string; name: string; note?: string }[] | null = null
  if (!selected && focusId) {
    const { out, inn, byEid } = buildAdj(ctx.diagram)
    const label = (id: string) => nameOf(byEid.get(id), id)
    const roots = [...inn.entries()].filter(([, v]) => v.length === 0).map(([k]) => k)
    const start = roots[0] ?? focusId
    const { ids } = bfsReachable(start, out)
    const path = [start, ...ids.filter(id => id === focusId || (out.get(focusId) ?? []).includes(id))]
    // simpler: focus + outbound chain
    const chain = [focusId]
    let cur = focusId
    for (let i = 0; i < 6; i++) {
      const next = (out.get(cur) ?? [])[0]
      if (!next) break
      chain.push(next)
      cur = next
    }
    heuristicPath = chain.map(id => ({ id, name: label(id) }))
  }

  const steps =
    selected?.steps.map(s => ({
      id: s.elementId,
      name: ctx.analysis.byElementId[s.elementId]?.name ?? s.elementId,
      note: s.note,
    })) ?? heuristicPath

  return {
    flows: flows.map(f => ({ id: f.id, label: f.label, entryMethod: f.entryMethod })),
    selected: selected
      ? { id: selected.id, label: selected.label, entryMethod: selected.entryMethod }
      : null,
    steps: steps ?? [],
    highlightIds: (steps ?? []).map(s => s.id),
    heuristic: !selected && !!heuristicPath,
  }
}

export function getRelationshipInspector(
  ctx: MicroscopeContext,
  edge: AnalyzeEdge,
) {
  const byRf = new Map((ctx.diagram.nodes ?? []).map(n => [n.id, n]))
  const s = byRf.get(edge.source)
  const t = byRf.get(edge.target)
  if (!s || !t) return null
  const se = eid(s)
  const te = eid(t)
  const rel = edge.data?.relationshipType ?? 'association'
  const targetType = ctx.analysis.byElementId[te]?.nodeType
  const abs = getAbstractionLens(ctx, te)
  return {
    edgeId: edge.elementId ?? edge.id,
    type: rel,
    direction: `${nameOf(s)} → ${nameOf(t)}`,
    fromId: se,
    toId: te,
    fromName: nameOf(s),
    toName: nameOf(t),
    abstraction:
      targetType === 'interface'
        ? 'Interface'
        : targetType === 'abstract-class'
          ? 'Abstract'
          : 'Concrete class',
    implementations: abs.realizations,
    consumers: abs.consumers,
    label: edge.data?.label,
  }
}

export function getSystemClusters(ctx: MicroscopeContext) {
  const layers = getLayerLens(ctx)
  const stereoGroups = new Map<string, { id: string; name: string }[]>()
  for (const n of ctx.diagram.nodes ?? []) {
    const stereo = String(n.data?.stereotype ?? 'untyped') || 'untyped'
    const list = stereoGroups.get(stereo) ?? []
    list.push({ id: eid(n), name: nameOf(n) })
    stereoGroups.set(stereo, list)
  }
  return {
    layers: layers.byLayer,
    stereotypes: [...stereoGroups.entries()].map(([stereo, nodes]) => ({
      stereo,
      nodes,
    })),
  }
}

export function getXRayTree(
  ctx: MicroscopeContext,
  focusId: string,
  mode: 'dependency' | 'responsibility' | 'flow',
) {
  if (mode === 'dependency') {
    const dep = getDependencyLens(ctx, focusId)
    return {
      mode,
      root: focusId,
      rootName: ctx.analysis.byElementId[focusId]?.name ?? focusId,
      children: dep.direct.map(d => ({
        id: d.id,
        name: d.name,
        children: dep.indirect
          .filter(i => i.depth === 2)
          .slice(0, 5)
          .map(i => ({ id: i.id, name: i.name, children: [] as { id: string; name: string; children: [] }[] })),
      })),
    }
  }
  if (mode === 'responsibility') {
    const resp = getResponsibilityLens(ctx, focusId)
    return {
      mode,
      root: focusId,
      rootName: ctx.analysis.byElementId[focusId]?.name ?? focusId,
      children: resp.domains.map(d => ({
        id: d.domain,
        name: `${d.domain} (${d.count})`,
        children: resp.items
          .filter(i => i.domain === d.domain)
          .map(i => ({ id: i.name, name: i.name, children: [] })),
      })),
    }
  }
  const flow = getFlowLens(ctx, focusId)
  return {
    mode,
    root: focusId,
    rootName: flow.selected?.label ?? 'Flow',
    children: (flow.steps ?? []).map(s => ({
      id: s.id,
      name: s.name,
      children: [] as { id: string; name: string; children: [] }[],
    })),
  }
}

/** Compute highlight + dim sets for canvas. */
export function computeFocusSets(
  ctx: MicroscopeContext,
  focusId: string | null,
  lens: MicroscopeLens,
  opts?: { flowId?: string; edgeHighlight?: string[] },
): { highlightIds: string[]; dimIds: string[] } {
  const allIds = Object.keys(ctx.analysis.byElementId)
  if (!focusId) {
    if (lens === 'cycles') {
      const cyc = getCycleLens(ctx)
      const ids = new Set(cyc.cycles.flatMap(c => c.ids))
      return {
        highlightIds: [...ids],
        dimIds: allIds.filter(id => !ids.has(id)),
      }
    }
    if (lens === 'layers') {
      const L = getLayerLens(ctx)
      return { highlightIds: L.highlightIds, dimIds: allIds.filter(id => !L.highlightIds.includes(id)) }
    }
    return { highlightIds: [], dimIds: [] }
  }

  let highlight = new Set<string>([focusId])
  if (lens === 'dependencies' || lens === 'overview') {
    const d = getDependencyLens(ctx, focusId)
    d.direct.forEach(x => highlight.add(x.id))
    d.dependents.forEach(x => highlight.add(x.id))
  } else if (lens === 'blast') {
    getBlastRadius(ctx, focusId).highlightIds.forEach(id => highlight.add(id))
  } else if (lens === 'flows') {
    getFlowLens(ctx, focusId, opts?.flowId).highlightIds.forEach(id => highlight.add(id))
  } else if (lens === 'abstractions' || lens === 'consumers') {
    const a = getAbstractionLens(ctx, focusId)
    a.interfacesUsed.forEach(i => {
      highlight.add(i.id)
      i.impls.forEach(im => highlight.add(im.id))
    })
    a.realizations.forEach(r => highlight.add(r.id))
    a.consumers.forEach(c => highlight.add(c.id))
  } else if (lens === 'creation') {
    const c = getCreationLens(ctx, focusId)
    c.creates.forEach(x => highlight.add(x.id))
    c.createdBy.forEach(x => highlight.add(x.id))
  } else if (lens === 'cycles') {
    getCycleLens(ctx, focusId).cycles.forEach(c => c.ids.forEach(id => highlight.add(id)))
  } else if (lens === 'layers') {
    getLayerLens(ctx, focusId).highlightIds.forEach(id => highlight.add(id))
  }
  if (opts?.edgeHighlight) opts.edgeHighlight.forEach(id => highlight.add(id))

  return {
    highlightIds: [...highlight],
    dimIds: allIds.filter(id => !highlight.has(id)),
  }
}

export function pathBetween(
  ctx: MicroscopeContext,
  fromId: string,
  toId: string,
): string[] | null {
  const { out } = buildAdj(ctx.diagram)
  const parent = new Map<string, string>()
  const q = [fromId]
  const seen = new Set([fromId])
  while (q.length) {
    const u = q.shift()!
    if (u === toId) break
    for (const v of out.get(u) ?? []) {
      if (seen.has(v)) continue
      seen.add(v)
      parent.set(v, u)
      q.push(v)
    }
  }
  if (!seen.has(toId) && fromId !== toId) {
    // try reverse (dependents direction)
    const { inn } = buildAdj(ctx.diagram)
    const parent2 = new Map<string, string>()
    const q2 = [fromId]
    const seen2 = new Set([fromId])
    while (q2.length) {
      const u = q2.shift()!
      for (const v of inn.get(u) ?? []) {
        if (seen2.has(v)) continue
        seen2.add(v)
        parent2.set(v, u)
        q2.push(v)
      }
    }
    if (!seen2.has(toId)) return null
    const path: string[] = []
    let cur: string | undefined = toId
    while (cur && cur !== fromId) {
      path.unshift(cur)
      cur = parent2.get(cur)
    }
    path.unshift(fromId)
    return path
  }
  const path: string[] = []
  let cur: string | undefined = toId
  while (cur && cur !== fromId) {
    path.unshift(cur)
    cur = parent.get(cur)
  }
  path.unshift(fromId)
  return path
}

export type { NodeAnalysis, DiagramAnalysis }

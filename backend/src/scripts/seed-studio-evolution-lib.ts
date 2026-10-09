/**
 * Helpers for Design Studio "Architecture Evolution" ChallengePack seeds.
 */

import type { ChangeFlow } from './seed-studio-change-lib'

export type EvolutionStageCategory =
  | 'product'
  | 'scale'
  | 'reliability'
  | 'incident'
  | 'team'
  | 'legacy'
  | string

export interface EvolutionDebtOpportunity {
  id: string
  prompt: string
  costIfDeferred: string
  laterStageId?: string
}

export interface EvolutionIntroduceCatalog {
  namePattern: string
  benefits: string[]
  costs: string[]
}

export interface EvolutionStageSeed {
  id: string
  dayLabel: string
  title: string
  category?: EvolutionStageCategory
  narrative: string
  metrics?: {
    users?: number
    ordersPerDay?: number
    latencyMs?: number
    availability?: string
  }
  pressureOptions: string[]
  expectedPressures?: string[]
  mustChange: boolean
  doNothingHint?: string
  protectedFlows?: ChangeFlow[]
  newFlows?: ChangeFlow[]
  forbidModifyElementNames?: string[]
  expectedTouchHints?: string[]
  debtOpportunity?: EvolutionDebtOpportunity
  introduceCatalog?: EvolutionIntroduceCatalog[]
  complexityBudget?: number
  approachHints?: string[]
}

export interface EvolutionPackSeed {
  type: 'evolution'
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  status: 'published'
  planMin: 'free' | 'pro' | 'ultimate'
  order: number
  tags: string[]
  diagramSnapshot: {
    version: 1
    meta: { theme: 'light'; zoom: number; panX: number; panY: number }
    nodes: ReturnType<typeof node>[]
    edges: ReturnType<typeof edge>[]
  }
  payload: {
    briefing?: string
    dimensions?: string[]
    stages: EvolutionStageSeed[]
  }
}

export const META = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

type MethodSpec =
  | string
  | {
      name: string
      returnType?: string
      params?: { name: string; type: string }[]
      visibility?: 'public' | 'private' | 'protected'
      isStatic?: boolean
      isAbstract?: boolean
    }

function normalizeMethod(m: MethodSpec) {
  if (typeof m === 'string') {
    return {
      name: m,
      returnType: 'void',
      params: [] as { name: string; type: string }[],
      visibility: 'public' as const,
      isStatic: false,
      isAbstract: false,
    }
  }
  return {
    name: m.name,
    returnType: m.returnType ?? 'void',
    params: m.params ?? [],
    visibility: m.visibility ?? ('public' as const),
    isStatic: m.isStatic ?? false,
    isAbstract: m.isAbstract ?? false,
  }
}

/** Grid cell — 280×200 gaps keep arrows readable. */
export function pos(col: number, row: number, ox = 40, oy = 40) {
  return { x: ox + col * 280, y: oy + row * 200 }
}

export function node(
  id: string,
  elementId: string,
  name: string,
  position: { x: number; y: number },
  methods: MethodSpec[] = [],
  attrs: { name: string; type: string; visibility?: string }[] = [],
  nodeType: 'class' | 'interface' | 'abstract' = 'class',
) {
  return {
    id,
    position,
    data: {
      elementId,
      nodeType,
      name,
      attributes: attrs.map(a => ({
        name: a.name,
        type: a.type,
        visibility: a.visibility ?? 'private',
      })),
      methods: methods.map(normalizeMethod),
    },
  }
}

export function edge(
  id: string,
  elementId: string,
  source: string,
  target: string,
  relationshipType: 'dependency' | 'association' | 'inheritance' | 'composition' | 'aggregation' = 'dependency',
  sourceHandle = 'bottom',
  targetHandle = 'top',
) {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: relationshipType,
    data: { elementId, relationshipType, lineStyle: 'step' as const },
  }
}

export function flow(
  id: string,
  label: string,
  opts: {
    keep?: string[]
    reach?: { from: string; to: string }[]
    topics?: string[]
    notReach?: { from: string; to: string }[]
  } = {},
): ChangeFlow {
  return {
    id,
    label,
    mustKeepElementNames: opts.keep,
    mustReach: opts.reach,
    mustHavePathTopics: opts.topics,
    mustNotReach: opts.notReach,
  }
}

/** Vertical chain layout — one column, no crossing edges. */
export function chainDiagram(
  slug: string,
  classes: { name: string; methods?: MethodSpec[]; col?: number; row?: number }[],
  links: { from: string; to: string; type?: 'dependency' | 'association' | 'composition' }[],
) {
  const prefix = slug.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase() || 'evo'
  const nameToId = new Map<string, string>()
  const nodes = classes.map((c, i) => {
    const nid = `n${i + 1}`
    nameToId.set(c.name, nid)
    const col = c.col ?? 1
    const row = c.row ?? i
    const el = `el-${prefix}-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return node(nid, el, c.name, pos(col, row), c.methods ?? [])
  })
  const edgesOut = links.map((l, i) => {
    const src = nameToId.get(l.from)
    const tgt = nameToId.get(l.to)
    if (!src || !tgt) throw new Error(`Bad link ${l.from}->${l.to} in ${slug}`)
    const el = `ed-${prefix}-${i + 1}`
    return edge(`e${i + 1}`, el, src, tgt, l.type ?? 'dependency')
  })
  return { nodes, edges: edgesOut }
}

/** Hub: orchestrator at (1,1), deps on row 2 left/right, optional client row 0. */
export function hubDiagram(
  slug: string,
  hub: string,
  hubMethods: MethodSpec[],
  deps: { name: string; methods?: MethodSpec[]; slot: 'left' | 'right' | 'center' }[],
  client?: { name: string; methods?: MethodSpec[] },
) {
  const classes: { name: string; methods?: MethodSpec[]; col: number; row: number }[] = []
  if (client) classes.push({ name: client.name, methods: client.methods, col: 1, row: 0 })
  classes.push({ name: hub, methods: hubMethods, col: 1, row: 1 })
  for (const d of deps) {
    const col = d.slot === 'left' ? 0 : d.slot === 'right' ? 2 : 1
    classes.push({ name: d.name, methods: d.methods, col, row: 2 })
  }
  const links: { from: string; to: string }[] = []
  if (client) links.push({ from: client.name, to: hub })
  for (const d of deps) links.push({ from: hub, to: d.name })
  return chainDiagram(slug, classes, links)
}

export function evoPack(p: {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  order: number
  tags: string[]
  nodes: ReturnType<typeof node>[]
  edges: ReturnType<typeof edge>[]
  briefing: string
  dimensions?: string[]
  stages: EvolutionStageSeed[]
  planMin?: 'free' | 'pro' | 'ultimate'
}): EvolutionPackSeed {
  return {
    type: 'evolution',
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    description: p.description,
    status: 'published',
    planMin: p.planMin ?? 'free',
    order: p.order,
    tags: p.tags,
    diagramSnapshot: {
      version: 1,
      meta: META,
      nodes: p.nodes,
      edges: p.edges,
    },
    payload: {
      briefing: p.briefing,
      dimensions: p.dimensions ?? ['product', 'scale'],
      stages: p.stages,
    },
  }
}

export interface EvolutionBaseTrack {
  key: string
  title: string
  tags: string[]
  description: string
  briefing: string
  dimensions?: string[]
  diagram:
    | ReturnType<typeof chainDiagram>
    | { nodes: ReturnType<typeof node>[]; edges: ReturnType<typeof edge>[] }
  holdStage: EvolutionStageSeed
  /** Progressive changes — easy uses [0], medium [0,1], hard [0,1,2] (+ optional incident). */
  changeStages: EvolutionStageSeed[]
  /** Optional fourth/fifth stage for hard-only (incident, team split, legacy). */
  hardExtraStages?: EvolutionStageSeed[]
}

export function expandBaseToPacks(base: EvolutionBaseTrack, orderStart: number): EvolutionPackSeed[] {
  const diagram =
    'nodes' in base.diagram && 'edges' in base.diagram
      ? base.diagram
      : base.diagram

  const mk = (
    difficulty: 'easy' | 'medium' | 'hard',
    order: number,
    stages: EvolutionStageSeed[],
    titleSuffix: string,
  ) =>
    evoPack({
      slug: `evo2-${base.key}-${difficulty}`,
      title: `${base.title}${titleSuffix}`,
      difficulty,
      description: base.description,
      order,
      tags: [...base.tags, 'evolution', difficulty],
      nodes: diagram.nodes,
      edges: diagram.edges,
      briefing: base.briefing,
      dimensions: base.dimensions,
      stages,
    })

  const easyStages = [base.holdStage, base.changeStages[0]].filter(Boolean)
  const mediumStages = [base.holdStage, ...base.changeStages.slice(0, 2)]
  const hardStages = [
    base.holdStage,
    ...base.changeStages,
    ...(base.hardExtraStages ?? []),
  ]

  return [
    mk('easy', orderStart, easyStages, ' (Growth Track)'),
    mk('medium', orderStart + 1, mediumStages, ' (Scale Track)'),
    mk('hard', orderStart + 2, hardStages, ' (Resilience Track)'),
  ]
}

/** Flatten bases into 102 packs: 34 bases × 3 difficulties, orders 600–701. */
export function expandAllBases(bases: EvolutionBaseTrack[]): EvolutionPackSeed[] {
  const out: EvolutionPackSeed[] = []
  let order = 600
  for (const base of bases) {
    const trio = expandBaseToPacks(base, order)
    out.push(...trio)
    order += 3
  }
  return out
}

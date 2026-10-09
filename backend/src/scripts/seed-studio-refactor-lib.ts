/**
 * Helpers for Design Studio "Refactor" ChallengePack seeds.
 */

export type RefactorScenario = 'cleanup' | 'extract' | 'decouple' | 'redesign'

export type MethodSpec =
  | string
  | {
      name: string
      returnType?: string
      params?: { name: string; type: string }[]
      visibility?: 'public' | 'private' | 'protected'
      isStatic?: boolean
      isAbstract?: boolean
    }

export interface RefactorFlow {
  id: string
  label: string
  steps?: string[]
  mustReach?: { from: string; to: string }[]
  mustKeepElementNames?: string[]
  mustHavePathTopics?: string[]
}

export interface RefactorPackSeed {
  type: 'refactor'
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
    briefing: string
    requirements: string[]
    constraints: string[]
    behaviorContract: { flows: RefactorFlow[] }
    maxNewAbstractions: number
    forbidDeleteElementNames: string[]
    scenario: RefactorScenario
    modelHints?: string[]
  }
}

export const META = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

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

export function pack(p: {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  order: number
  tags: string[]
  nodes: ReturnType<typeof node>[]
  edges: ReturnType<typeof edge>[]
  briefing: string
  requirements: string[]
  constraints?: string[]
  flows: RefactorFlow[]
  maxNewAbstractions?: number
  forbidDeleteElementNames: string[]
  scenario: RefactorScenario
  modelHints?: string[]
  planMin?: 'free' | 'pro' | 'ultimate'
}): RefactorPackSeed {
  const defaultConstraints = [
    'Do not remove functionality',
    'Existing behavior must remain',
    'Reduce unnecessary coupling',
    `Do not introduce more than ${p.maxNewAbstractions ?? (p.difficulty === 'easy' ? 2 : p.difficulty === 'medium' ? 3 : 5)} new abstractions`,
  ]
  return {
    type: 'refactor',
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
      requirements: p.requirements,
      constraints: p.constraints ?? defaultConstraints,
      behaviorContract: { flows: p.flows },
      maxNewAbstractions: p.maxNewAbstractions ?? (p.difficulty === 'easy' ? 2 : p.difficulty === 'medium' ? 3 : 5),
      forbidDeleteElementNames: p.forbidDeleteElementNames,
      scenario: p.scenario,
      modelHints: p.modelHints,
    },
  }
}

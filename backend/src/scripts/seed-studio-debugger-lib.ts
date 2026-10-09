/**
 * Helpers for Design Studio "Debug and Fix" (ChallengePack type: debugger) seeds.
 */

export type DebuggerCategory =
  | 'Tight Coupling'
  | 'SRP Violation'
  | 'DIP Violation'
  | 'Incorrect Inheritance'
  | 'Circular Dependency'
  | 'God Object'
  | 'Unnecessary Abstraction'
  | 'Pattern Misuse'
  | 'Poor Encapsulation'
  | 'OCP Violation'
  | 'Other'

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

export interface ExpectedIssueSeed {
  id: string
  elementIds: string[]
  category: DebuggerCategory
  aliases?: string[]
  explanationKeywords: string[]
  modelAnswer: string
  hints: string[]
}

export interface DebuggerPackSeed {
  type: 'debugger'
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
    requirement: string
    revealCount: 'exact' | 'hidden'
    timeLimitSec: number
    expectedIssues: ExpectedIssueSeed[]
    verification?: {
      mustIntroduceElementNames?: string[]
      forbidDirectEdges?: { from: string; to: string }[]
      requireNoEditTo?: string[]
    }
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

/** Grid cell helpers — 280×180 gaps keep arrows readable. */
export function pos(col: number, row: number, ox = 40, oy = 40) {
  return { x: ox + col * 280, y: oy + row * 180 }
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
) {
  return { id, source, target, data: { elementId, relationshipType } }
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
  requirement: string
  expectedIssues: ExpectedIssueSeed[]
  verification?: DebuggerPackSeed['payload']['verification']
  timeLimitSec?: number
  planMin?: 'free' | 'pro' | 'ultimate'
  revealCount?: 'exact' | 'hidden'
}): DebuggerPackSeed {
  return {
    type: 'debugger',
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
      requirement: p.requirement,
      revealCount: p.revealCount ?? 'exact',
      timeLimitSec: p.timeLimitSec ?? (p.difficulty === 'easy' ? 480 : p.difficulty === 'medium' ? 720 : 900),
      expectedIssues: p.expectedIssues,
      verification: p.verification,
    },
  }
}

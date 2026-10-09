/**
 * Helpers for Design Studio "Architecture Budget / Budget Pressure" ChallengePack seeds.
 */

import type {
  BudgetConfig,
  BudgetConstraints,
  BudgetGrading,
  BudgetInvestment,
  BudgetPressure,
  BudgetPriority,
  BudgetStage,
  BudgetDifficultyMode,
  BudgetKind,
} from '../services/studio/budgetVerify'

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

export interface BudgetPackSeed {
  type: 'budget'
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
    scenario: string
    difficultyMode: BudgetDifficultyMode
    auctionMode?: boolean
    auctionBlurb?: string
    comboMode?: boolean
    comboBlurb?: string
    budget: BudgetConfig
    suggestedReserve?: number
    priorities: BudgetPriority[]
    pressures: BudgetPressure[]
    investments: BudgetInvestment[]
    constraints?: BudgetConstraints
    stages: BudgetStage[]
    grading?: BudgetGrading
    evolutionHooks?: {
      linkedEvolutionSlug?: string
      debtPressureMap?: Record<string, string>
      handoffBlurb?: string
    }
  }
}

export const META = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

export const WHY_COMMON = [
  'Reduce read latency',
  'Reduce database load',
  'Improve availability',
  'Future scalability',
  'Decouple providers',
  'Improve reliability',
  'Cut synchronous wait',
  'Team maintainability',
  'Meet compliance',
  'Other',
]

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

/** Vertical / hub layout with no crossing edges. */
export function chainDiagram(
  slug: string,
  classes: { name: string; methods?: MethodSpec[]; col?: number; row?: number }[],
  links: { from: string; to: string; type?: 'dependency' | 'association' | 'composition' }[],
) {
  const prefix = slug.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase() || 'bud'
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
    return edge(`e${i + 1}`, `ed-${prefix}-${i + 1}`, src, tgt, l.type ?? 'dependency')
  })
  return { nodes, edges: edgesOut }
}

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

export function inv(p: {
  id: string
  label: string
  category: BudgetInvestment['category']
  cost: number
  summary?: string
  tags?: string[]
  benefits?: string[]
  complexities?: string[]
  risks?: string[]
  appliesToHints?: string[]
  cheapHackOf?: string
  properAlternativeOf?: string
  costMin?: number
  costMax?: number
}): BudgetInvestment {
  return {
    ...p,
    whyOptions: WHY_COMMON,
    tags: p.tags ?? [],
    benefits: p.benefits ?? [],
    complexities: p.complexities ?? [],
    risks: p.risks ?? [],
  }
}

export function pri(
  id: string,
  label: string,
  weight: BudgetPriority['weight'],
  coveredByTags: string[],
): BudgetPriority {
  return { id, label, weight, coveredByTags }
}

export function pressure(
  id: string,
  label: string,
  severity: BudgetPressure['severity'],
  addressedByTags: string[],
  addressedByInvestmentIds?: string[],
): BudgetPressure {
  return { id, label, severity, addressedByTags, addressedByInvestmentIds }
}

export function budgetPack(p: {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  order: number
  tags: string[]
  nodes: ReturnType<typeof node>[]
  edges: ReturnType<typeof edge>[]
  briefing: string
  scenario: string
  budget: BudgetConfig
  priorities: BudgetPriority[]
  pressures: BudgetPressure[]
  investments: BudgetInvestment[]
  stages: BudgetStage[]
  constraints?: BudgetConstraints
  grading?: BudgetGrading
  suggestedReserve?: number
  difficultyMode?: BudgetDifficultyMode
  planMin?: 'free' | 'pro' | 'ultimate'
  evolutionHooks?: BudgetPackSeed['payload']['evolutionHooks']
  auctionMode?: boolean
  auctionBlurb?: string
}): BudgetPackSeed {
  const mode: BudgetDifficultyMode =
    p.difficultyMode ??
    (p.difficulty === 'easy' ? 'beginner' : p.difficulty === 'medium' ? 'intermediate' : 'advanced')
  return {
    type: 'budget',
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
      scenario: p.scenario,
      difficultyMode: mode,
      auctionMode: p.auctionMode,
      auctionBlurb: p.auctionBlurb,
      budget: p.budget,
      suggestedReserve: p.suggestedReserve ?? Math.max(1, Math.floor(p.budget.total * 0.2)),
      priorities: p.priorities,
      pressures: p.pressures,
      investments: p.investments,
      constraints: p.constraints,
      stages: p.stages,
      grading: p.grading ?? {
        opportunityCostEnabled: true,
        inflationSensitivity: p.difficulty === 'hard' ? 0.7 : 0.5,
        minCriticalCoverage: 1,
      },
      evolutionHooks: p.evolutionHooks,
    },
  }
}

/** Shared investment menu used across many tracks (with domain-specific extras added per base). */
export function coreInvestments(hints: {
  pay?: string
  order?: string
  db?: string
  notify?: string
}): BudgetInvestment[] {
  const pay = hints.pay ?? 'PaymentService'
  const order = hints.order ?? 'OrderService'
  const db = hints.db ?? 'Database'
  const notify = hints.notify ?? 'NotificationService'
  return [
    inv({
      id: 'pay-abs',
      label: 'Payment Abstraction',
      category: 'extensibility',
      cost: 2,
      summary: 'Introduce a gateway boundary so providers can swap.',
      tags: ['payment', 'extensibility', 'checkout'],
      benefits: ['Swap providers without rewriting callers', 'Clear module boundary'],
      complexities: ['Extra interface + adapters'],
      risks: ['Over-abstraction if one provider forever'],
      appliesToHints: [pay, order],
    }),
    inv({
      id: 'pay-ifelse',
      label: 'Payment if/else',
      category: 'extensibility',
      cost: 1,
      summary: 'Quick branch on provider string.',
      tags: ['payment', 'extensibility'],
      benefits: ['Ships in a day'],
      complexities: ['Branches multiply'],
      risks: ['Unmaintainable past 2 providers'],
      appliesToHints: [pay],
      cheapHackOf: 'pay-abs',
    }),
    inv({
      id: 'cache',
      label: 'Caching Layer',
      category: 'scalability',
      cost: 2,
      summary: 'Cache hot reads.',
      tags: ['cache', 'scalability', 'db-load', 'latency'],
      benefits: ['↓ DB load', '↓ Read latency'],
      complexities: ['Invalidation'],
      risks: ['Stale data'],
      appliesToHints: [order, db],
    }),
    inv({
      id: 'queue',
      label: 'Message Queue',
      category: 'scalability',
      cost: 3,
      summary: 'Async handoff for non-critical side effects.',
      tags: ['queue', 'scalability', 'notifications', 'reliability'],
      benefits: ['Decouple side effects', 'Absorb spikes'],
      complexities: ['Broker ops', 'At-least-once'],
      risks: ['Duplicate processing'],
      appliesToHints: [order, notify],
    }),
    inv({
      id: 'db-replica',
      label: 'Database Replication',
      category: 'scalability',
      cost: 4,
      summary: 'Read replicas for heavy reads.',
      tags: ['db-load', 'scalability', 'reporting'],
      benefits: ['Offload primary', 'Reporting isolation'],
      complexities: ['Replication lag'],
      risks: ['Stale reads'],
      appliesToHints: [db],
    }),
    inv({
      id: 'circuit',
      label: 'Retry / Circuit Breaker',
      category: 'reliability',
      cost: 2,
      summary: 'Timeouts, retries, breakers around flaky deps.',
      tags: ['reliability', 'checkout', 'payment'],
      benefits: ['Survive flaky deps', 'Fail fast'],
      complexities: ['Tuning'],
      risks: ['Retry storms'],
      appliesToHints: [pay, order],
    }),
    inv({
      id: 'idempotency',
      label: 'Idempotency Keys',
      category: 'reliability',
      cost: 2,
      summary: 'Deduplicate retries on write paths.',
      tags: ['reliability', 'checkout', 'payment', 'idempotency'],
      benefits: ['Safe retries', 'No double charge'],
      complexities: ['Key store TTL'],
      risks: ['Key collision mishandling'],
      appliesToHints: [pay, order],
    }),
    inv({
      id: 'observability',
      label: 'Metrics + Tracing',
      category: 'observability',
      cost: 2,
      summary: 'SLIs, dashboards, distributed traces.',
      tags: ['observability', 'reliability', 'latency'],
      benefits: ['Find bottlenecks', 'Incident MTTR ↓'],
      complexities: ['Instrumentation debt'],
      risks: ['Noise without ownership'],
      appliesToHints: [order],
    }),
    inv({
      id: 'notify-svc',
      label: 'Notification Service',
      category: 'maintainability',
      cost: 2,
      summary: 'Extract notifications behind a boundary.',
      tags: ['notifications', 'maintainability'],
      benefits: ['Clear ownership', 'Channel plugins'],
      complexities: ['Another deployable'],
      risks: ['Premature split'],
      appliesToHints: [order, notify],
    }),
    inv({
      id: 'event-bus',
      label: 'Domain Event Bus',
      category: 'extensibility',
      cost: 4,
      summary: 'Publish domain events for lifecycle consumers.',
      tags: ['events', 'extensibility', 'scalability'],
      benefits: ['Loose coupling', 'Easy new consumers'],
      complexities: ['Schema evolution'],
      risks: ['Overengineering early'],
      appliesToHints: [order],
    }),
    inv({
      id: 'svc-extract',
      label: 'Service Extraction',
      category: 'maintainability',
      cost: 3,
      summary: 'Split a coarse module into deployables.',
      tags: ['maintainability', 'team'],
      benefits: ['Team autonomy'],
      complexities: ['Distributed tx'],
      risks: ['Distributed monolith'],
      appliesToHints: [order],
    }),
    inv({
      id: 'rate-limit',
      label: 'Rate Limiting',
      category: 'reliability',
      cost: 2,
      summary: 'Protect hot endpoints from abuse / stampede.',
      tags: ['reliability', 'scalability', 'abuse'],
      benefits: ['Protect capacity', 'Fair use'],
      complexities: ['Policy design'],
      risks: ['False positives'],
      appliesToHints: [order],
    }),
  ]
}

export interface BudgetBaseTrack {
  key: string
  title: string
  tags: string[]
  description: string
  briefing: string
  scenario: string
  diagram: { nodes: ReturnType<typeof node>[]; edges: ReturnType<typeof edge>[] }
  /** Shared catalog — difficulty variants may filter or reuse */
  investments: BudgetInvestment[]
  /** Base priorities / pressures / stages; expanders tighten for harder tiers */
  priorities: BudgetPriority[]
  pressures: BudgetPressure[]
  stages: BudgetStage[]
  constraints?: BudgetConstraints
  budgetKind?: BudgetKind
  unitLabel?: string
  /** Optional overrides per difficulty */
  easy?: Partial<DifficultyOverride>
  medium?: Partial<DifficultyOverride>
  hard?: Partial<DifficultyOverride>
}

interface DifficultyOverride {
  budgetTotal: number
  suggestedReserve: number
  priorities: BudgetPriority[]
  pressures: BudgetPressure[]
  stages: BudgetStage[]
  investments: BudgetInvestment[]
  constraints: BudgetConstraints
  difficultyMode: BudgetDifficultyMode
  titleSuffix: string
}

function defaultsFor(
  difficulty: 'easy' | 'medium' | 'hard',
  base: BudgetBaseTrack,
): DifficultyOverride {
  if (difficulty === 'easy') {
    return {
      budgetTotal: 12,
      suggestedReserve: 2,
      priorities: base.priorities.map((p, i) =>
        i === 0 ? { ...p, weight: 'critical' as const } : { ...p, weight: p.weight === 'critical' ? 'high' : p.weight },
      ),
      pressures: base.pressures.slice(0, Math.min(3, base.pressures.length)).map(pr =>
        pr.severity === 'critical' ? { ...pr, severity: 'high' as const } : pr,
      ),
      stages: base.stages.slice(0, Math.min(2, base.stages.length)),
      investments: base.investments.filter(i => !i.cheapHackOf).slice(0, 8).concat(
        base.investments.filter(i => i.cheapHackOf).slice(0, 1),
      ),
      constraints: base.constraints ?? {
        maxNewClasses: 4,
        maxExternalSystems: 2,
        teamSize: 5,
        deadlineDays: 30,
        maxNewAbstractions: 3,
      },
      difficultyMode: 'beginner',
      titleSuffix: ' (Starter Budget)',
      ...base.easy,
    }
  }
  if (difficulty === 'medium') {
    return {
      budgetTotal: 8,
      suggestedReserve: 2,
      priorities: base.priorities,
      pressures: base.pressures,
      stages: base.stages.slice(0, Math.min(3, base.stages.length)),
      investments: base.investments,
      constraints: base.constraints ?? {
        maxNewClasses: 3,
        maxExternalSystems: 1,
        teamSize: 4,
        deadlineDays: 21,
        maxNewAbstractions: 2,
      },
      difficultyMode: 'intermediate',
      titleSuffix: ' (Scarce Points)',
      ...base.medium,
    }
  }
  return {
    budgetTotal: 6,
    suggestedReserve: 1,
    priorities: base.priorities.map((p, i) =>
      i < 2 ? { ...p, weight: 'critical' as const } : p,
    ),
    pressures: base.pressures.map(pr =>
      pr.severity === 'low' ? { ...pr, severity: 'medium' as const } : pr,
    ),
    stages: base.stages,
    investments: base.investments,
    constraints: {
      maxNewClasses: 2,
      maxExternalSystems: 1,
      teamSize: 3,
      deadlineDays: 14,
      maxNewAbstractions: 2,
      ...(base.constraints ?? {}),
      ...(base.hard?.constraints ?? {}),
    },
    difficultyMode: 'advanced',
    titleSuffix: ' (Crisis Allocation)',
    ...base.hard,
  }
}

export function expandBaseToPacks(base: BudgetBaseTrack, orderStart: number): BudgetPackSeed[] {
  const diffs: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
  return diffs.map((difficulty, i) => {
    const d = defaultsFor(difficulty, base)
    const kind = base.budgetKind ?? 'points'
    const unit =
      base.unitLabel ??
      (kind === 'engineer_days'
        ? 'Engineer-Days'
        : kind === 'infra_usd'
          ? '$/mo'
          : kind === 'time_days'
            ? 'Days'
            : 'Architecture Points')
    return budgetPack({
      slug: `bud2-${base.key}-${difficulty}`,
      title: `${base.title}${d.titleSuffix}`,
      difficulty,
      description: base.description,
      order: orderStart + i,
      tags: [...base.tags, 'budget', difficulty],
      nodes: base.diagram.nodes,
      edges: base.diagram.edges,
      briefing: base.briefing,
      scenario: base.scenario,
      budget: {
        kind,
        total: d.budgetTotal,
        reserveAllowed: true,
        unitLabel: unit,
      },
      suggestedReserve: d.suggestedReserve,
      priorities: d.priorities,
      pressures: d.pressures,
      investments: d.investments,
      stages: d.stages,
      constraints: d.constraints,
      difficultyMode: d.difficultyMode,
    })
  })
}

/** 34 bases × 3 → 102 packs, orders 700–801. */
export function expandAllBases(bases: BudgetBaseTrack[]): BudgetPackSeed[] {
  const out: BudgetPackSeed[] = []
  let order = 700
  for (const base of bases) {
    out.push(...expandBaseToPacks(base, order))
    order += 3
  }
  return out
}

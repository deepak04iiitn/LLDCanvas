/** Design-analysis rule engine — types */

export type RuleStatus = 'pass' | 'fail' | 'warn' | 'na'

export type Severity = 'critical' | 'major' | 'minor' | 'info'

export type RuleCategory =
  | 'uml'
  | 'structure'
  | 'relationships'
  | 'solid'
  | 'naming'
  | 'extensibility'

export type RuleKind = 'mandatory' | 'recommended' | 'optional'

export interface AffectedElement {
  id: string
  kind: 'node' | 'edge'
  label: string
}

export interface RuleFinding {
  ruleId: string
  status: RuleStatus
  severity: Severity
  title: string
  message: string
  why: string
  howToFix: string
  affectedElements: AffectedElement[]
  /** Deduplicate penalties sharing the same underlying issue */
  groupKey?: string
  category: RuleCategory
  scoreImpact: number
}

export interface DesignRule {
  id: string
  title: string
  description: string
  category: RuleCategory
  severity: Severity
  kind: RuleKind
  /** Base weight used when failing (warns use ~40%) */
  weight: number
  whyItMatters: string
  howToFix: string
  evaluate: (facts: GraphFacts) => RuleFinding[]
}

export interface FactNode {
  id: string
  name: string
  nodeType: string
  stereotype?: string
  packageName?: string
  attributeCount: number
  methodCount: number
  publicMethodCount: number
  isEmpty: boolean
  noteText?: string
}

export interface FactEdge {
  id: string
  source: string
  target: string
  relationshipType: string
  sourceMultiplicity?: string
  targetMultiplicity?: string
  label?: string
}

export interface GraphFacts {
  revisionId: string
  nodes: FactNode[]
  edges: FactEdge[]
  typeNodes: FactNode[]
  noteNodes: FactNode[]
  byId: Record<string, FactNode>
  inDegree: Record<string, number>
  outDegree: Record<string, number>
  inbound: Record<string, FactEdge[]>
  outbound: Record<string, FactEdge[]>
  cycles: string[][]
  inheritanceChildren: Record<string, string[]>
  inheritanceParents: Record<string, string[]>
  realizations: { classId: string; interfaceId: string; edgeId: string }[]
  interfaces: FactNode[]
  concretes: FactNode[]
}

export interface CategoryScore {
  category: RuleCategory
  label: string
  score: number
  max: number
  applicable: number
  failed: number
  warned: number
  passed: number
}

export interface AnalysisReport {
  rulesetVersion: string
  revisionId: string
  overallScore: number
  findings: RuleFinding[]
  strengths: RuleFinding[]
  weaknesses: RuleFinding[]
  recommendations: RuleFinding[]
  categories: CategoryScore[]
  summary: {
    nodeCount: number
    edgeCount: number
    typeCount: number
    applicableRules: number
    failed: number
    warned: number
    passed: number
    na: number
  }
  stale?: boolean
}

export interface DiagramInput {
  nodes: unknown[]
  edges: unknown[]
}

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  uml: 'UML correctness',
  structure: 'Structure',
  relationships: 'Relationships',
  solid: 'SOLID (heuristic)',
  naming: 'Naming & modeling',
  extensibility: 'Extensibility',
}

export const SEVERITY_FAIL_WEIGHT: Record<Severity, number> = {
  critical: 15,
  major: 8,
  minor: 3,
  info: 1,
}

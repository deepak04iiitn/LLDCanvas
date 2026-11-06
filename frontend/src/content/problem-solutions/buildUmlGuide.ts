import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import type { EntitySpec, ProblemSolution, ProseSection } from './types'

type NodeKind = 'class' | 'interface' | 'abstract-class' | 'enum' | 'note' | 'unknown'

type UmlMember = {
  visibility?: string
  name: string
  type?: string
  params?: string
  returnType?: string
  isStatic?: boolean
  isAbstract?: boolean
  isConstructor?: boolean
}

type UmlNode = {
  id: string
  kind: NodeKind
  name: string
  stereotype?: string
  attributes: UmlMember[]
  methods: UmlMember[]
  enumValues: string[]
}

type UmlEdge = {
  id: string
  source: string
  target: string
  type: string
  label?: string
  sourceMultiplicity?: string
  targetMultiplicity?: string
}

const REL_PLAIN: Record<string, { title: string; meaning: string }> = {
  composition: {
    title: 'Composition (filled diamond)',
    meaning:
      'Strong ownership. The child object lives inside the parent and is created/destroyed with it. In code this is usually a field that holds instances the parent constructs.',
  },
  aggregation: {
    title: 'Aggregation (empty diamond)',
    meaning:
      'Shared or injected ownership. The parent uses the child, but the child can exist on its own (often passed into a constructor).',
  },
  inheritance: {
    title: 'Inheritance (hollow triangle)',
    meaning:
      'An "is-a" relationship. The child class reuses and specializes the parent. In code: extends / subclass.',
  },
  realization: {
    title: 'Realization / implementation (dashed triangle)',
    meaning:
      'A concrete class promises to fulfill an interface (or abstract contract). In code: implements / protocol conformance.',
  },
  association: {
    title: 'Association (solid line)',
    meaning:
      'A lasting "knows about" link. One class holds a reference to another so it can call methods or read data over time.',
  },
  dependency: {
    title: 'Dependency (dashed arrow)',
    meaning:
      'A short-lived "uses" link. Often means creates, returns, or temporarily needs the other type without storing it as a long-lived field.',
  },
  bidirectional: {
    title: 'Bidirectional association',
    meaning:
      'Both sides know about each other. Useful when navigation goes both ways, but keep updates consistent on both ends.',
  },
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

function parseNodes(uml: DebuggerDiagram): UmlNode[] {
  return (uml.nodes ?? []).map((raw, i) => {
    const n = asRecord(raw)
    const data = asRecord(n.data)
    const kind = String(data.nodeType ?? n.type ?? 'unknown') as NodeKind
    const attrsRaw = Array.isArray(data.attributes) ? data.attributes : []
    const methodsRaw = Array.isArray(data.methods) ? data.methods : []
    const attributes = attrsRaw.map(a => {
      const o = asRecord(a)
      return {
        visibility: String(o.visibility ?? '-'),
        name: String(o.name ?? ''),
        type: String(o.type ?? ''),
        isStatic: Boolean(o.isStatic),
      }
    })
    const methods = methodsRaw.map(m => {
      const o = asRecord(m)
      return {
        visibility: String(o.visibility ?? '+'),
        name: String(o.name ?? ''),
        params: String(o.params ?? ''),
        returnType: String(o.returnType ?? 'void'),
        isStatic: Boolean(o.isStatic),
        isAbstract: Boolean(o.isAbstract),
        isConstructor: Boolean(o.isConstructor),
      }
    })
    const enumValues =
      kind === 'enum'
        ? attributes.map(a => a.name).filter(Boolean)
        : []
    return {
      id: String(n.id ?? `n${i}`),
      kind,
      name: String(data.name ?? 'Unknown'),
      stereotype: typeof data.stereotype === 'string' ? data.stereotype : undefined,
      attributes: kind === 'enum' ? [] : attributes,
      methods,
      enumValues,
    }
  })
}

function parseEdges(uml: DebuggerDiagram): UmlEdge[] {
  return (uml.edges ?? []).map((raw, i) => {
    const e = asRecord(raw)
    const data = asRecord(e.data)
    return {
      id: String(e.id ?? `e${i}`),
      source: String(e.source ?? ''),
      target: String(e.target ?? ''),
      type: String(data.relationshipType ?? e.type ?? 'association'),
      label: typeof data.label === 'string' ? data.label : undefined,
      sourceMultiplicity:
        typeof data.sourceMultiplicity === 'string' ? data.sourceMultiplicity : undefined,
      targetMultiplicity:
        typeof data.targetMultiplicity === 'string' ? data.targetMultiplicity : undefined,
    }
  })
}

function responsibilityMap(entities: EntitySpec[] | undefined): Map<string, EntitySpec> {
  const map = new Map<string, EntitySpec>()
  for (const e of entities ?? []) {
    map.set(e.name.toLowerCase(), e)
    // Allow "FeeCalculator / HourlyFeeCalculator" style combined names
    for (const part of e.name.split('/')) {
      map.set(part.trim().toLowerCase(), e)
    }
  }
  return map
}

function findResponsibility(name: string, map: Map<string, EntitySpec>): string | undefined {
  return map.get(name.toLowerCase())?.responsibility
}

function article(name: string): string {
  return /^[aeiou]/i.test(name) ? 'an' : 'a'
}

function humanType(type: string): string {
  const t = type.trim()
  if (!t) return 'an unspecified type'
  if (/^list</i.test(t) || /^array</i.test(t) || t.endsWith('[]')) {
    const inner = t.replace(/^list</i, '').replace(/^array</i, '').replace(/>$/, '').replace(/\[\]$/, '')
    return `a list (ordered collection) of ${inner || 'items'}`
  }
  if (/^map</i.test(t) || /^dict</i.test(t) || /^dictionary</i.test(t)) {
    return `a lookup map (${t}) that finds a value from a key`
  }
  if (/^set</i.test(t)) return `a set of unique ${t.replace(/^set</i, '').replace(/>$/, '') || 'values'}`
  if (/^optional</i.test(t) || t.endsWith('?')) return `an optional ${t.replace(/\?$/, '').replace(/^optional</i, '').replace(/>$/i, '')}`
  if (/^(bool|boolean)$/i.test(t)) return 'a true/false flag'
  if (/^(int|long|short|byte|number|float|double|decimal|bigint)$/i.test(t)) return `a numeric ${t} value`
  if (/^(string|str)$/i.test(t)) return 'a text string'
  if (/^(datetime|date|time|instant|timestamp)$/i.test(t)) return 'a date/time value'
  if (/lock|mutex|rwlock/i.test(t)) return 'a lock used to make updates thread-safe'
  return `a ${t}`
}

function explainAttribute(
  attr: UmlMember,
  owner: UmlNode,
  problemTitle: string,
  byId: Map<string, UmlNode>,
  edges: UmlEdge[],
): string {
  const name = attr.name
  const type = attr.type ?? ''
  const lower = name.toLowerCase()
  const vis =
    attr.visibility === '+'
      ? 'public'
      : attr.visibility === '#'
        ? 'protected'
        : attr.visibility === '~'
          ? 'package'
          : 'private'

  let why = `Stores ${humanType(type)} for this ${owner.kind === 'interface' ? 'contract' : 'object'}.`

  if (/^(id|uuid|key)$/i.test(name) || /id$/i.test(name)) {
    why = `Unique identity for this ${owner.name}. Other objects and maps use it to find the right instance during ${problemTitle} flows.`
  } else if (/name|title|label|plate|sku|code|symbol/i.test(lower)) {
    why = `Human-readable (or business) identifier shown in logs, receipts, or UI for ${problemTitle}.`
  } else if (/password|pin|secret|token/i.test(lower)) {
    why = `Sensitive credential data. Kept on ${owner.name} so authentication logic has one place to check it.`
  } else if (/status|state|phase|stage/i.test(lower)) {
    why = `Current lifecycle state of the ${owner.name}. Methods consult it before allowing the next action.`
  } else if (/count|size|capacity|quantity|qty|balance|amount|price|fee|rate|score|level/i.test(lower)) {
    why = `Numeric field used in rules and calculations for ${problemTitle} (availability, pricing, limits, or scoring).`
  } else if (/time|date|at$|until|since|duration|minutes|seconds/i.test(lower)) {
    why = `Time-related data used to order events, compute duration, or enforce windows in ${problemTitle}.`
  } else if (/lock|mutex/i.test(lower)) {
    why = `Concurrency control. Public methods on ${owner.name} take this lock so two threads cannot corrupt shared state.`
  } else if (/^(active|occupied|available|open|closed|enabled|disabled|valid|dirty|full|empty)/i.test(lower) || type.match(/bool/i)) {
    why = `Boolean flag that records a yes/no fact methods check before mutating related state.`
  } else if (/list|map|set|dict|collection|queue|stack|[]/i.test(type) || /s$/.test(name)) {
    const related = edges.filter(e => e.source === owner.id || e.target === owner.id)
    const childHint = related
      .map(e => {
        const otherId = e.source === owner.id ? e.target : e.source
        return byId.get(otherId)?.name
      })
      .filter(Boolean)[0]
    why = childHint
      ? `Holds the collection of related ${childHint} objects this ${owner.name} manages for ${problemTitle}.`
      : `Collection field that ${owner.name} owns or indexes while serving ${problemTitle} requests.`
  }

  const used = `Read and written by ${owner.name}'s methods` +
    (owner.methods.length
      ? ` (for example ${owner.methods
          .slice(0, 3)
          .map(m => m.name)
          .join(', ')})`
      : '') +
    `. In the Code tab, look for the matching field on class ${owner.name}.`

  return `${vis} ${name}: ${type || '-'}: ${why} ${used}`
}

function explainMethod(
  method: UmlMember,
  owner: UmlNode,
  problemTitle: string,
  callers: string[],
): string {
  const name = method.name
  const params = method.params?.trim() || 'none'
  const ret = method.returnType?.trim() || 'void'
  const lower = name.toLowerCase()
  const isCtor =
    method.isConstructor ||
    lower === 'constructor' ||
    lower === '__init__' ||
    lower === owner.name.toLowerCase() ||
    lower === `new${owner.name.toLowerCase()}`

  let what: string
  if (isCtor) {
    what = `Constructor: creates a new ${owner.name}, stores the given arguments into fields, and leaves the object ready for ${problemTitle} use.`
  } else if (lower.startsWith('get') || lower.startsWith('is') || lower.startsWith('has') || lower.startsWith('can')) {
    what = `Query method: answers a question about ${owner.name} without (ideally) changing its core identity. Returns ${ret}.`
  } else if (lower.startsWith('set') || lower.startsWith('update')) {
    what = `Mutator: updates one or more fields on ${owner.name} after validating the new values.`
  } else if (/find|search|lookup|get|fetch|locate|nearest|match/i.test(lower)) {
    what = `Lookup helper: searches inside ${owner.name}'s data and returns ${ret || 'a match'} for callers in the ${problemTitle} flow.`
  } else if (/add|create|insert|register|park|book|reserve|place|push|enqueue|submit|post|publish/i.test(lower)) {
    what = `Write path: adds or registers something through ${owner.name}. Central to how ${problemTitle} records new work.`
  } else if (/remove|delete|cancel|exit|release|free|pop|dequeue|evict|close|shutdown/i.test(lower)) {
    what = `Cleanup / exit path: undoes or finishes something owned by ${owner.name}, freeing resources or closing a lifecycle.`
  } else if (/calc|compute|charge|price|fee|total|score|evaluate/i.test(lower)) {
    what = `Calculation: turns stored state (and parameters) into a derived result (${ret}) used by ${problemTitle} rules.`
  } else if (/validate|check|ensure|assert|verify/i.test(lower)) {
    what = `Guard: verifies invariants and fails fast when input or state is illegal.`
  } else if (/start|stop|run|execute|process|handle|on[A-Z]/i.test(name)) {
    what = `Behavior entry point: performs a step of the ${problemTitle} workflow on behalf of callers.`
  } else {
    what = `Operation on ${owner.name}: takes (${params}) and returns ${ret}. Part of how this type contributes to ${problemTitle}.`
  }

  if (method.isAbstract) {
    what += ' Marked abstract: subclasses or implementors must provide the body.'
  }
  if (method.isStatic) {
    what += ' Static: called on the type itself, not on one instance.'
  }

  const who =
    callers.length > 0
      ? `Typically reached from ${callers.join(', ')} (see relationships and the demo main in Code).`
      : `Called from the demo main or from collaborating classes in the Code section.`

  return `${name}(${params}) -> ${ret}: ${what} ${who}`
}

function kindLabel(kind: NodeKind): string {
  switch (kind) {
    case 'interface':
      return 'Interface'
    case 'abstract-class':
      return 'Abstract class'
    case 'enum':
      return 'Enum'
    case 'class':
      return 'Class'
    default:
      return 'Type'
  }
}

function defaultPurpose(node: UmlNode, problemTitle: string, edges: UmlEdge[], byId: Map<string, UmlNode>): string {
  const outs = edges.filter(e => e.source === node.id)
  const ins = edges.filter(e => e.target === node.id)
  if (node.kind === 'interface') {
    return `Defines a small contract of methods that ${problemTitle} can swap without rewriting callers. Concrete classes realize (implement) this interface.`
  }
  if (node.kind === 'abstract-class') {
    return `Partial implementation shared by subclasses in ${problemTitle}. It holds common fields/methods and leaves specialized steps abstract.`
  }
  if (node.kind === 'enum') {
    return `Closed list of named constants used as safe alternatives to magic strings in ${problemTitle}.`
  }
  if (ins.some(e => e.type === 'realization') || outs.some(e => e.type === 'realization')) {
    return `Concrete worker in ${problemTitle} that fulfills an interface so pricing, strategy, or IO can change behind a stable method list.`
  }
  if (outs.some(e => e.type === 'composition') && outs.length >= 2) {
    return `Coordinator / facade for ${problemTitle}: owns key parts of the model and exposes the main API other code should call.`
  }
  if (outs.some(e => e.type === 'composition')) {
    const child = byId.get(outs.find(e => e.type === 'composition')!.target)
    return `Owns and manages ${child?.name ?? 'child'} instances for ${problemTitle}, hiding list/map details behind clear methods.`
  }
  if (!outs.length && ins.length) {
    return `Supporting value/entity type in ${problemTitle}. Other classes hold or create it; it focuses on its own data and small helpers.`
  }
  return `Models one clear responsibility inside ${problemTitle}. Keep its job narrow so changes stay local.`
}

function likelyCallers(node: UmlNode, edges: UmlEdge[], byId: Map<string, UmlNode>): string[] {
  const names: string[] = []
  for (const e of edges) {
    if (e.target === node.id || e.source === node.id) {
      const other = byId.get(e.source === node.id ? e.target : e.source)
      if (other && other.id !== node.id) names.push(other.name)
    }
  }
  return [...new Set(names)].slice(0, 6)
}

function buildClassSection(
  node: UmlNode,
  problemTitle: string,
  resp: string | undefined,
  edges: UmlEdge[],
  byId: Map<string, UmlNode>,
): ProseSection {
  const purpose = plainDash(resp ?? defaultPurpose(node, problemTitle, edges, byId))
  const callers = likelyCallers(node, edges, byId)
  const paragraphs = [
    `${kindLabel(node.kind)} ${node.name} is ${article(node.name)} ${node.kind.replace('-', ' ')} in the ${problemTitle} design.${
      node.stereotype ? ` Stereotype «${node.stereotype}» hints at an extra role (for example singleton or repository).` : ''
    }`,
    `Purpose: ${purpose}`,
    `Why it exists: without ${node.name}, some rule or piece of data for ${problemTitle} would be scattered across unrelated classes. Keeping it here makes the UML (and the Code tab) easier to navigate.`,
  ]

  const bullets: string[] = []
  if (node.attributes.length) {
    bullets.push('Attributes (fields): what this type remembers:')
    for (const a of node.attributes) {
      bullets.push(explainAttribute(a, node, problemTitle, byId, edges))
    }
  } else if (node.kind === 'class' || node.kind === 'abstract-class') {
    bullets.push(
      'Attributes: none shown on the diagram. This type is either a pure behavior helper or keeps state only inside method-local variables / composed children.',
    )
  }

  if (node.methods.length) {
    bullets.push('Methods (operations): what this type can do:')
    for (const m of node.methods) {
      bullets.push(explainMethod(m, node, problemTitle, callers))
    }
  } else if (node.kind !== 'enum') {
    bullets.push(
      'Methods: none listed on the diagram. Treat it as a data carrier (DTO/entity) whose behavior lives on collaborating services, or open the Code tab for getters the UML omitted.',
    )
  }

  const table =
    node.attributes.length || node.methods.length
      ? {
          headers: ['Member', 'Kind', 'Detail'],
          rows: [
            ...node.attributes.map(a => [
              `${a.visibility ?? '-'}${a.name}`,
              'attribute',
              a.type || '-',
            ]),
            ...node.methods.map(m => [
              `${m.visibility ?? '+'}${m.name}()`,
              m.isConstructor ? 'constructor' : 'method',
              `(${m.params || ''}) -> ${m.returnType || 'void'}`,
            ]),
          ],
        }
      : undefined

  return {
    heading: `${kindLabel(node.kind)}: ${node.name}`,
    paragraphs,
    bullets,
    table,
    callout: {
      title: 'Map to code',
      body: `In the Code section, find ${node.kind === 'interface' ? 'interface' : 'class'} ${node.name}. Matching field and method names should line up with this UML box so you can jump between diagram and implementation while you learn.`,
    },
  }
}

function explainEnumValue(enumName: string, value: string, problemTitle: string): string {
  const v = value.toUpperCase()
  const pretty = value.replace(/_/g, ' ').toLowerCase()
  const hints: [RegExp, string][] = [
    [/MOTORCYCLE|BIKE|SCOOTER/, 'a two-wheeler / small vehicle case used in fit rules and (often) cheaper rates'],
    [/COMPACT|CAR|SEDAN|AUTO/, 'a standard car-sized case for assignment and pricing'],
    [/LARGE|BUS|TRUCK|SUV|VAN/, 'a large vehicle or large bay case that needs more space'],
    [/PENDING|CREATED|INIT|DRAFT/, 'not finished yet; waiting for the next successful action'],
    [/ACTIVE|OPEN|RUNNING|IN_PROGRESS|OCCUPIED|RESERVED|BOOKED|CONFIRMED/, 'currently live / in use in the workflow'],
    [/COMPLETED|DONE|CLOSED|PAID|SUCCESS|SETTLED|EXITED/, 'finished successfully; usually immutable afterward'],
    [/CANCELLED|CANCELED|FAILED|REJECTED|EXPIRED|VOID/, 'stopped early or rejected; should not continue the happy path'],
    [/ADMIN|USER|GUEST|OWNER|DRIVER|CUSTOMER|MEMBER/, `a role identity used for permissions inside ${problemTitle}`],
    [/CREDIT|DEBIT|REFUND/, 'a money-movement direction'],
    [/NORTH|SOUTH|EAST|WEST|UP|DOWN|LEFT|RIGHT/, 'a direction used by movement or layout logic'],
  ]
  for (const [re, meaning] of hints) {
    if (re.test(v)) {
      return `${value}: ${meaning}. Appears wherever code stores or compares ${enumName} during ${problemTitle}.`
    }
  }
  return `${value}: the "${pretty}" option of ${enumName}. Domain rules for ${problemTitle} treat this as a distinct legal case (switch/lookup), not a free-form string.`
}

function buildEnumSection(node: UmlNode, problemTitle: string): ProseSection {
  const values = node.enumValues.length ? node.enumValues : node.attributes.map(a => a.name)
  return {
    heading: `Enum: ${node.name}`,
    paragraphs: [
      `Enum ${node.name} is a fixed menu of named options for ${problemTitle}. Using an enum is safer than raw strings because the compiler (or type checker) catches typos and invalid values.`,
      `Each value below is one legal choice. Domain rules (fit checks, pricing, status transitions) usually switch or look up behavior based on these values.`,
    ],
    bullets: values.map(v => explainEnumValue(node.name, v, problemTitle)),
    table: {
      headers: ['Value', 'Meaning in this problem'],
      rows: values.map(v => [v, explainEnumValue(node.name, v, problemTitle)]),
    },
    callout: {
      title: 'Map to code',
      body: `In code this appears as an enum (Java/C#/TS), IntEnum/Enum (Python), or const block (Go). Search for ${node.name} and the value names above.`,
    },
  }
}

function buildRelationshipSection(
  edges: UmlEdge[],
  byId: Map<string, UmlNode>,
  problemTitle: string,
): ProseSection {
  if (!edges.length) {
    return {
      heading: 'Relationships between types',
      paragraphs: [
        `This diagram focuses on the types themselves. Collaboration still happens in code through parameters and return values even when relationship lines are sparse.`,
      ],
    }
  }

  const bullets = edges.map(e => {
    const from = byId.get(e.source)?.name ?? e.source
    const to = byId.get(e.target)?.name ?? e.target
    const meta = REL_PLAIN[e.type] ?? {
      title: e.type,
      meaning: 'A structural link between the two types.',
    }
    const mult = [e.sourceMultiplicity, e.targetMultiplicity].filter(Boolean).join(' -> ')
    const label = e.label ? ` Label: "${e.label}".` : ''
    const multText = mult ? ` Multiplicity ${mult} tells you how many ${to} objects one ${from} may know.` : ''
    return `${from} -> ${to} (${meta.title}). ${meta.meaning}${label}${multText} In ${problemTitle}, this is how ${from} collaborates with ${to}.`
  })

  return {
    heading: 'Relationships between types',
    paragraphs: [
      'Lines on a class diagram are not decoration. Each line answers: who knows whom, who owns whom, and who only depends briefly on whom.',
      `Below, every relationship drawn for ${problemTitle} is explained in plain language so you can redraw it from memory in an interview.`,
    ],
    bullets,
    table: {
      headers: ['From', 'To', 'Type', 'Label / multiplicity'],
      rows: edges.map(e => [
        byId.get(e.source)?.name ?? e.source,
        byId.get(e.target)?.name ?? e.target,
        e.type,
        [e.label, e.sourceMultiplicity, e.targetMultiplicity].filter(Boolean).join(' / ') || '-',
      ]),
    },
  }
}

function buildInterfaceOverview(
  nodes: UmlNode[],
  edges: UmlEdge[],
  byId: Map<string, UmlNode>,
  problemTitle: string,
): ProseSection | null {
  const ifaces = nodes.filter(n => n.kind === 'interface' || n.kind === 'abstract-class')
  if (!ifaces.length) return null
  return {
    heading: 'Interfaces and abstract classes',
    paragraphs: [
      `Interfaces and abstract classes exist so ${problemTitle} can depend on a stable set of method names while swapping the concrete policy underneath (pricing, storage, notification, strategy, and so on).`,
      'Interface = method signatures only (a contract). Abstract class = shared fields/methods plus some unfinished methods subclasses must complete. Prefer a small interface when you only need to swap behavior.',
    ],
    bullets: ifaces.map(n => {
      const implementors = edges
        .filter(e => e.type === 'realization' && e.target === n.id)
        .map(e => byId.get(e.source)?.name ?? e.source)
      const extenders = edges
        .filter(e => e.type === 'inheritance' && e.target === n.id)
        .map(e => byId.get(e.source)?.name ?? e.source)
      const who = [...implementors, ...extenders]
      return `${n.name} (${kindLabel(n.kind)}): methods: ${
        n.methods.map(m => m.name).join(', ') || 'see diagram'
      }. ${
        who.length
          ? `Implemented/extended by: ${who.join(', ')}.`
          : 'Look for dashed realization or solid inheritance arrows into this box.'
      }`
    }),
  }
}

/**
 * Build a beginner-friendly, exhaustive UML walkthrough from diagram data +
 * optional class responsibility blurbs already authored on the solution.
 */
export function buildUmlGuide(solution: {
  title: string
  slug?: string
  uml: DebuggerDiagram
  umlCaption?: string
  designExplanation?: { classResponsibilities?: EntitySpec[] }
  interviewApproach?: { entities?: EntitySpec[] }
}): NonNullable<ProblemSolution['umlGuide']> {
  const problemTitle = plainDash(solution.title || solution.slug || 'this problem')
  const nodes = parseNodes(solution.uml).filter(n => n.kind !== 'note' && n.name)
  const edges = parseEdges(solution.uml)
  const byId = new Map(nodes.map(n => [n.id, n]))
  const resp = responsibilityMap([
    ...(solution.designExplanation?.classResponsibilities ?? []),
    ...(solution.interviewApproach?.entities ?? []),
  ])

  const classes = nodes.filter(n => n.kind === 'class' || n.kind === 'abstract-class' || n.kind === 'interface')
  const enums = nodes.filter(n => n.kind === 'enum')

  const introduction = [
    `This section is a guided tour of the UML class diagram for ${problemTitle}. We will not skip boxes: every class, interface, abstract type, enum value, field, method, and relationship line is explained in beginner-friendly language.`,
    solution.umlCaption
      ? `Quick orientation: ${plainDash(solution.umlCaption)}`
      : `Start at the type that looks like a facade or system entry (often the largest API surface), then follow composition diamonds outward to owned parts, and dashed lines to strategies or results.`,
    'UML (Unified Modeling Language) is just a shared drawing language for object-oriented design. A box is a type. The top compartment is the name, the middle lists attributes (fields), and the bottom lists methods (functions). Lines show how types collaborate.',
    'As you read, keep the Code tab nearby. Names in this diagram are chosen to match the implementations so each UML idea maps to a real class you can open and run.',
  ]

  const sections: ProseSection[] = [
    {
      heading: 'How to read this diagram',
      paragraphs: [
        '1) Find the entry / coordinator type (the one other systems would call). 2) Follow composition to see what it owns. 3) Follow aggregation or dependency to see plugins and outputs. 4) Read enums connected to fields so you know which values are legal. 5) Only then dive into each method list.',
        `Visibility markers: + public (callable from outside), - private (hidden inside the class), # protected (subclasses), ~ package/internal. Private fields with public methods is normal encapsulation in ${problemTitle}.`,
      ],
      bullets: [
        'Class box: concrete type you can construct.',
        'Interface box («interface»): contract of methods, no (or minimal) stored state.',
        'Abstract class: partial implementation; cannot be constructed alone if still abstract.',
        'Enum box: named constants.',
        'Composition vs aggregation vs association: ownership strength, from strongest to weakest lasting link.',
      ],
    },
    {
      heading: 'Big picture for this problem',
      paragraphs: [
        `The diagram for ${problemTitle} contains ${classes.length} class/interface box(es) and ${enums.length} enum(s), connected by ${edges.length} relationship line(s).`,
        classes.length
          ? `Types present: ${classes.map(c => c.name).join(', ')}${enums.length ? `; enums: ${enums.map(e => e.name).join(', ')}` : ''}.`
          : 'Open the canvas above if boxes failed to load; the walkthrough below still lists every parsed member.',
      ],
      table: {
        headers: ['Type', 'Kind', 'Members shown'],
        rows: nodes.map(n => [
          n.name,
          kindLabel(n.kind),
          n.kind === 'enum'
            ? `${n.enumValues.length || n.attributes.length} values`
            : `${n.attributes.length} attrs, ${n.methods.length} methods`,
        ]),
      },
    },
  ]

  const ifaceOverview = buildInterfaceOverview(nodes, edges, byId, problemTitle)
  if (ifaceOverview) sections.push(ifaceOverview)

  for (const node of classes) {
    sections.push(
      buildClassSection(
        node,
        problemTitle,
        findResponsibility(node.name, resp),
        edges,
        byId,
      ),
    )
  }

  for (const node of enums) {
    sections.push(buildEnumSection(node, problemTitle))
  }

  sections.push(buildRelationshipSection(edges, byId, problemTitle))

  sections.push({
    heading: 'Connecting the UML to the Code tab',
    paragraphs: [
      `Every box above should appear as a type in the Python / Java / TypeScript / C++ / Go / C# implementations for ${problemTitle}. Start with the facade or service class, construct it the way the demo main does, then step through one happy-path call while watching which fields change.`,
      'If a method exists in code but not on the diagram, it is usually a small helper. If a field exists on the diagram but is named slightly differently in one language, trust the role (identity, collection, strategy, timestamp) rather than the exact spelling.',
    ],
    numbered: classes.slice(0, 8).map(
      (c, i) =>
        `Locate ${c.name} in code, list its fields, then call ${
          c.methods[0]?.name ?? 'its public API'
        } from the demo and confirm the Observed log matches the Expected story for step ${i + 1}.`,
    ),
    callout: {
      title: 'Interview tip',
      body: `When an interviewer asks you to explain your UML for ${problemTitle}, narrate in this order: entry class -> owned parts -> strategies/interfaces -> enums -> one end-to-end method trace. That is exactly what this section trains.`,
    },
  })

  return sanitizeUmlGuide({ introduction, sections })
}

/** Replace em/en dashes with ASCII hyphen or keep plain punctuation. */
function plainDash(text: string): string {
  return text
    .replace(/\u2014/g, '-') // em dash
    .replace(/\u2013/g, '-') // en dash
    .replace(/\u2212/g, '-') // minus
    .replace(/\u2192/g, '->') // right arrow
    .replace(/\u00B7/g, '/') // middle dot
}

function sanitizeUmlGuide(guide: NonNullable<ProblemSolution['umlGuide']>): NonNullable<ProblemSolution['umlGuide']> {
  const cleanSection = (s: ProseSection): ProseSection => ({
    ...s,
    heading: s.heading ? plainDash(s.heading) : s.heading,
    paragraphs: (s.paragraphs ?? []).map(plainDash),
    bullets: s.bullets?.map(plainDash),
    numbered: s.numbered?.map(plainDash),
    table: s.table
      ? {
          headers: s.table.headers.map(plainDash),
          rows: s.table.rows.map(row => row.map(plainDash)),
        }
      : undefined,
    callout: s.callout
      ? {
          title: s.callout.title ? plainDash(s.callout.title) : s.callout.title,
          body: plainDash(s.callout.body),
        }
      : undefined,
  })
  return {
    introduction: guide.introduction.map(plainDash),
    sections: guide.sections.map(cleanSection),
  }
}

/** Ensure a solution object always carries a complete umlGuide. */
export function ensureUmlGuide<T extends {
  title: string
  slug?: string
  uml: DebuggerDiagram
  umlCaption?: string
  umlGuide?: ProblemSolution['umlGuide']
  designExplanation?: { classResponsibilities?: EntitySpec[] }
  interviewApproach?: { entities?: EntitySpec[] }
}>(solution: T): T & { umlGuide: NonNullable<ProblemSolution['umlGuide']> } {
  if (solution.umlGuide?.introduction?.length && solution.umlGuide.sections?.length) {
    return {
      ...solution,
      umlGuide: sanitizeUmlGuide(solution.umlGuide),
    } as T & { umlGuide: NonNullable<ProblemSolution['umlGuide']> }
  }
  return { ...solution, umlGuide: buildUmlGuide(solution) }
}

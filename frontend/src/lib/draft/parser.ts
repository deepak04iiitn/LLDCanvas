// ─── Draft Notation Parser ────────────────────────────────────────────────────
// Converts Draft text → a typed AST

export type Visibility = '+' | '-' | '#' | '~'

export interface DraftField {
  name: string
  type?: string
  visibility?: Visibility
  isStatic?: boolean
}

export interface DraftMethod {
  name: string
  params?: string
  returnType?: string
  visibility?: Visibility
  isStatic?: boolean
  isAbstract?: boolean
}

export type DraftRelKind =
  | 'inherits'     // is a
  | 'implements'   // acts as
  | 'owns'         // owns (composition)
  | 'has'          // has (aggregation)
  | 'has-many'     // has many
  | 'has-one'      // has one
  | 'uses'         // uses (dependency)
  | 'talks-to'     // talks to (bidirectional)
  | 'knows-about'  // knows about (association)

export interface DraftRelationship {
  from: string
  to: string[]
  kind: DraftRelKind
  label?: string
  line: number
}

export type DraftNodeKind = 'class' | 'interface' | 'abstract' | 'enum' | 'note'

export interface DraftNode {
  kind: DraftNodeKind
  name: string
  fields: DraftField[]
  methods: DraftMethod[]
  enumValues: string[]
  noteText?: string
  line: number
}

export interface DraftAST {
  nodes: DraftNode[]
  relationships: DraftRelationship[]
}

export interface ParseError {
  line: number
  message: string
}

export interface ParseResult {
  ast: DraftAST
  errors: ParseError[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function visibilityFromChar(ch: string): Visibility | undefined {
  if (ch === '+' || ch === '-' || ch === '#' || ch === '~') return ch as Visibility
  return undefined
}

function parseFieldList(rest: string): DraftField[] {
  // "name, age: int, $ count: int"
  return rest.split(',').map(s => s.trim()).filter(Boolean).map(tok => {
    const isStatic = tok.startsWith('$')
    tok = isStatic ? tok.slice(1).trim() : tok

    let visibility: Visibility | undefined
    const firstChar = tok[0]
    if (firstChar && visibilityFromChar(firstChar)) {
      visibility = visibilityFromChar(firstChar)
      tok = tok.slice(1).trim()
    }

    const colonIdx = tok.indexOf(':')
    if (colonIdx !== -1) {
      return { name: tok.slice(0, colonIdx).trim(), type: tok.slice(colonIdx + 1).trim(), visibility, isStatic }
    }
    return { name: tok.trim(), visibility, isStatic }
  })
}

function parseMethodList(rest: string): DraftMethod[] {
  // "login, getProfile(): Profile, $ getInstance(): User, abstract draw"
  return rest.split(',').map(s => s.trim()).filter(Boolean).map(tok => {
    const isStatic   = tok.startsWith('$')
    tok = isStatic ? tok.slice(1).trim() : tok

    let isAbstract = false
    if (tok.toLowerCase().startsWith('abstract ')) { isAbstract = true; tok = tok.slice(9).trim() }

    let visibility: Visibility | undefined
    const firstChar = tok[0]
    if (firstChar && visibilityFromChar(firstChar)) {
      visibility = visibilityFromChar(firstChar)
      tok = tok.slice(1).trim()
    }

    // name(params): ReturnType  OR  name(): ReturnType  OR  name
    const parenOpen = tok.indexOf('(')
    const parenClose = tok.indexOf(')')
    if (parenOpen !== -1 && parenClose !== -1) {
      const name      = tok.slice(0, parenOpen).trim()
      const params    = tok.slice(parenOpen + 1, parenClose).trim() || undefined
      const afterParen = tok.slice(parenClose + 1).trim()
      const returnType = afterParen.startsWith(':') ? afterParen.slice(1).trim() : undefined
      return { name, params, returnType, visibility, isStatic, isAbstract }
    }
    // bare name — treat as method
    const colonIdx = tok.indexOf(':')
    if (colonIdx !== -1) {
      return { name: tok.slice(0, colonIdx).trim(), returnType: tok.slice(colonIdx + 1).trim(), visibility, isStatic, isAbstract }
    }
    return { name: tok.trim(), visibility, isStatic, isAbstract }
  })
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parse(text: string): ParseResult {
  const lines  = text.split('\n')
  const errors: ParseError[] = []
  const nodes  = new Map<string, DraftNode>()
  const rels: DraftRelationship[] = []

  let i = 0
  while (i < lines.length) {
    const raw  = lines[i]
    const lineNum = i + 1
    // Strip inline comments
    const commentIdx = raw.indexOf('#')
    const line = (commentIdx >= 0 ? raw.slice(0, commentIdx) : raw).trim()
    i++

    if (!line) continue

    const lower = line.toLowerCase()

    // ── note ──────────────────────────────────────────────────────────────────
    if (lower.startsWith('note ')) {
      const text = line.slice(5).trim().replace(/^["']|["']$/g, '')
      const node: DraftNode = { kind: 'note', name: `note_${lineNum}`, fields: [], methods: [], enumValues: [], noteText: text, line: lineNum }
      nodes.set(node.name, node)
      continue
    }

    // ── interface ─────────────────────────────────────────────────────────────
    if (lower.startsWith('interface ')) {
      const name = line.slice(10).trim().split(/\s/)[0]
      if (!nodes.has(name)) nodes.set(name, { kind: 'interface', name, fields: [], methods: [], enumValues: [], line: lineNum })
      continue
    }

    // ── abstract ──────────────────────────────────────────────────────────────
    if (lower.startsWith('abstract ')) {
      const name = line.slice(9).trim().split(/\s/)[0]
      if (!nodes.has(name)) nodes.set(name, { kind: 'abstract', name, fields: [], methods: [], enumValues: [], line: lineNum })
      continue
    }

    // ── enum ──────────────────────────────────────────────────────────────────
    if (lower.startsWith('enum ')) {
      const parts = line.slice(5).trim().split(/\s+/)
      const name  = parts[0]
      if (!nodes.has(name)) nodes.set(name, { kind: 'enum', name, fields: [], methods: [], enumValues: [], line: lineNum })
      // inline values: enum Status ACTIVE, INACTIVE
      if (parts.length > 1) {
        const vals = parts.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean)
        nodes.get(name)!.enumValues.push(...vals)
      }
      continue
    }

    // ── enum values (continuation after enum declaration) ─────────────────────
    // lines that are ALL_CAPS (enum values)
    if (/^[A-Z_][A-Z0-9_]*(,\s*[A-Z_][A-Z0-9_]*)*$/.test(line)) {
      // find most recently declared enum
      let lastEnum: DraftNode | null = null
      for (const n of nodes.values()) { if (n.kind === 'enum') lastEnum = n }
      if (lastEnum) {
        lastEnum.enumValues.push(...line.split(',').map(s => s.trim()).filter(Boolean))
        continue
      }
    }

    // ── relationships ─────────────────────────────────────────────────────────

    // "X is a Y"
    const isA = line.match(/^(\w+)\s+is\s+a\s+(\w+)$/i)
    if (isA) {
      ensureClass(nodes, isA[1], lineNum)
      ensureClass(nodes, isA[2], lineNum)
      rels.push({ from: isA[1], to: [isA[2]], kind: 'inherits', line: lineNum })
      continue
    }

    // "X acts as Y, Z"
    const actsAs = line.match(/^(\w+)\s+acts\s+as\s+(.+)$/i)
    if (actsAs) {
      ensureClass(nodes, actsAs[1], lineNum)
      const targets = actsAs[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: actsAs[1], to: targets, kind: 'implements', line: lineNum })
      continue
    }

    // "X has many Y"
    const hasMany = line.match(/^(\w+)\s+has\s+many\s+(.+)$/i)
    if (hasMany) {
      ensureClass(nodes, hasMany[1], lineNum)
      const targets = hasMany[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: hasMany[1], to: targets, kind: 'has-many', line: lineNum })
      continue
    }

    // "X has one Y"
    const hasOne = line.match(/^(\w+)\s+has\s+one\s+(.+)$/i)
    if (hasOne) {
      ensureClass(nodes, hasOne[1], lineNum)
      const targets = hasOne[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: hasOne[1], to: targets, kind: 'has-one', line: lineNum })
      continue
    }

    // "X owns Y"
    const owns = line.match(/^(\w+)\s+owns\s+(.+)$/i)
    if (owns) {
      ensureClass(nodes, owns[1], lineNum)
      const targets = owns[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: owns[1], to: targets, kind: 'owns', line: lineNum })
      continue
    }

    // "X has Y" (plain aggregation — after has-many/has-one checked above)
    const has = line.match(/^(\w+)\s+has\s+(.+)$/i)
    if (has) {
      ensureClass(nodes, has[1], lineNum)
      const targets = has[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: has[1], to: targets, kind: 'has', line: lineNum })
      continue
    }

    // "X uses Y, Z"
    const uses = line.match(/^(\w+)\s+uses\s+(.+)$/i)
    if (uses) {
      ensureClass(nodes, uses[1], lineNum)
      const targets = uses[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: uses[1], to: targets, kind: 'uses', line: lineNum })
      continue
    }

    // "X talks to Y"
    const talks = line.match(/^(\w+)\s+talks\s+to\s+(.+)$/i)
    if (talks) {
      ensureClass(nodes, talks[1], lineNum)
      const targets = talks[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: talks[1], to: targets, kind: 'talks-to', line: lineNum })
      continue
    }

    // "X knows about Y"
    const knowsAbout = line.match(/^(\w+)\s+knows\s+about\s+(.+)$/i)
    if (knowsAbout) {
      ensureClass(nodes, knowsAbout[1], lineNum)
      const targets = knowsAbout[2].split(',').map(s => s.trim()).filter(Boolean)
      targets.forEach(t => ensureClass(nodes, t, lineNum))
      rels.push({ from: knowsAbout[1], to: targets, kind: 'knows-about', line: lineNum })
      continue
    }

    // ── field/method declarations ─────────────────────────────────────────────

    // "X knows field1, field2: Type"
    const knows = line.match(/^(\w+)\s+knows\s+(.+)$/i)
    if (knows) {
      const name = knows[1]
      ensureClass(nodes, name, lineNum)
      nodes.get(name)!.fields.push(...parseFieldList(knows[2]))
      continue
    }

    // "X can method1, method2(): ReturnType"
    const can = line.match(/^(\w+)\s+can\s+(.+)$/i)
    if (can) {
      const name = can[1]
      ensureClass(nodes, name, lineNum)
      nodes.get(name)!.methods.push(...parseMethodList(can[2]))
      continue
    }

    // ── bare class name ───────────────────────────────────────────────────────
    if (/^\w+$/.test(line)) {
      ensureClass(nodes, line, lineNum)
      continue
    }

    errors.push({ line: lineNum, message: `Could not understand: "${line}"` })
  }

  return {
    ast: { nodes: [...nodes.values()], relationships: rels },
    errors,
  }
}

function ensureClass(nodes: Map<string, DraftNode>, name: string, line: number) {
  if (!nodes.has(name)) {
    nodes.set(name, { kind: 'class', name, fields: [], methods: [], enumValues: [], line })
  }
}

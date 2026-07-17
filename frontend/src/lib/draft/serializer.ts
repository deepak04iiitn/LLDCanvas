// ─── React Flow nodes + edges → Draft Notation text ──────────────────────────

import type { Node, Edge } from '@xyflow/react'
import type { UMLNodeData, UMLEdgeData, RelationshipType } from '@/types'

const REL_TO_VERB: Record<RelationshipType, string> = {
  inheritance:    'is a',
  realization:    'acts as',
  composition:    'owns',
  aggregation:    'has',
  dependency:     'uses',
  bidirectional:  'talks to',
  association:    'knows about',
}

function visChar(v: string): string {
  return v === '-' ? '-' : v === '#' ? '#' : v === '~' ? '~' : '+'
}

export function serializeToDraft(nodes: Node<UMLNodeData>[], edges: Edge<UMLEdgeData>[]): string {
  const lines: string[] = [
    '# Draft Notation — LLDCanvas',
    '# Learn more: lldcanvas.com/docs',
    '',
  ]

  for (const node of nodes) {
    const d = node.data
    if (!d) continue

    // ── Note ──────────────────────────────────────────────────────────────────
    if (d.nodeType === 'note') {
      lines.push(`note "${d.noteText ?? ''}"`)
      lines.push('')
      continue
    }

    // ── Node header ───────────────────────────────────────────────────────────
    const prefix =
      d.nodeType === 'interface'      ? 'interface ' :
      d.nodeType === 'abstract-class' ? 'abstract '  :
      d.nodeType === 'enum'           ? 'enum '      : ''

    lines.push(`${prefix}${d.name}`)

    // ── Enum values ───────────────────────────────────────────────────────────
    if (d.nodeType === 'enum' && d.attributes.length > 0) {
      lines.push(`  ${d.attributes.map(a => a.name).join(', ')}`)
      lines.push('')
      continue
    }

    // ── Fields ────────────────────────────────────────────────────────────────
    if (d.attributes.length > 0) {
      const fieldParts = d.attributes.map(a => {
        const vis    = a.visibility !== '+' ? `${visChar(a.visibility)} ` : ''
        const stat   = a.isStatic ? '$ ' : ''
        const type   = a.type ? `: ${a.type}` : ''
        return `${stat}${vis}${a.name}${type}`
      })
      lines.push(`${d.name} knows ${fieldParts.join(', ')}`)
    }

    // ── Methods ───────────────────────────────────────────────────────────────
    if (d.methods.length > 0) {
      const methodParts = d.methods.map(m => {
        const vis    = m.visibility !== '+' ? `${visChar(m.visibility)} ` : ''
        const stat   = m.isStatic   ? '$ '        : ''
        const abst   = m.isAbstract ? 'abstract '  : ''
        const params = m.params     ? `(${m.params})` : '()'
        const ret    = m.returnType && m.returnType !== 'void' ? `: ${m.returnType}` : ''
        return `${stat}${abst}${vis}${m.name}${params}${ret}`
      })
      lines.push(`${d.name} can ${methodParts.join(', ')}`)
    }

    lines.push('')
  }

  // ── Relationships ─────────────────────────────────────────────────────────
  if (edges.length > 0) {
    lines.push('# Relationships')
    for (const edge of edges) {
      const relType = (edge.data as UMLEdgeData | undefined)?.relationshipType
      if (!relType) continue
      const verb = REL_TO_VERB[relType]
      if (!verb) continue

      const src    = edge.source
      const tgt    = edge.target
      const sm     = (edge.data as UMLEdgeData | undefined)?.sourceMultiplicity
      const tm     = (edge.data as UMLEdgeData | undefined)?.targetMultiplicity
      const label  = (edge.data as UMLEdgeData | undefined)?.label

      // Choose more specific verb for multiplicity
      let finalVerb = verb
      if (relType === 'aggregation') {
        if (tm === '*')  finalVerb = 'has many'
        else if (tm === '1') finalVerb = 'has one'
        else finalVerb = 'has'
      }

      const labelPart = label ? ` # ${label}` : ''
      lines.push(`${src} ${finalVerb} ${tgt}${labelPart}`)
    }
  }

  return lines.join('\n').trimEnd() + '\n'
}

import type { UMLNodeData, UMLEdgeData, RelationshipType } from '@/types'
import type { Node, Edge } from '@xyflow/react'

// Maps LLDCanvas relationship types → Mermaid classDiagram arrow syntax
const MERMAID_ARROW: Record<RelationshipType, string> = {
  association:   '--',
  bidirectional: '<-->',
  aggregation:   'o--',
  composition:   '*--',
  inheritance:   '--|>',
  realization:   '..|>',
  dependency:    '..>',
}

// Visibility UML glyph → Mermaid notation (+/-/#/~)
// UML glyphs are already the Mermaid notation, so we pass them through directly.

function sanitizeName(name: string): string {
  // Mermaid class names must be alphanumeric (no spaces, generics angle-brackets, etc.)
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

export function toMermaid(nodes: Node<UMLNodeData>[], edges: Edge<UMLEdgeData>[]): string {
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const lines: string[] = ['classDiagram']

  for (const node of nodes) {
    const d = node.data
    if (d.nodeType === 'note') continue   // Notes have no Mermaid equivalent

    const rawName = d.genericParam ? `${d.name}~${d.genericParam}~` : d.name
    const safeName = sanitizeName(rawName)

    // Class annotation: <<interface>>, <<abstract>>, <<enumeration>>, <<stereotype>>
    if (d.nodeType === 'interface') {
      lines.push(`  class ${safeName} {`)
      lines.push(`    <<interface>>`)
    } else if (d.nodeType === 'abstract-class') {
      lines.push(`  class ${safeName} {`)
      lines.push(`    <<abstract>>`)
    } else if (d.nodeType === 'enum') {
      lines.push(`  class ${safeName} {`)
      lines.push(`    <<enumeration>>`)
    } else {
      lines.push(`  class ${safeName} {`)
      if (d.stereotype) lines.push(`    <<${d.stereotype}>>`)
    }

    // Attributes
    for (const attr of d.attributes) {
      const static_ = attr.isStatic ? '$' : ''
      lines.push(`    ${attr.visibility}${attr.type} ${attr.name}${static_}`)
    }

    // Methods
    for (const method of d.methods) {
      const abstract_ = method.isAbstract ? '*' : ''
      const static_ = method.isStatic ? '$' : ''
      const params = method.params ?? ''
      lines.push(`    ${method.visibility}${method.name}(${params}) ${method.returnType}${abstract_}${static_}`)
    }

    lines.push('  }')
  }

  if (lines.length > 1) lines.push('')   // blank line between classes and relationships

  for (const edge of edges) {
    const srcNode = nodeById.get(edge.source)
    const tgtNode = nodeById.get(edge.target)
    if (!srcNode || !tgtNode) continue
    if (srcNode.data.nodeType === 'note' || tgtNode.data.nodeType === 'note') continue

    const src = sanitizeName(srcNode.data.name)
    const tgt = sanitizeName(tgtNode.data.name)
    const rel = (edge.data as UMLEdgeData)?.relationshipType ?? 'association'
    const arrow = MERMAID_ARROW[rel] ?? '--'
    const srcMul = edge.data?.sourceMultiplicity ? ` "${edge.data.sourceMultiplicity}"` : ''
    const tgtMul = edge.data?.targetMultiplicity ? ` "${edge.data.targetMultiplicity}"` : ''

    lines.push(`  ${src}${srcMul} ${arrow}${tgtMul} ${tgt}`)
  }

  return lines.join('\n')
}

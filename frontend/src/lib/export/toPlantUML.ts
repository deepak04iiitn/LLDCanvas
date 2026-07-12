import { UMLNodeData, UMLEdgeData, RelationshipType } from '@/types'
import type { Node, Edge } from '@xyflow/react'

const ARROW_MAP: Record<RelationshipType, string> = {
  association: '--',
  bidirectional: '<-->',
  aggregation: 'o--',
  composition: '*--',
  inheritance: '--|>',
  realization: '..|>',
  dependency: '..>',
}

export function toPlantUML(nodes: Node<UMLNodeData>[], edges: Edge<UMLEdgeData>[]): string {
  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const lines: string[] = ['@startuml', '']

  for (const node of nodes) {
    const d = node.data
    const name = d.genericParam ? `${d.name}<${d.genericParam}>` : d.name

    if (d.nodeType === 'interface') {
      lines.push(`interface ${name} {`)
    } else if (d.nodeType === 'abstract-class') {
      lines.push(`abstract class ${name} {`)
    } else if (d.nodeType === 'enum') {
      lines.push(`enum ${name} {`)
    } else {
      const stereo = d.stereotype ? ` <<${d.stereotype}>>` : ''
      lines.push(`class ${name}${stereo} {`)
    }

    for (const attr of d.attributes) {
      const static_ = attr.isStatic ? '{static} ' : ''
      lines.push(`  ${static_}${attr.visibility}${attr.name} : ${attr.type}`)
    }

    for (const method of d.methods) {
      const static_ = method.isStatic ? '{static} ' : ''
      const abstract_ = method.isAbstract ? '{abstract} ' : ''
      lines.push(`  ${static_}${abstract_}${method.visibility}${method.name}(${method.params}) : ${method.returnType}`)
    }

    lines.push('}')
    lines.push('')
  }

  for (const edge of edges) {
    const src = nodeById.get(edge.source)?.data.name
    const tgt = nodeById.get(edge.target)?.data.name
    if (!src || !tgt) continue

    const rel = (edge.data as UMLEdgeData)?.relationshipType ?? 'association'
    const arrow = ARROW_MAP[rel] ?? '--'
    const srcMul = edge.data?.sourceMultiplicity ? `"${edge.data.sourceMultiplicity}" ` : ''
    const tgtMul = edge.data?.targetMultiplicity ? ` "${edge.data.targetMultiplicity}"` : ''

    lines.push(`${src} ${srcMul}${arrow}${tgtMul} ${tgt}`)
  }

  lines.push('')
  lines.push('@enduml')
  return lines.join('\n')
}

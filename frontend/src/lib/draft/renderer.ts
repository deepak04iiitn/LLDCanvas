// ─── Draft Notation → React Flow nodes + edges ───────────────────────────────

import { nanoid } from 'nanoid'
import type { Node, Edge } from '@xyflow/react'
import type { DraftAST, DraftNode, DraftRelKind } from './parser'
import type { UMLNodeData, UMLEdgeData, RelationshipType } from '@/types'

// ── Layout constants ──────────────────────────────────────────────────────────
const COL_WIDTH  = 260
const ROW_HEIGHT = 200
const GAP_X      = 80
const GAP_Y      = 80
const COLS       = 4

// ── Relationship mapping ──────────────────────────────────────────────────────
const REL_MAP: Record<DraftRelKind, RelationshipType> = {
  'inherits':    'inheritance',
  'implements':  'realization',
  'owns':        'composition',
  'has':         'aggregation',
  'has-many':    'aggregation',
  'has-one':     'aggregation',
  'uses':        'dependency',
  'talks-to':    'bidirectional',
  'knows-about': 'association',
}

// ── Node kind → UML node type ─────────────────────────────────────────────────
function toNodeType(kind: DraftNode['kind']): UMLNodeData['nodeType'] {
  switch (kind) {
    case 'interface': return 'interface'
    case 'abstract':  return 'abstract-class'
    case 'enum':      return 'enum'
    case 'note':      return 'note'
    default:          return 'class'
  }
}

// ── Auto-layout: arrange nodes in a grid ─────────────────────────────────────
function autoLayout(names: string[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  names.forEach((name, idx) => {
    const col = idx % COLS
    const row = Math.floor(idx / COLS)
    positions.set(name, {
      x: col * (COL_WIDTH + GAP_X),
      y: row * (ROW_HEIGHT + GAP_Y),
    })
  })
  return positions
}

// ── Pick a handle side per edge from the two nodes' actual grid positions ────
// Without this, every edge falls back to React Flow's default (the node's
// "top" handle for both ends, regardless of layout) — which is exactly how a
// row of related classes ends up with every relationship line bunched onto
// the same anchor point instead of running between the boxes it connects.
type HandleSide = 'top' | 'right' | 'bottom' | 'left'
function pickHandles(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { sourceHandle: HandleSide; targetHandle: HandleSide } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' }
  }
  return dy >= 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' }
}

// ── Main renderer ─────────────────────────────────────────────────────────────
export function renderToFlow(ast: DraftAST): { nodes: Node<UMLNodeData>[]; edges: Edge<UMLEdgeData>[] } {
  const positions = autoLayout(ast.nodes.map(n => n.name))

  const rfNodes: Node<UMLNodeData>[] = ast.nodes.map(draftNode => {
    const pos = positions.get(draftNode.name) ?? { x: 0, y: 0 }
    const nodeType = toNodeType(draftNode.kind)

    return {
      id:       draftNode.name,
      type:     nodeType,
      position: pos,
      data: {
        nodeType,
        name:        draftNode.kind === 'note' ? '' : draftNode.name,
        noteText:    draftNode.noteText,
        attributes:  draftNode.fields.map(f => ({
          id:         nanoid(6),
          visibility: f.visibility ?? '+',
          name:       f.name,
          type:       f.type ?? '',
          isStatic:   f.isStatic ?? false,
        })),
        methods: draftNode.methods.map(m => ({
          id:          nanoid(6),
          visibility:  m.visibility ?? '+',
          name:        m.name,
          params:      m.params ?? '',
          returnType:  m.returnType ?? 'void',
          isStatic:    m.isStatic ?? false,
          isAbstract:  m.isAbstract ?? false,
        })),
        // Enum values stored as attributes with empty type
        ...(draftNode.kind === 'enum' ? {
          attributes: draftNode.enumValues.map(v => ({
            id: nanoid(6), visibility: '+' as const, name: v, type: '', isStatic: false,
          })),
          methods: [],
        } : {}),
      } as UMLNodeData,
    }
  })

  const rfEdges: Edge<UMLEdgeData>[] = []
  for (const rel of ast.relationships) {
    for (const target of rel.to) {
      const relType = REL_MAP[rel.kind]
      const fromPos = positions.get(rel.from) ?? { x: 0, y: 0 }
      const toPos   = positions.get(target) ?? { x: 0, y: 0 }
      const { sourceHandle, targetHandle } = pickHandles(fromPos, toPos)
      rfEdges.push({
        id:     nanoid(8),
        source: rel.from,
        target,
        sourceHandle,
        targetHandle,
        type:   relType,
        data: {
          relationshipType: relType,
          label:            rel.label,
        } as UMLEdgeData,
      })
    }
  }

  return { nodes: rfNodes, edges: rfEdges }
}

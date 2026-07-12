import { UMLClassNode } from './UMLClassNode'
import { NoteNode } from './NoteNode'

// NodeTypes map — cast is required because React Flow's generic NodeTypes expects
// Record<string, unknown> data, but our components accept typed UMLNodeData.
// This is the standard React Flow pattern for typed custom nodes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: Record<string, any> = {
  class: UMLClassNode,
  interface: UMLClassNode,
  'abstract-class': UMLClassNode,
  enum: UMLClassNode,
  note: NoteNode,
}

'use client'

/**
 * RoguelikeCanvas — full UML editing experience embedded in the Roguelike run.
 *
 * Reuses:
 *   CanvasView       — the real React Flow canvas with alignment guides, eraser, etc.
 *   nodeTypes        — UML class / interface / abstract / enum / note nodes
 *   edgeTypes        — all 7 UML relationship edge types
 *   RelationshipPicker — the relationship chooser that pops up on connect
 *   EditorProvider   — lightweight context for theme / zoom / panel state
 *
 * Does NOT reuse EditorShell (topbar, left panel, collab, autosave, history).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

import { EditorProvider } from '@/contexts/EditorContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { RelationshipPicker } from '@/components/canvas/RelationshipPicker'
import { resetConnectionDraft, getConnectionDraftWaypoints } from '@/lib/connectionDraft'
import type { RelationshipType, UMLNodeData } from '@/types'
import { cn } from '@/lib/utils'

// ── Re-exported types (keep RunPlayer's import unchanged) ─────────────────────
export interface SimpleNode {
  id: string; x: number; y: number; label: string
  type?: 'class' | 'interface' | 'service' | 'database'
}
export interface SimpleEdge {
  id: string; source: string; target: string; label?: string
  type?: 'uses' | 'implements' | 'extends' | 'depends'
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  nodes: SimpleNode[]
  edges: SimpleEdge[]
  onChange: (nodes: SimpleNode[], edges: SimpleEdge[]) => void
  readOnly?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeUMLNode(
  nodeType: UMLNodeData['nodeType'],
  rfInstance: ReactFlowInstance | null,
): Node {
  const centre = rfInstance
    ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    : { x: 200, y: 200 }
  const jitter = () => Math.random() * 40 - 20
  const nameMap: Record<UMLNodeData['nodeType'], string> = {
    class: 'ClassName', interface: 'InterfaceName',
    enum: 'EnumName', 'abstract-class': 'AbstractClass', note: '',
  }
  if (nodeType === 'note') {
    return {
      id: nanoid(8), type: 'note', selected: true,
      position: { x: centre.x + jitter(), y: centre.y + jitter() },
      data: { nodeType: 'note', name: 'note', attributes: [], methods: [], noteText: '' },
    }
  }
  return {
    id: nanoid(8), type: nodeType,
    position: { x: centre.x - 90 + jitter(), y: centre.y - 60 + jitter() },
    data: { nodeType, name: nameMap[nodeType], attributes: [], methods: [], alwaysExpanded: true },
  }
}

// Convert RF nodes → SimpleNode (for RunPlayer)
function toSimpleNodes(rfNodes: Node[]): SimpleNode[] {
  return rfNodes.map(n => ({
    id: n.id,
    x: n.position.x,
    y: n.position.y,
    label: (n.data as UMLNodeData).name ?? '',
    type: 'class' as const,
  }))
}
function toSimpleEdges(rfEdges: Edge[]): SimpleEdge[] {
  return rfEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: typeof e.label === 'string' ? e.label : undefined,
    type: 'uses' as const,
  }))
}

// ── Toolbar node buttons ───────────────────────────────────────────────────────
const NODE_BUTTONS: { type: UMLNodeData['nodeType']; label: string }[] = [
  { type: 'class',          label: 'Class' },
  { type: 'interface',      label: 'Interface' },
  { type: 'abstract-class', label: 'Abstract' },
  { type: 'enum',           label: 'Enum' },
]

type CanvasMode = 'pan' | 'select' | 'eraser'

// ── Inner (needs ReactFlowProvider + EditorProvider ancestors) ─────────────────
function CanvasInner({ onChange, readOnly }: Omit<Props, 'nodes' | 'edges'>) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [canvasMode, setCanvasMode]       = useState<CanvasMode>('pan')
  const [pendingConn, setPendingConn]     = useState<Connection | null>(null)
  const [pickerOpen, setPickerOpen]       = useState(false)
  const [pickerPos, setPickerPos]         = useState({ x: 0, y: 0 })
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const { getNodes, flowToScreenPosition } = useReactFlow()

  // Notify RunPlayer after state settles — never during render
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const skipFirst = useRef(true)
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return }
    onChangeRef.current(toSimpleNodes(nodes), toSimpleEdges(edges))
  }, [nodes, edges])

  // ── Add node ────────────────────────────────────────────────────────────────
  function insertNode(nodeType: UMLNodeData['nodeType']) {
    setNodes(prev => [...prev, makeUMLNode(nodeType, rfInstance.current)])
  }

  // ── Connect nodes → RelationshipPicker ──────────────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    const isSameHandle = params.source === params.target && params.sourceHandle === params.targetHandle
    const isDupe = edges.some(e =>
      e.source === params.source && e.target === params.target &&
      (e.sourceHandle ?? null) === (params.sourceHandle ?? null) &&
      (e.targetHandle ?? null) === (params.targetHandle ?? null),
    )
    if (isSameHandle || isDupe) { if (isDupe) toast.info('That relationship already exists'); return }

    setPendingConn(params)
    const all = getNodes()
    const src = all.find(n => n.id === params.source)
    const tgt = all.find(n => n.id === params.target)
    let pos = { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 160 }
    if (src && tgt) {
      const midX = (src.position.x + (src.measured?.width ?? 180) / 2 + tgt.position.x + (tgt.measured?.width ?? 180) / 2) / 2
      const midY = (src.position.y + (src.measured?.height ?? 100) / 2 + tgt.position.y + (tgt.measured?.height ?? 100) / 2) / 2
      const screen = flowToScreenPosition({ x: midX, y: midY })
      pos = { x: screen.x - 130, y: screen.y - 80 }
    }
    setPickerPos(pos)
    setPickerOpen(true)
  }, [edges, getNodes, flowToScreenPosition])

  const onRelationshipPick = useCallback((relType: RelationshipType) => {
    if (!pendingConn) return
    const waypoints = getConnectionDraftWaypoints()   // capture BEFORE reset
    resetConnectionDraft()
    setEdges(eds => addEdge({
      ...pendingConn,
      id: nanoid(8),
      type: relType,
      data: {
        relationshipType: relType,
        waypoints: waypoints.length > 0 ? waypoints : undefined,
      },
    }, eds))
    setPendingConn(null)
    setPickerOpen(false)
  }, [pendingConn, setEdges])

  // ── Selection ops ────────────────────────────────────────────────────────────
  const selectedCount = nodes.filter(n => n.selected).length + edges.filter(e => e.selected).length

  const handleDelete = useCallback(() => {
    setNodes(nds => nds.filter(n => !n.selected))
    setEdges(eds => eds.filter(e => !e.selected))
  }, [setNodes, setEdges])

  const handleDuplicate = useCallback(() => {
    const sel = nodes.filter(n => n.selected)
    setNodes(prev => [...prev, ...sel.map(n => ({
      ...n, id: nanoid(8), selected: false,
      position: { x: n.position.x + 40, y: n.position.y + 40 },
    }))])
  }, [nodes, setNodes])

  const handleClearSelection = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: false })))
    setEdges(eds => eds.map(e => ({ ...e, selected: false })))
  }, [setNodes, setEdges])

  const handleEraseNode = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id))
  }, [setNodes])

  const handleEraseEdge = useCallback((id: string) => {
    setEdges(eds => eds.filter(e => e.id !== id))
  }, [setEdges])

  const onConnectStart = useCallback(() => { resetConnectionDraft() }, [])

  return (
    <div className="relative h-full overflow-hidden">
      {/* ── Canvas fills everything ───────────────────────────────────────── */}
      <CanvasView
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={readOnly ? () => {} : onConnect}
        onConnectStart={readOnly ? undefined : onConnectStart}
        onInit={inst => { rfInstance.current = inst }}
        canvasMode={canvasMode}
        selectedCount={selectedCount}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onClearSelection={handleClearSelection}
        onEraseNode={handleEraseNode}
        onEraseEdge={handleEraseEdge}
        readOnly={readOnly}
      />

      <RelationshipPicker
        open={pickerOpen}
        position={pickerPos}
        onSelect={onRelationshipPick}
        onClose={() => { setPickerOpen(false); setPendingConn(null) }}
      />

      {/* ── Floating left toolbar ─────────────────────────────────────────── */}
      {!readOnly && (
        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex flex-col gap-0.5 rounded-2xl border border-hairline bg-paper/92 p-1.5 shadow-md backdrop-blur-md">
          {/* Add node buttons */}
          {NODE_BUTTONS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => insertNode(type)}
              title={`Add ${label}`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-brand-tint hover:text-brand"
            >
              <span className="text-[9px] font-bold leading-none text-ink-faint">+</span>
              {label}
            </button>
          ))}

          <div className="mx-2 my-1 h-px bg-hairline" />

          {/* Mode buttons */}
          {([
            { mode: 'pan'    as CanvasMode, label: 'Pan'    },
            { mode: 'select' as CanvasMode, label: 'Select' },
            { mode: 'eraser' as CanvasMode, label: 'Erase'  },
          ]).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setCanvasMode(mode)}
              title={label}
              className={cn(
                'rounded-xl px-3 py-1.5 text-left text-[11px] font-medium transition-colors',
                canvasMode === mode
                  ? 'bg-brand/10 text-brand'
                  : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────
export function RoguelikeCanvas(props: Props) {
  return (
    <EditorProvider>
      <ReactFlowProvider>
        <CanvasInner onChange={props.onChange} readOnly={props.readOnly} />
      </ReactFlowProvider>
    </EditorProvider>
  )
}

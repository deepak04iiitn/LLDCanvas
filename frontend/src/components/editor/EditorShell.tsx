'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodesDelete,
  type ReactFlowInstance,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

import { EditorProvider, useEditor } from '@/contexts/EditorContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { RelationshipPicker } from '@/components/canvas/RelationshipPicker'
import { Topbar } from '@/components/editor/Topbar'
import { LeftPanel } from '@/components/editor/LeftPanel'
import { Statusbar } from '@/components/editor/Statusbar'
import { useHistoryStack } from '@/hooks/useHistoryStack'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAutosave } from '@/hooks/useAutosave'
import type { DiagramData, UMLNodeData, UMLEdgeData, RelationshipType, CanvasTheme } from '@/types'
import { exportPNG } from '@/lib/export/toPNG'
import { toPlantUML } from '@/lib/export/toPlantUML'

interface EditorShellProps {
  diagramId: string | null
  initialTitle: string
  initialData: DiagramData | null
  onRename?: (title: string) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEmptyDiagram(): DiagramData {
  return { version: 1, nodes: [], edges: [], meta: { theme: 'light', zoom: 1, panX: 0, panY: 0 } }
}

function makeCentreNode(
  nodeType: UMLNodeData['nodeType'],
  rfInstance: ReactFlowInstance | null,
): Node<UMLNodeData> {
  const centre = rfInstance
    ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    : { x: 200, y: 200 }

  const jitter = () => Math.random() * 24 - 12

  const nameMap: Record<UMLNodeData['nodeType'], string> = {
    class: 'ClassName',
    interface: 'InterfaceName',
    enum: 'EnumName',
    'abstract-class': 'AbstractClass',
    note: '',
  }

  if (nodeType === 'note') {
    return {
      id: nanoid(8),
      type: 'note',
      position: { x: centre.x + jitter(), y: centre.y + jitter() },
      data: { nodeType: 'note', name: 'note', attributes: [], methods: [], noteText: '', isEditing: true },
    }
  }

  return {
    id: nanoid(8),
    type: nodeType,
    position: { x: centre.x - 90 + jitter(), y: centre.y - 60 + jitter() },
    data: { nodeType, name: nameMap[nodeType], attributes: [], methods: [], isEditing: true } as UMLNodeData,
  }
}

// ─── Inner editor ─────────────────────────────────────────────────────────────

interface EditorInnerProps {
  diagramId: string | null
  initialTitle: string
  initialNodes: Node[]
  initialEdges: Edge[]
  onRename?: (title: string) => Promise<void>
}

function EditorInner({ diagramId, initialTitle, initialNodes, initialEdges, onRename }: EditorInnerProps) {
  const { theme, togglePanel } = useEditor()
  const { getNodes, flowToScreenPosition } = useReactFlow()
  const [title, setTitle] = useState(initialTitle)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const history = useHistoryStack()

  // ── Relationship picker state ─────────────────────────────────────────────
  const [pendingConn, setPendingConn] = useState<Connection | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 })

  // ── Autosave ──────────────────────────────────────────────────────────────
  const vp = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 }
  const diagramData: DiagramData = {
    version: 1,
    nodes: nodes as unknown[],
    edges: edges as unknown[],
    meta: { theme, zoom: vp.zoom, panX: vp.x, panY: vp.y },
  }
  useAutosave(diagramId, diagramData)

  // ── Connect — open relationship picker instead of creating edge immediately
  const onConnect = useCallback(
    (params: Connection) => {
      setPendingConn(params)

      // Position picker between source and target nodes
      const allNodes = getNodes()
      const src = allNodes.find(n => n.id === params.source)
      const tgt = allNodes.find(n => n.id === params.target)

      let pos = { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 160 }

      if (src && tgt) {
        const midX = (src.position.x + (src.measured?.width ?? 180) / 2 +
                      tgt.position.x + (tgt.measured?.width ?? 180) / 2) / 2
        const midY = (src.position.y + (src.measured?.height ?? 100) / 2 +
                      tgt.position.y + (tgt.measured?.height ?? 100) / 2) / 2
        const screen = flowToScreenPosition({ x: midX, y: midY })
        pos = { x: screen.x - 130, y: screen.y - 80 }
      }

      setPickerPos(pos)
      setPickerOpen(true)
    },
    [getNodes, flowToScreenPosition],
  )

  // ── Confirm relationship type from picker ─────────────────────────────────
  const onRelationshipPick = useCallback(
    (relType: RelationshipType) => {
      if (!pendingConn) return
      history.push({ nodes, edges })
      setEdges(eds =>
        addEdge(
          {
            ...pendingConn,
            id: nanoid(8),
            type: relType,
            data: {
              relationshipType: relType,
              sourceMultiplicity: undefined,
              targetMultiplicity: undefined,
            } satisfies UMLEdgeData,
          },
          eds,
        ),
      )
      setPendingConn(null)
      setPickerOpen(false)
    },
    [pendingConn, history, nodes, edges, setEdges],
  )

  // ── Insert node ───────────────────────────────────────────────────────────
  const insertNode = useCallback(
    (nodeType: UMLNodeData['nodeType']) => {
      const node = makeCentreNode(nodeType, rfInstance.current)
      history.push({ nodes, edges })
      setNodes(prev => [...prev, node as Node])
    },
    [history, nodes, edges, setNodes],
  )

  // ── Delete selected ───────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const allNodes = getNodes()
    const selected = allNodes.filter(n => n.selected)
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map(n => n.id))
    history.push({ nodes, edges })
    setNodes(nds => nds.filter(n => !selectedIds.has(n.id)))
    setEdges(eds => eds.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)))
  }, [getNodes, history, nodes, edges, setNodes, setEdges])

  const onNodesDelete: OnNodesDelete = useCallback(
    deleted => { if (deleted.length > 0) history.push({ nodes, edges }) },
    [history, nodes, edges],
  )

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const prev = history.undo({ nodes, edges })
    if (prev) { setNodes(prev.nodes); setEdges(prev.edges) }
  }, [history, nodes, edges, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    const next = history.redo({ nodes, edges })
    if (next) { setNodes(next.nodes); setEdges(next.edges) }
  }, [history, nodes, edges, setNodes, setEdges])

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportPNG = useCallback(async () => {
    try { await exportPNG(theme); toast.success('Exported as PNG') }
    catch { toast.error('Export failed') }
  }, [theme])

  const handleExportSVG = useCallback(() => toast('SVG export coming in Phase 6'), [])

  const handleExportPlantUML = useCallback(() => {
    const text = toPlantUML(nodes as RFNode<UMLNodeData>[], edges as RFEdge<UMLEdgeData>[])
    navigator.clipboard.writeText(text).then(() => toast.success('PlantUML copied to clipboard'))
  }, [nodes, edges])

  // ── Rename ────────────────────────────────────────────────────────────────
  const handleRename = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle)
      try { await onRename?.(newTitle) } catch { /* silent */ }
    },
    [onRename],
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({
    onAddClass:           () => insertNode('class'),
    onAddInterface:       () => insertNode('interface'),
    onAddEnum:            () => insertNode('enum'),
    onAddAbstract:        () => insertNode('abstract-class'),
    onDelete:             handleDelete,
    onDuplicate:          () => {/* Phase 6 */ },
    onUndo:               handleUndo,
    onRedo:               handleRedo,
    onOpenCommandPalette: () => {/* Phase 6 */ },
    onFitView:            () => rfInstance.current?.fitView({ padding: 0.12, duration: 400 }),
    onTogglePanel:        togglePanel,
    onCopy:               () => {/* Phase 6 */ },
    onPaste:              () => {/* Phase 6 */ },
  })

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" data-theme={theme}>
      <Topbar
        title={title}
        onRename={handleRename}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportPlantUML={handleExportPlantUML}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          onAddClass={() => insertNode('class')}
          onAddInterface={() => insertNode('interface')}
          onAddEnum={() => insertNode('enum')}
          onAddAbstract={() => insertNode('abstract-class')}
          onAddNote={() => insertNode('note')}
        />

        <main className="relative flex-1 overflow-hidden">
          <CanvasView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={inst => { rfInstance.current = inst }}
            onNodesDelete={onNodesDelete}
          />

          {/* Relationship picker portal — outside canvas, above everything */}
          <RelationshipPicker
            open={pickerOpen}
            position={pickerPos}
            onSelect={onRelationshipPick}
            onClose={() => { setPickerOpen(false); setPendingConn(null) }}
          />
        </main>
      </div>

      <Statusbar />
    </div>
  )
}

// ─── Public shell ─────────────────────────────────────────────────────────────
export function EditorShell({ diagramId, initialTitle, initialData, onRename }: EditorShellProps) {
  const data = initialData ?? makeEmptyDiagram()
  const initialTheme = (data.meta?.theme ?? 'light') as CanvasTheme
  const initialNodes = (data.nodes ?? []) as Node[]
  const initialEdges = (data.edges ?? []) as Edge[]

  return (
    <EditorProvider initialTheme={initialTheme}>
      <ReactFlowProvider>
        <EditorInner
          diagramId={diagramId}
          initialTitle={initialTitle}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onRename={onRename}
        />
      </ReactFlowProvider>
    </EditorProvider>
  )
}

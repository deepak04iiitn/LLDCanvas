'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  type ReactFlowInstance,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

import { EditorProvider, useEditor } from '@/contexts/EditorContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { Topbar } from '@/components/editor/Topbar'
import { LeftPanel } from '@/components/editor/LeftPanel'
import { Statusbar } from '@/components/editor/Statusbar'
import { useHistoryStack } from '@/hooks/useHistoryStack'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAutosave } from '@/hooks/useAutosave'
import type { DiagramData, UMLNodeData, UMLEdgeData, CanvasTheme } from '@/types'
import { exportPNG } from '@/lib/export/toPNG'
import { toPlantUML } from '@/lib/export/toPlantUML'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'

interface EditorShellProps {
  diagramId: string | null         // null = local mode
  initialTitle: string
  initialData: DiagramData | null
  onRename?: (title: string) => Promise<void>
}

// ─── Default empty state ──────────────────────────────────────────────────────
function makeEmptyDiagram(): DiagramData {
  return {
    version: 1,
    nodes: [],
    edges: [],
    meta: { theme: 'light', zoom: 1, panX: 0, panY: 0 },
  }
}

// ─── Helper: create a blank UML class node centred in viewport ────────────────
function makeCentreNode(
  nodeType: UMLNodeData['nodeType'],
  rfInstance: ReactFlowInstance | null,
): Node<UMLNodeData> {
  const centre = rfInstance
    ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    : { x: 200, y: 200 }

  const defaults: Record<UMLNodeData['nodeType'], Partial<UMLNodeData>> = {
    class:          { name: 'NewClass',    stereotype: undefined },
    interface:      { name: 'NewInterface', stereotype: 'interface' },
    enum:           { name: 'NewEnum',     stereotype: 'enum' },
    'abstract-class': { name: 'NewAbstractClass', stereotype: undefined },
  }

  return {
    id: nanoid(8),
    type: nodeType,
    position: {
      x: centre.x - 90 + Math.random() * 32 - 16,
      y: centre.y - 60 + Math.random() * 32 - 16,
    },
    data: {
      nodeType,
      ...defaults[nodeType],
      attributes: [],
      methods: [],
    } as UMLNodeData,
  }
}

// ─── Inner editor — needs to be inside ReactFlowProvider ─────────────────────
interface EditorInnerProps {
  diagramId: string | null
  initialTitle: string
  initialNodes: Node[]
  initialEdges: Edge[]
  onRename?: (title: string) => Promise<void>
}

function EditorInner({
  diagramId,
  initialTitle,
  initialNodes,
  initialEdges,
  onRename,
}: EditorInnerProps) {
  const { theme, togglePanel } = useEditor()
  const [title, setTitle] = useState(initialTitle)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const history = useHistoryStack()

  // ── Autosave (uses the existing hook signature) ───────────────────────────
  const vp = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 }
  const diagramData: DiagramData = {
    version: 1,
    nodes: nodes as unknown[],
    edges: edges as unknown[],
    meta: { theme, zoom: vp.zoom, panX: vp.x, panY: vp.y },
  }
  useAutosave(diagramId, diagramData)

  // ── Connection ────────────────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges],
  )

  // ── Insert helpers ────────────────────────────────────────────────────────
  function insertNode(nodeType: UMLNodeData['nodeType']) {
    const node = makeCentreNode(nodeType, rfInstance.current)
    history.push({ nodes, edges })
    setNodes(prev => [...prev, node as Node])
  }

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
    try {
      await exportPNG(theme)
      toast.success('Exported as PNG')
    } catch {
      toast.error('Export failed')
    }
  }, [theme])

  const handleExportSVG = useCallback(() => {
    toast('SVG export coming in Phase 6')
  }, [])

  const handleExportPlantUML = useCallback(() => {
    const typedNodes = nodes as RFNode<UMLNodeData>[]
    const typedEdges = edges as RFEdge<UMLEdgeData>[]
    const text = toPlantUML(typedNodes, typedEdges)
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
    onDelete:             () => {/* Phase 4 — node deletion */ },
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
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      data-theme={theme}
    >
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
          onAddNote={() => toast('Notes coming in Phase 4')}
        />

        <main className="relative flex-1 overflow-hidden">
          <CanvasView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={inst => { rfInstance.current = inst }}
          />
        </main>
      </div>

      <Statusbar />
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────
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
